

export function getRandomId(){

  return Math.floor(Math.random()*1024)+Date.now();
}


export function streamAsyncIterator(reader:ReadableStreamDefaultReader<Uint8Array>){
  const decoder = new TextDecoder("utf-8");
  return {
    async *[Symbol.asyncIterator]() {
      try{
        while(true){
          const {done, value} = await reader.read();
          if(done) break;
          yield decoder.decode(value);
        } 
      } finally {
        reader.releaseLock();
      }
    }
  }
}
