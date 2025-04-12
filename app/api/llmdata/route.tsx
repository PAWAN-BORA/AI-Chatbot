import { NextRequest, NextResponse } from "next/server";
import {ChatOllama} from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
const modelName = "deepseek-r1:1.5b";
// const modelName = "deepseek-r1:8b";
// const modelName = "llama3.2:3b";
// const modelName = "llama3.1";

const llm = new ChatOllama({
  baseUrl: "http://172.24.64.1:11434",
  model: modelName, // Default value
  temperature: 0,
  maxRetries: 2,
  // disableStreaming:true,
  // other params...
});
export async function POST(req:NextRequest){


  const data = await req.json();
  try {
    const encoder = new TextEncoder();
    const systemTemplate = "Translate the following from English into {language}";
    const promptTemplate = ChatPromptTemplate.fromMessages([
      {role:"system", content:systemTemplate},
      {role:"user", content:"{text}"},
    ])
    // const input:BaseMessageLike[] = [
    //   {role:"system", content:"Translate the following from English into Hindi."},
    //   {role:"user", content:"{text}"},
    // ];
    const promptValue = await promptTemplate.invoke({language:"Hindi", text:data.ques})
    const stream = await llm.stream(promptValue);
    const readableStream = new ReadableStream({
      async start(controller){
        try{
          for await (const chunck of stream){
            const content = chunck.content;
            if(typeof content == "string") {
              controller.enqueue(encoder.encode(content));
            } else if(Array.isArray(content)){
              for(const item of content){
                if(item.type=="text"){
                  controller.enqueue(item.text);

                }
              }
            }

          }
          controller.close();
        } catch {
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
