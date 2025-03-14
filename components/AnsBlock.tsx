
import { ThemeContext } from "@/app/ThemeProvider";
import { useContext, useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {  oneLight, darcula, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type AnsMessage = {
  type:string,
  content:string,
  lang?:string,
}
export default function AnswerBlock({ansStr}:{ansStr:string}){
  
  const {theme} = useContext(ThemeContext)!;
  const ansBlock = useMemo(()=>{
    let ansData = processChunk(ansStr)
    let ansArray = ansData.map((item, index)=>{
      if(item.type=="markdown"){
        return <Markdown key={index}>{item.content}</Markdown> 
      } else if(item.type=="code") {
        return <SyntaxHighlighter 
          key={index}
          language={item.lang}
          style={theme=="dark"?oneDark:oneLight}
          customStyle={{fontSize:"14px"}}
          test={console.log(item.lang, 'lang')}
        >
          {item.content}
        </SyntaxHighlighter> 

      }
    })
    return ansArray;
  }, [ansStr, theme]);

  return ansBlock;
}


function processChunk(chunk:string):AnsMessage[] {
  const messages:AnsMessage[] = [];
  let msgArray = chunk.split("```");
  for(let i=0; i<msgArray.length; i++){
    let part = msgArray[i];
    if(i%2==0){
      messages.push({ type: "markdown", lang: "", content: part });
    } else {
      let firstLineIndex = part.indexOf("\n");
      if(firstLineIndex!=-1){
        let lang = part.substring(0, firstLineIndex);
        messages.push({ type: "code", lang:lang, content: part.substring(firstLineIndex) });
      }
    }
  }
  return messages;
}
