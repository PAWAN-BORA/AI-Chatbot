import { getChatList } from "@/utils/chatFetch";
import { create } from "zustand";


export type Message = {
  msg:string,
  id:string,
}
export type ChatData = {
  chatId:string,
  title:string,
}
export type ChatMsg = {
  msgId:string,
  chatId:string,
  ques:Message,
  ans:string,
}

export type AnsData = {[key:string]:string}
type StoreValue = {
  chatList:ChatData[],
  messages:Message[],
  answers:AnsData,
  loadingAns:boolean,
  updateChatList:()=>void,
  setMessage:(msg:Message)=>void,
  updateAnswer:(msgId:string, chunk:string)=>void,
  resetData:(messages?:Message[], answers?:AnsData)=>void,
  setAnsLoading:(status:boolean)=>void,
}


const useStore = create<StoreValue>((set)=>({
  chatList:[],
  messages:[],
  answers:{},
  loadingAns:false,
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
      prevMessages.push(msg);
      return {messages:prevMessages}
    })
  },
  updateAnswer:(msgId, chunk)=>{
    set((state)=>{
      const answers = state.answers;
      if(answers[msgId]!=undefined){
        const ans = answers[msgId] + chunk;
        return {answers:{...answers, [msgId]:ans}}
      } else {
        return {answers:{...answers, [msgId]:chunk}}
      }
    });
  },
  resetData:(messages=[], answers={})=>{
    set({messages:messages, answers:answers})
  },
  setAnsLoading:(status)=>{
    set({loadingAns:status})
  },
}));

if(typeof window != "undefined"){
  useStore.getState().updateChatList();
}

// const params = new URLSearchParams(window.location.search);
// console.log(params.get("chat_id"))
// getChatMsg()

export default useStore;
