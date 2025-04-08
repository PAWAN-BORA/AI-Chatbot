"use client";
import { ChatMsg, Message, StoreContext } from "@/app/Store"
import { getStream } from "@/utils/getStream";
import { streamAsyncIterator } from "@/utils/utils";
import { useContext, useEffect, useRef, useState } from "react"
import Markdown from "react-markdown";
import AnswerBlock from "./AnsBlock";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getChatMsg, saveChatMsg } from "@/utils/chatFetch";
type ansData = {[key:string]:string}

export default function Chatbox() {

  const {messages, dispatch, getChats} = useContext(StoreContext)!;
  const [ansList, setAnsList] = useState<ansData>({});
  const chatContainer = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat_id");
  const changeChat = useRef(true);
  useEffect(()=>{
    const lastMsg = messages.at(-1);
    if(lastMsg!=undefined && !ansList[lastMsg.id]){
      getAnswer(lastMsg);
      if(chatContainer.current!=undefined){
        // chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
        chatContainer.current.scrollTo({top:chatContainer.current.scrollHeight, behavior:"smooth"})
      }
    }
  }, []);
  
  useEffect(()=>{
    if(!changeChat.current){
      changeChat.current = true;
      return;
    }
    if(chatId==null){
      clearChat();
      return;
    };

    chatMsgList(chatId);
  }, [chatId]);
  function clearChat(){
    dispatch({
      type:"resetMsg",
      quesList:[],
    });
    setAnsList({})
  }
  async function chatMsgList(chatId:string){
    clearChat();
    try {
      const msgList:ChatMsg[] = await getChatMsg(chatId);
      let quesList = [], ansList:ansData={};
      for(let chat of msgList){
        let quesId = chat.ques.id;
        quesList.push(chat.ques);
        ansList[quesId] = chat.ans;
      }
      dispatch({
        type:"resetMsg",
        quesList:quesList,
      });
      setAnsList(ansList)
    } catch(err) {

      console.log(err);
    }
  }
  async function getAnswer(msg:Message){
    let chatId = searchParams.get("chat_id");
    let payload = {
      ques:msg.msg,
      chatId:chatId,
      userId:1,
    }
    const reader = await getStream(payload); 
    let accumulatedData = "";
    for await (const chunk of streamAsyncIterator(reader)){
      if(chunk.type=="head"){
        if(chatId!==chunk.chatId){
          chatId = chunk.chatId ?? "0";
          changeChat.current = false;
          getChats();
          window.history.pushState(null, "", "?chat_id="+chunk.chatId)
          continue;
        }
      }
      accumulatedData += chunk.content ?? "";
      setAnsList((prev)=>{
        if(prev[msg.id]!=undefined){
          let ans = prev[msg.id] + (chunk.content??"");
          return {...prev, [msg.id]:ans}
        } else {
          return {...prev, [msg.id]:chunk.content??""}
        }
      });
    };

    let msgChatId = Number(chatId) ?? 0;
    if(msgChatId==0){
      return;
    }
    let msgPayload = {
      chatId:msgChatId,
      ques:JSON.stringify(msg),
      ans:accumulatedData
    }

    saveChatMsg(msgPayload);
  }

  return(
   <div className="flex-1 overflow-auto flex justify-center my-8" ref={chatContainer}>
      <div className="max-w-[736px] w-full">
        {messages.map((item, index)=>{
          let isLast = messages.length-1==index;
          return(
            <div key={item.id} className="flex flex-col mb-4 " style={{minHeight:isLast?"500px":"auto"}}>
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

