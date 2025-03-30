

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
            let chunkArr = chunk.split("##CHATID##");
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


