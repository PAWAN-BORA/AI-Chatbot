import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

function getLlmModel(){
  const modelObj = {
    ollama:"ollama",
    openAI:"openAI"
  }

  const modelType = process.env.AI_MODEL_TYPE;

  if(modelType==modelObj.ollama){
    return new ChatOllama({
      baseUrl:process.env.AI_BASE_URL,
      model: process.env.AI_MODEL_NAME, 
      temperature: 0,
      maxRetries: 2,
      streaming:true,
      // disableStreaming:true,
      // other params...
    });

  } else if(modelType==modelObj.openAI){
    return new ChatOpenAI({
      model: process.env.AI_MODEL_NAME, 
      apiKey:process.env.AI_MODEL_KEY,
      configuration:{
        baseURL:process.env.AI_BASE_URL
      },
      temperature: 0,
      maxRetries: 2,
      streaming:true,
    });
  }
  return new ChatOllama({
    baseUrl:process.env.AI_BASE_URL,
    model: process.env.AI_MODEL_NAME, 
    temperature: 0,
    maxRetries: 2,
    streaming:true,
    // disableStreaming:true,
    // other params...
  });

}


export default getLlmModel;
