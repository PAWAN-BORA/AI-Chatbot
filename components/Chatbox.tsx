"use client";
import { Message, StoreContext } from "@/app/Store"
import { getStream } from "@/utils/getStream";
import { streamAsyncIterator } from "@/utils/utils";
import { useContext, useEffect, useRef, useState } from "react"
import Markdown from "react-markdown";
import AnswerBlock from "./AnsBlock";
type ansData = {[key:string]:string}

export default function Chatbox() {

  const {messages} = useContext(StoreContext)!;
  const [ansList, setAnsList] = useState<ansData>({});
  const chatContainer = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let lastMsg = messages.at(-1);
    if(lastMsg!=undefined && !ansList[lastMsg.id]){
      getAnswer(lastMsg);
      if(chatContainer.current!=undefined){
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
      }
    }
  }, [messages.length])
  async function getAnswer(msg:Message){
    const reader = await getStream({ques:msg.msg}); 
    for await (const chunk of streamAsyncIterator(reader)){
      setAnsList((prev)=>{
        if(prev[msg.id]!=undefined){
          let ans = prev[msg.id] + chunk;
          return {...prev, [msg.id]:ans}
        } else {
          return {...prev, [msg.id]:chunk}
        }
      });
    }
  }

  return(
   <div className="flex-1 overflow-auto flex justify-center my-8" ref={chatContainer}>
      <div className="max-w-[736px] w-full">
        {messages.map((item)=>{
          return(
            <div key={item.id} className="flex flex-col mb-4 min-h-[500px]">
              <div  className="self-end bg-primarygray max-w-[500px] p-2 rounded-lg mb-2 text-justify">
                {item.msg}
              </div>
              {ansList[item.id] && 
                <div className="bg-primaryyellow py-2 rounded-lg p-2 text-justify">
                  <AnswerBlock ansStr={ansList[item.id]}/>
                </div>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}

