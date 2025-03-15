
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
        return <CodeBlock key={index} msg={item} theme={theme}/>
      }
    })
    return ansArray;
  }, [ansStr, theme]);

  return ansBlock;
}


function CodeBlock({msg, theme}:{msg:AnsMessage, theme:string}){
  return(
    <div className="border rounded my-4">
      <CodeHead msg={msg}/>
      <SyntaxHighlighter 
        language={msg.lang}
        style={theme=="dark"?oneDark:oneLight}
        customStyle={{fontSize:"14px", margin:"0px"}}
      >
        {msg.content}
      </SyntaxHighlighter> 
    </div>
  )
}

function CodeHead({msg}:{msg:AnsMessage}){
  const [isCopied, setIsCopied] = useState(false);
  function copyText(){
    navigator.clipboard.writeText(msg.content).then(() => {
      setIsCopied(true);
      setTimeout(()=>{
        setIsCopied(false);
      }, 2000)
    }).catch(err => {
        console.error("Failed to copy: ", err);
      });
  }
  return(
    <div className="bg-codebg flex justify-between px-2 pt-1 rounded-t">
      <div className="text-sm">{msg.lang}</div>
      <div onClick={copyText} className="cursor-pointer flex gap-1 text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
        </svg>
        {isCopied?"Copied":"Copy"}
      </div>
    </div>
  )
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
