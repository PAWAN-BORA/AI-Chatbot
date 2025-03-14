import { NextRequest, NextResponse } from "next/server";
import {ChatOllama } from "@langchain/ollama";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
// const modelName = "deepseek-r1:1.5b";
// const modelName = "deepseek-r1:8b";
const modelName = "llama3.2:3b";
// const modelName = "ibm-granite/granite-3.0-1b-a400m-base";
// const modelName = "Qwen/Qwen2.5-0.5B";
// const modelName = "llama3.1";

const llm = new ChatOllama({
  baseUrl: "http://172.24.64.1:11434",
  model: modelName, // Default value
  temperature: 0,
  maxRetries: 2,
});
// const llm = new ChatOpenAI({
//   // baseUrl: "http://172.24.64.1:11434",
//   model: modelName, // Default value
//   openAIApiKey:"dummy",
//   configuration:{
//     baseURL:"http://localhost:8000/v1"
//   },
//   temperature: 0,
//   // maxRetries: 2,
// });

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};
const prompt = ChatPromptTemplate.fromMessages([
  // [
  //   "system",
  //   `You are a helpful assistant who remembers all details the user shares with you.`,
  // ],
  ["placeholder", "{chat_history}"],
  ["human", "{text}"],
]);
const chain = prompt.pipe(llm);
const withMessageHistory = new RunnableWithMessageHistory({
  runnable:chain,
  getMessageHistory: async (sessionId)=>{
    if (messageHistories[sessionId] === undefined) {
      messageHistories[sessionId] = new InMemoryChatMessageHistory();
    }
    return messageHistories[sessionId];
  },
  inputMessagesKey:"text",
  historyMessagesKey:"chat_history"
});

export async function POST(req:NextRequest){


  let data = await req.json();
  try {
    const encoder = new TextEncoder();
    const config = {
      configurable: {
        sessionId: "history_id",
      },
    };
    const stream = await withMessageHistory.stream({text:data.ques}, config);
    // const stream = await llm.stream(data.ques);
    // console.log(stream, 'this is stream..');
    let readableStream = new ReadableStream({
      async start(controller){
        try{
          for await (const chunk of stream){
            console.log(chunk, 'chunck..');
            let content = chunk.content;
                  // controller.enqueue(encoder.encode(chunk));
            if(typeof content == "string") {
              controller.enqueue(encoder.encode(content));
            } else if(Array.isArray(content)){
              for(let item of content){
                if(item.type=="text"){
                  controller.enqueue(item.text);

                }
              }
            }

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
