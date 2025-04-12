"use client";
import { ChatMsg, Message, StoreContext } from "@/app/Store"
import { getStream } from "@/utils/getStream";
import { streamAsyncIterator } from "@/utils/utils";
import { useContext, useEffect, useRef, useState } from "react"
import AnswerBlock from "./AnsBlock";
import {useSearchParams } from "next/navigation";
import { getChatMsg, saveChatMsg } from "@/utils/chatFetch";
import DotLoader from "./DotLoader";
import useStore from "@/store/store";
type ansData = {[key:string]:string}

export default function Chatbox() {

  const {dispatch} = useContext(StoreContext)!;
  const messages = useStore(state=>state.messages);
  const updateMessages = useStore(state=>state.updateMessages);
  const updateChatList = useStore(state=>state.updateChatList);
  const [ansList, setAnsList] = useState<ansData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainer = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat_id");
  const changeChat = useRef(true);
  useEffect(()=>{
    const lastMsg = messages.at(-1);
    console.log(lastMsg, 'this is last msg');
    // console.log(ansList[lastMsg?.id], 'this is last msg');
    if(lastMsg!=undefined && !ansList[lastMsg.id]){
      console.log("this is inside the if block.")
      getAnswer(lastMsg);
      if(chatContainer.current!=undefined){
        // chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
        chatContainer.current.scrollTo({top:chatContainer.current.scrollHeight, behavior:"smooth"})
      }
    }
  }, [messages.length]);
  
  useEffect(()=>{
    if(!changeChat.current){
      changeChat.current = true;
      return;
    }
    updateMessages([]);
    if(chatId==null){
      return;
    };

    async function chatMsgList(chatId:string){
      try {
        const msgList:ChatMsg[] = await getChatMsg(chatId);
        const quesList = [], ansList:ansData={};
        for(const chat of msgList){
          const quesId = chat.ques.id;
          quesList.push(chat.ques);
          ansList[quesId] = chat.ans;
        }
        updateMessages(quesList);
        setAnsList(ansList)
        // dispatch({
        //   type:"resetMsg",
        //   quesList:quesList,
        // });
        // setAnsList(ansList)
      } catch(err) {

        console.log(err);
      }
    }
    chatMsgList(chatId);
  }, [chatId, updateMessages]);
  // function clearChat(){
  //   dispatch({
  //     type:"resetMsg",
  //     quesList:[],
  //   });
  //   setAnsList({})
  // }
  async function getAnswer(msg:Message){
    let chatId = searchParams.get("chat_id");
    setLoading(true);
    const payload = {
      ques:msg.msg,
      chatId:chatId,
      userId:1,
    }
    const reader = await getStream(payload); 
    setLoading(false);
    let accumulatedData = "";
    for await (const chunk of streamAsyncIterator(reader)){
      if(chunk.type=="head"){
        if(chatId!==chunk.chatId){
          chatId = chunk.chatId ?? "0";
          changeChat.current = false;
          updateChatList();
          window.history.pushState(null, "", "?chat_id="+chunk.chatId)
          continue;
        }
      }
      accumulatedData += chunk.content ?? "";
      setAnsList((prev)=>{
        if(prev[msg.id]!=undefined){
          const ans = prev[msg.id] + (chunk.content??"");
          return {...prev, [msg.id]:ans}
        } else {
          return {...prev, [msg.id]:chunk.content??""}
        }
      });
    };

    const msgChatId = Number(chatId) ?? 0;
    if(msgChatId==0){
      return;
    }
    const msgPayload = {
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
          const isLast = messages.length-1==index;
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
              {loading && isLast && 
                <DotLoader/>
              }
            </div>
          )
        })}
      </div>
   </div>
  )
}

