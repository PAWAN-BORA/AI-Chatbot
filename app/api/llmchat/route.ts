import { NextRequest, NextResponse } from "next/server";
import {ChatOllama, Ollama } from "@langchain/ollama";
import {START, END, MessagesAnnotation, StateGraph, MemorySaver, PregelOptions, StateType, PregelNode} from "@langchain/langgraph";
import { isAIMessageChunk } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { getLimetedChatMsg, newChat } from "@/model/chat";
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
  console.log('-------------------------------------------------');
  console.log(state)
  const res = await llm.invoke(state.messages);

  console.log(res);
  // return {messages:res}
  return {}
};


// const unstreamed = RunnableLambda.from(unstreamed)
// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
.addNode("model", callModel)
.addEdge(START, "model")
.addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile();

export async function POST(req:NextRequest){


  let data = await req.json();
  let chatId = data.chatId;
  if(chatId==null){
    try {
      chatId = await newChat(data.userId, data.ques.substring(0, 20));
    } catch(err) {
      console.log(err);
      return new NextResponse("failed to create new chat.", {status:503, headers:{
        "Content-Type": "text/plain",
      }});
    }
  }
  try {
    const encoder = new TextEncoder();

    const prevMsg = await getLimetedChatMsg(chatId);
    let input = [];
    for(const msg of prevMsg){
      input.push(
        {role:"user", content:msg.ques.msg},
        {role:"ai", content:msg.ans},
      )
    };
    input.push({role:"user", content:data.ques});
    const config = {
      configurable: {
        thread_id: chatId,
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
          // let data = JSON.stringify({
          //   type:"head",
          //   chatId:chatId,
          // });
          controller.enqueue(`${chatId}##CHATID##`);
          for await (const [chunk, _metadata] of stream){
            let content = chunk.content;
            if(chunk.response_metadata?.done==true){
              break;
            }
            controller.enqueue(encoder.encode(content));
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
