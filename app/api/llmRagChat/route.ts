import getLlmModel from "@/lib/llmModel";
import { withErrorHandler } from "@/utils/utils";
import { MessageType } from "@langchain/core/messages";
import { StringWithAutocomplete } from "@langchain/core/utils/types";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import path from "path";
import fs from "fs";
import { DocumentInterface } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DatabaseError } from "@/lib/errors";
import { RagChat } from "@/model/Ragchat";



const llm = getLlmModel();

const embeddings = new OllamaEmbeddings({
  model:"all-minilm",
  baseUrl: "http://localhost:11434",
  maxRetries:2,
});

const vectorStore = new MemoryVectorStore(embeddings);

const docPath = path.join(process.cwd()+"/public/pagesm.txt");
const text = fs.readFileSync(docPath, 'utf8');

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize:1000,
  chunkOverlap:50,
});
const docs = await splitter.createDocuments([text]);
await vectorStore.addDocuments(docs);

console.log(vectorStore, 'vectorStore.....')

const systemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.
If the question is not related to the retrieved context than don't give any answer just say I don't have the infromation.
{context}`;

const prompt = ChatPromptTemplate.fromMessages([ 
  ["system", systemPrompt],
  ["placeholder", "{chat_history}"],
  ["human", "{question}"]
]);

type DBMessage = {role:StringWithAutocomplete<MessageType>, content:string }
const StateAnnotaion = Annotation.Root({
  dbMessages:Annotation<DBMessage[]>,
  chatId:Annotation<number>,
  userQues:Annotation<string>,
  context:Annotation<DocumentInterface[]>,
  chat:Annotation<RagChat>,
})

const retrieve = async (state: typeof StateAnnotaion.State) => {
  const retrievedDocs = await vectorStore.similaritySearch(state.userQues)
  return { context: retrievedDocs };
};

const dbMsg = async (state: typeof StateAnnotaion.State) => {
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
  return { dbMessages: messages };
};

const callModel = async (state:typeof StateAnnotaion.State)=>{
  const docsContent = state.context.map(doc => doc.pageContent).join("\n");
  const dbMessages:DBMessage[] = state.dbMessages;
  const messages = await prompt.invoke({chat_history:dbMessages, question:state.userQues, context:docsContent})
  await llm.invoke(messages);
  return {};
};
const workflow = new StateGraph(StateAnnotaion)
.addNode("retrieve", retrieve)
.addNode("dbMsg", dbMsg)
.addNode("model", callModel)
.addEdge(START, "retrieve")
.addEdge("retrieve", "dbMsg")
.addEdge("dbMsg", "model")
.addEdge("model", END);

const app = workflow.compile();

async function llmRagChat(req:NextRequest){
  const chat = await RagChat.create();
  const data = await req.json();
  let chatId = data.chatId;
  if(chatId==null){
    try {
      const {userId} = chat.getSession();
      chatId = await chat.newChat(userId, data.ques.substring(0, 28));
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
    const stream = await app.stream({userQues:data.ques, chatId:chatId, chat:chat}, config)

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
};


export const POST = withErrorHandler(llmRagChat);

