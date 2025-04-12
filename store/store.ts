import { getChatList } from "@/utils/chatFetch";
import { getRandomId } from "@/utils/utils";
import { create } from "zustand";


export type Message = {
  type:string,
  msg:string,
  id:string,
}
export type ChatData = {
  chatId:string,
  title:string,
}
type StoreValue = {
  chatList:ChatData[],
  messages:Message[],
  updateChatList:()=>void,
  setMessage:(msg:Message)=>void,
  updateMessages:(messages:Message[])=>void,
}


const useStore = create<StoreValue>((set)=>({
  chatList:[],
  messages:[],
  updateChatList:async ()=>{
    try {
      const chatList:ChatData[] = await getChatList();
      set({chatList:chatList})
    } catch(err) {
      console.log(err);
      // set({sidebarList:[]})
    }
  },
  setMessage:(msg)=>{
    set((prev)=>{
      const prevMessages = [...prev.messages];
      prevMessages.push({
        type:msg.type,
        msg:msg.msg??"",
        id:getRandomId().toString(),
      });
      return {messages:prevMessages}
    })
  },
  updateMessages:(messages)=>{
    set({messages:messages})
  }
}));

useStore.getState().updateChatList();

export default useStore;
