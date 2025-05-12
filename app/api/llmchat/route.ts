import { NextRequest, NextResponse } from "next/server";
// import {ChatOllama} from "@langchain/ollama";
import {START, END, StateGraph, Annotation} from "@langchain/langgraph";
import { MessageType } from "@langchain/core/messages";
import { StringWithAutocomplete } from "@langchain/core/utils/types";
import { Chat } from "@/model/chat";
import { withErrorHandler } from "@/utils/utils";
import { DatabaseError } from "@/lib/errors";
import getLlmModel from "@/lib/llmModel";
// const modelName = "deepseek-r1:1.5b";
// const modelName = "deepseek-r1:8b";
// const modelName = "llama3.2:3b";
// const modelName = "llama3.1";


const llm = getLlmModel();


type DBMessage = {role:StringWithAutocomplete<MessageType>, content:string }
const StateAnnotaion = Annotation.Root({
  dbMessages:Annotation<DBMessage[]>,
  chatId:Annotation<number>,
  userQues:Annotation<string>,
  chat:Annotation<Chat>,
})

const dbMsg = async(state:typeof StateAnnotaion.State)=>{
  if(state.chat==null) return {dbMessages:[{role:"human", content:state.userQues}]}
  const prevMsg = await state.chat.getLimetedChatMsg(state.chatId);
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

async function llmChat(req:NextRequest){
  const chat = await Chat.create();
  const data = await req.json();
  let chatId = data.chatId;
  if(chatId==null){
    try {
      const {userId} = chat.getSession();
      chatId = await chat.newChat(userId, data.ques.substring(0, 20));
    } catch(err) {
      console.log(err);
      throw new DatabaseError("failed to create new chat.");
    }
  }
  try {
    const config = {
      configurable: {
        thread_id: chatId,
      },
      streamMode:"messages" as const,
    };
    const stream = await app.stream({chatId:chatId, userQues:data.ques, chat:chat}, config);
    const readableStream = new ReadableStream({
      async start(controller){
        try{
          const encoder = new TextEncoder();
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
    let msg = "failed";
    if(err instanceof Error){
      msg = err.message;
    }
    throw new DatabaseError(msg);
  }
}

export const POST = withErrorHandler(llmChat);
