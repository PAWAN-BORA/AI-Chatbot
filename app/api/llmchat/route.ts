import { NextRequest, NextResponse } from "next/server";
import {ChatOllama} from "@langchain/ollama";
import {START, END, StateGraph, Annotation} from "@langchain/langgraph";
import { MessageType } from "@langchain/core/messages";
import { getLimetedChatMsg, newChat } from "@/model/chat";
import { StringWithAutocomplete } from "@langchain/core/utils/types";
// const modelName = "deepseek-r1:1.5b";
// const modelName = "deepseek-r1:8b";
const modelName = "llama3.2:3b";
// const modelName = "llama3.1";

const llm = new ChatOllama({
  baseUrl: "http://172.24.64.1:11434",
  model: modelName, // Default value
  temperature: 0,
  maxRetries: 2,
  // disableStreaming:true,
  // other params...
});


type DBMessage = {role:StringWithAutocomplete<MessageType>, content:string }
const StateAnnotaion = Annotation.Root({
  dbMessages:Annotation<DBMessage[]>,
  chatId:Annotation<number>,
  userQues:Annotation<string>,

})

const dbMsg = async(state:typeof StateAnnotaion.State)=>{
  const prevMsg = await getLimetedChatMsg(state.chatId);
  const messages:DBMessage[] = [];
  for(const msg of prevMsg){
    messages.push(
      {role:"human", content:msg.ques.msg},
      {role:"ai", content:msg.ans}
    )
  };
  messages.push({role:"human", content:state.userQues});
  return {dbMessages:messages};
}
// Define the function that calls the model
const callModel = async (state:typeof StateAnnotaion.State)=>{
  await llm.invoke(state.dbMessages);
  return {};
};




// const unstreamed = RunnableLambda.from(unstreamed)
// Define a new graph
const workflow = new StateGraph(StateAnnotaion)
.addNode("dbMsg", dbMsg)
.addNode("model", callModel)
.addEdge(START, "dbMsg")
.addEdge("dbMsg", "model")
.addEdge("model", END);

// Add memory
// const memory = new MemorySaver();
const app = workflow.compile();

export async function POST(req:NextRequest){


  const data = await req.json();
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

    const config = {
      configurable: {
        thread_id: chatId,
      },
      streamMode:"messages" as const
    };
    
    
    const stream = await app.stream({chatId:chatId, userQues:data.ques}, config);
    const readableStream = new ReadableStream({
      async start(controller){
        try{
          controller.enqueue(`${chatId}##CHATID##`);
          for await (const [chunk] of stream){
            const content = chunk.content;
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
