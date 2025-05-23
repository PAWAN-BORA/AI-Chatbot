import { customFetch } from "./utils";


type Paylaod = {
  ques:string,
}

export async function getStream(paylaod:Paylaod, url:string){
  try {
    const res = await customFetch(url, {
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

