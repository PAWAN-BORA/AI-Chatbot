import { NextRequest, NextResponse } from "next/server";
import {ChatOllama, Ollama } from "@langchain/ollama";
import {START, END, MessagesAnnotation, StateGraph, MemorySaver, PregelOptions, StateType, PregelNode} from "@langchain/langgraph";
import { isAIMessageChunk } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
// const modelName = "deepseek-r1:1.5b";
// const modelName = "deepseek-r1:8b";
const modelName = "llama3.2:3b";
// const modelName = "llama3.1";

// const llm = new Ollama({
//   baseUrl: "http://192.168.1.37:11434",
//   model: modelName, // Default value
//   temperature: 0,
//   maxRetries: 2,
//   // other params...
// });
const llm = new ChatOllama({
  baseUrl: "http://172.24.64.1:11434",
  model: modelName, // Default value
  temperature: 0,
  maxRetries: 2,
  // disableStreaming:true,
  // other params...
});


// Define the function that calls the model
const callModel = async (state:typeof MessagesAnnotation.State)=>{
  const res = await llm.invoke(state.messages);
  // console.log('this is res...', res);
  // return {messages:[res]}
  return {messages:res}
  // return {}
};


// const unstreamed = RunnableLambda.from(unstreamed)
// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
.addNode("model", callModel)
.addEdge(START, "model")
.addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({checkpointer:memory});

export async function POST(req:NextRequest){


  let data = await req.json();
  try {
    const encoder = new TextEncoder();

    // const config = {configurable:{thread_id:"abc"}, streamMode:"updates"};
    const input = [
      {role:"user", content:data.ques},
    ];
    const config = {
      configurable: {
        thread_id: "stream_events",
      },
      streamMode:"messages" as const
    };
    const stream = await app.stream({messages:input}, config);
    // console.log(stream, 'stream..')
    // const messages = await app.stream({messages:input}, {configurable:{thread_id:"abc"}});
    // console.log(messages);
    // for await (const [message, _metadata] of stream){
    //    if (isAIMessageChunk(message) && message.tool_call_chunks?.length) {
    //     console.log(`${message.getType()} MESSAGE TOOL CALL CHUNK: ${message.tool_call_chunks[0].args}`);
    //   } else {
    //     console.log(`${message.getType()} MESSAGE CONTENT: ${message.content}`);
    //   }
    // }
    let readableStream = new ReadableStream({
      async start(controller){
        try{
          for await (const [chunk, _metadata] of stream){
            let content = chunk.content;
            // console.log(isAIMessageChunk(chunk));
            // console.log(chunk, 'content.')
            // console.log(_metadata, 'test..')
            if(chunk.response_metadata?.done==true){
              break;
            }
            controller.enqueue(encoder.encode(content));
            // if(typeof content == "string") {
            // } else if(Array.isArray(content)){
            //   for(let item of content){
            //     if(item.type=="text"){
            //       controller.enqueue(item.text);
            //
            //     }
            //   }
            // }
          }
          controller.close();
        } catch(err) {
          console.log("error in readable stream:", err)
          controller.error();
        }
      }
    })
    return new NextResponse(readableStream, {
      status:200,
      headers:{
        'Content-Type': 'plain/event-stream',
        'Transfer-Encoding': 'chunked'
      }
    })

  } catch(err) {
    console.log(err);
    return NextResponse.json({"status":"failed", msg:"Error in LLM response"}, {status:500});
  }
}
