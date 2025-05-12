"use client"
import useStore, { Message } from "@/store/store";
import SearchInput from "./SearchInput";
import { useSearchParams } from "next/navigation";
import { getRandomId } from "@/utils/utils";


export default function ChatSearchBox(){
  const getChatAnswer = useStore(state=>state.getChatAnswer);
  const setMessage = useStore(state=>state.setMessage);
  const searchParams = useSearchParams();
  function getMessage(msgStr:string){
    const msg:Message = {msg:msgStr, id:getRandomId().toString()}
    const chatId = searchParams.get("chat_id");
    setMessage(msg);
    getChatAnswer(msg, chatId);
  }
  return <SearchInput handleMessage={getMessage}/>
}
