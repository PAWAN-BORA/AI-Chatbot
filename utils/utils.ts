import { ERROR_STATUS_CODE_MAP } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";


export function getRandomId(){
  return Math.floor(Math.random()*1024)+Date.now();
}


export function streamAsyncIterator(reader:ReadableStreamDefaultReader<Uint8Array>){
  const decoder = new TextDecoder("utf-8");
  return {
    async *[Symbol.asyncIterator]() {
      try{
        let first = true;
        while(true){
          const {done, value} = await reader.read();
          if(done) break;
          const chunk = decoder.decode(value)
          if(first){
            const chunkArr = chunk.split("##CHATID##");
            yield  {
              chatId:chunkArr[0],
              type:"head",
            }
            if(chunkArr[1]!=undefined){
              yield  {
                content:chunkArr[1],
                type:"chunk",
              }
            }
            first = false;
            continue;
          }
          yield  {
            content:chunk,
            type:"chunk",
          }
        } 
      } finally {
        reader.releaseLock();
      }
    }
  }
}

export async function customFetch(input:RequestInfo, init?:RequestInit){
  return fetch(input, init).then((res)=>{
    console.log(res, 'this is res...');
    if(res.status==401){
      window.location.href = "/login";
      throw new Error("Unauthorized")
    }
    return res;
  })
}

export function withErrorHandler(handler:(request:NextRequest)=>Promise<NextResponse>){
  return async (request:NextRequest)=>{
    try {
      return await handler(request);
    } catch(err) {
      let msg = "Unknow Error";
      let status = 500;
      if(err instanceof Error){
        msg = err.message;
        status = ERROR_STATUS_CODE_MAP[err.name] ?? 500;
      };
      return NextResponse.json({msg:msg}, {status:status})
    }
  }
}
