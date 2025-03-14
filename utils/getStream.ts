

type Paylaod = {
  ques:string,
}

export async function getStream(paylaod:Paylaod){

  const url = "/api/llmchat";
  try {
    const res = await fetch(url, {
      method:"POST",
      body:JSON.stringify(paylaod),
    });

    if(res.ok){
      if(!res.body) {
        throw new Error('ReadableStream not supported');
      }
      const reader = res.body.getReader();

      return reader;
    }
    throw new Error('Server Error.');

  } catch(error) {
    console.error('Error', error);
    throw new Error('Error Occured!');
  }


}
