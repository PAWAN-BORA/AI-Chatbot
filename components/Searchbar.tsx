"use client"

import useStore, { Message } from "@/store/store";
import { saveChatMsg } from "@/utils/chatFetch";
import { getStream } from "@/utils/getStream";
import { getRandomId, streamAsyncIterator } from "@/utils/utils";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function Searchbar() {

  const [inputVal, setInputVal] = useState("");
  const updateAnswer = useStore(state=>state.updateAnswer);
  const setAnsLoading = useStore(state=>state.setAnsLoading);
  const updateChatList = useStore(state=>state.updateChatList);
  const setMessage = useStore(state=>state.setMessage);
  const searchParams = useSearchParams();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{
    if(textAreaRef.current!=null){
      const textArea = textAreaRef.current;
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
      if(textArea.clientHeight > 150){
        textArea.style.height = "150px";
      } 
    }
  }, [inputVal])
  const handleSubmit = (e:FormEvent)=>{
    e.preventDefault();
    const msg:Message = {msg:inputVal, id:getRandomId().toString()}
    setMessage(msg);
    setInputVal("");
    getAnswer(msg);
  }
  async function getAnswer(msg:Message){
    let chatId = searchParams.get("chat_id");
    setAnsLoading(true);
    const payload = {
      ques:msg.msg,
      chatId:chatId,
      userId:1,
    }
    const reader = await getStream(payload); 
    setAnsLoading(false);
    let accumulatedData = "";
    for await (const chunk of streamAsyncIterator(reader)){
      if(chunk.type=="head"){
        if(chatId!==chunk.chatId){
          chatId = chunk.chatId ?? "0";
          updateChatList();
          window.history.pushState(null, "", "?chat_id="+chunk.chatId)
          continue;
        }
      }
      accumulatedData += chunk.content ?? "";
      updateAnswer(msg.id, chunk.content??"");
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

   const handleKeyDown = (e:React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log(e.key);
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        handleSubmit(e);
      }
    }
  };
  return(
   <div className="flex justify-center">
      <form className="min-w-96 flex gap-2 p-4 border border-gray-400 rounded-xl items-center" onSubmit={handleSubmit}>
        <textarea 
          className="w-full border-none outline-none bg-transparent focus:ring-0 resize-none"
          cols={60}
          // rows={maxRows}
          ref={textAreaRef}
          placeholder="Ask anything" 
          value={inputVal}
          onChange={(e)=>{setInputVal(e.target.value)}}
          onKeyDown={handleKeyDown}
        />
        <button className="cursor-pointer"  type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  )
}

