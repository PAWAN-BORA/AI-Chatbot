
import { NextRequest, NextResponse } from "next/server";
import {ChatOllama } from "@langchain/ollama";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RecursiveCharacterTextSplitter, TokenTextSplitter } from "langchain/text_splitter";
import fs from 'fs';
import path from 'path';
import { loadSummarizationChain } from "langchain/chains";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
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
let docPath = path.join(process.cwd()+"/public/pagesm.txt");
const text = fs.readFileSync(docPath, 'utf8');
// console.log(docs, 'this is docs..')
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize:1000,
  chunkOverlap:50,
});

const docs = await splitter.createDocuments([text]);
console.log(docs[0]);
console.log(docs.length);
// const docsSummary = await splitter.splitDocuments(docs);
// const messageHistories: Record<string, InMemoryChatMessageHistory> = {};
// const prompt = ChatPromptTemplate.fromMessages([
//   ["placeholder", "{chat_history}"],
//   ["human", "{text}"],
// ]);
// const chain = prompt.pipe(llm);
// const withMessageHistory = new RunnableWithMessageHistory({
//   runnable:chain,
//   getMessageHistory: async (sessionId)=>{
//     if (messageHistories[sessionId] === undefined) {
//       messageHistories[sessionId] = new InMemoryChatMessageHistory();
//     }
//     return messageHistories[sessionId];
//   },
//   inputMessagesKey:"text",
//   historyMessagesKey:"chat_history"
// });

export async function POST(req:NextRequest){


  let data = await req.json();
  try {
    const encoder = new TextEncoder();
    const config = {
      configurable: {
        sessionId: "history_id",
      },
    };
    const prompt = PromptTemplate.fromTemplate(
      "Write a concise summary of the following also {msg}:\n\n{context}"
    );
    const chain = await createStuffDocumentsChain({
      llm:llm,
      outputParser:new StringOutputParser(),
      prompt:prompt,
    })
    // const summarizeChain = loadSummarizationChain(llm, {
    //   type:"map_reduce",
    // });
    // const stream = await llm.stream(data.ques, config);
    // const stream = await summarizeChain.stream({input_documents:docs});
    // console.log(chain, 'this is chain..')
    const stream = await chain.stream({context:docs, msg:data.ques});
    let readableStream = new ReadableStream({
      async start(controller){
        try{
          for await (const chunk of stream){
            // console.log(chunk, 'chunck..');
            // let content = chunk.text;
            controller.enqueue(encoder.encode(chunk));
            // if(typeof content == "string") {
            //   controller.enqueue(encoder.encode(content));
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
