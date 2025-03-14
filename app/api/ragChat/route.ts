
import { NextRequest, NextResponse } from "next/server";
import {ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RecursiveCharacterTextSplitter, TokenTextSplitter } from "langchain/text_splitter";
import fs from 'fs';
import path from 'path';
import { loadSummarizationChain } from "langchain/chains";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { formatDocumentsAsString } from "langchain/util/document";
import { pull } from "langchain/hub";
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
const embeddings = new OllamaEmbeddings({
  model:"all-minilm",
  baseUrl: "http://172.24.64.1:11434",
})
const vectorStore = new MemoryVectorStore(embeddings);
let docPath = path.join(process.cwd()+"/public/pagesm.txt");
const text = fs.readFileSync(docPath, 'utf8');
// console.log(docs, 'this is docs..')
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize:1000,
  chunkOverlap:50,
});

const docs = await splitter.createDocuments([text]);
await vectorStore.addDocuments(docs)
const retriever = vectorStore.asRetriever();
console.log(docs.length);
// console.log(vectorStore.memoryVectors);
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

const history = new InMemoryChatMessageHistory();
export async function POST(req:NextRequest){


  let data = await req.json();
  try {
    const encoder = new TextEncoder();
    const config = {
      configurable: {
        sessionId: "history_id",
      },
    };
    const similarSearch = await vectorStore.similaritySearch(data.ques);
    const retrieverDocs = await retriever.invoke(data.ques);
    // console.log(similarSearch.length, retrieverDocs.length);
    // console.log(similarSearch);
    // console.log(retrieverDocs);
    const prompt = PromptTemplate.fromTemplate(
      `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question:{question}
Context:{context}
`
    );
    let systemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.

{context}`
    const chatPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["placeholder", "{chat_history}"],
      ["human", "{question}"]
    ])
    const ragPrompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
    const qaChain =  RunnableSequence.from([
      {
        context:(input:{question:string}, callbacks)=>{
          const retrieverAndFormatter = vectorStore.asRetriever().pipe(formatDocumentsAsString);
          return retrieverAndFormatter.invoke(input.question, callbacks);
        },
        question: new RunnablePassthrough(),
      },
      ragPrompt,
      llm,
      new StringOutputParser()
    ]);
    const contextualizeQChain = chatPrompt
    .pipe(llm)
    .pipe(new StringOutputParser());
    const contextualizedQuestion = (input: Record<string, unknown>) => {
      if ("chat_history" in input) {
        return contextualizeQChain;
      }
      return input.question;
    };
    const ragChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: (input: Record<string, unknown>) => {
          if ("chat_history" in input) {
            const chain = contextualizedQuestion(input);
            return chain.pipe(retriever).pipe(formatDocumentsAsString);
          }
          return "";
        },
      }),
      chatPrompt,
      llm,
    ]);
    const chain = await createStuffDocumentsChain({
      llm:llm,
      outputParser:new StringOutputParser(),
      prompt:chatPrompt,
    });
    // const summarizeChain = loadSummarizationChain(llm, {
    //   type:"map_reduce",
    // });
    // const stream = await llm.stream(data.ques, config);
    // const stream = await summarizeChain.stream({input_documents:docs});
    // console.log(chain, 'this is chain..')
    console.log(history, 'tesr..')
    // const stream = await ragChain.stream({ question:data.ques, chat_history:[]});
    let chatHistory = (await history.getMessages()).slice(-6);
    console.log(chatHistory, 'tesr..')
    const stream = await chain.stream({ question:data.ques, context:retrieverDocs, chat_history:chatHistory});
    // const stream = await qaChain.stream({ question:data.ques});
    history.addMessage(new HumanMessage(data.ques));
    let aiString = "";
    let readableStream = new ReadableStream({
      async start(controller){
        try{
          for await (const chunk of stream){
            // console.log(chunk, 'chunck..');
            // let content = chunk.content;
            aiString += chunk;
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
          history.addMessage(new AIMessage(aiString));
          // if(history.)
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
