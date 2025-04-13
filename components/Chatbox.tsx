"use client";
import { useEffect, useRef} from "react"
import AnswerBlock from "./AnsBlock";
import DotLoader from "./DotLoader";
import useStore from "@/store/store";

export default function Chatbox() {

  const messages = useStore(state=>state.messages);
  const answers = useStore(state=>state.answers);
  const loadingAns = useStore(state=>state.loadingAns);
  const chatContainer = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(chatContainer.current!=undefined){
      chatContainer.current.scrollTo({top:chatContainer.current.scrollHeight, behavior:"smooth"})
    }
  }, [messages.length]);
  

  return(
   <div className="flex-1 overflow-auto flex justify-center my-8" ref={chatContainer}>
      <div className="max-w-[736px] w-full">
        {messages.map((item, index)=>{
          const isLast = messages.length-1==index;
          return(
            <div key={item.id} className="flex flex-col mb-4 " style={{minHeight:isLast?"500px":"auto"}}>
              <div  className="self-end bg-primarygray max-w-[500px] p-2 rounded-lg mb-2 text-justify">
                {item.msg}
              </div>
              {answers[item.id] && 
                <div className="bg-primaryyellow py-2 rounded-lg p-2 text-justify">
                  <AnswerBlock ansStr={answers[item.id]}/>
                </div>
              }
              {loadingAns && isLast && 
                <DotLoader/>
              }
            </div>
          )
        })}
      </div>
   </div>
  )
}

