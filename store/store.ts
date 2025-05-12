import { getChatList, getRagChatList, saveChatMsg } from "@/utils/chatFetch";
import { getRagStream, getStream } from "@/utils/getStream";
import { streamAsyncIterator } from "@/utils/utils";
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
  ragChatList:ChatData[],
  messages:Message[],
  answers:AnsData,
  loadingAns:boolean,
  updateChatList:()=>void,
  updateRagChatList:()=>void,
  setMessage:(msg:Message)=>void,
  updateAnswer:(msgId:string, chunk:string)=>void,
  getChatAnswer:(msg:Message, chatId:string|null)=>void,
  getRagChatAnswer:(msg:Message, chatId:string|null)=>void,
  resetData:(messages?:Message[], answers?:AnsData)=>void,
  setAnsLoading:(status:boolean)=>void,
}


const useStore = create<StoreValue>((set, get)=>({
  chatList:[],
  ragChatList:[],
  messages:[],
  answers:{},
  loadingAns:false,
  updateChatList:async ()=>{
    try {
      const chatList:ChatData[] = await getChatList("/api/chatList");
      set({chatList:chatList})
    } catch(err) {
      console.log(err);
      // set({sidebarList:[]})
    }
  },
  updateRagChatList:async ()=>{
    try {
      const chatList:ChatData[] = await getChatList("/api/ragChat");
      set({ragChatList:chatList})
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
  getChatAnswer:async (msg:Message, chatId:string|null)=>{
    set({loadingAns:false})
    const {setAnsLoading, updateAnswer, updateChatList} = get();
    setAnsLoading(true);
    const payload = {
      ques:msg.msg,
      chatId:chatId,
    };
    try {
      const reader = await getStream(payload, "/api/llmchat"); 
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

      }

      const msgChatId = Number(chatId) ?? 0;
      if(msgChatId==0){
        return;
      }
      const msgPayload = {
        chatId:msgChatId,
        ques:JSON.stringify(msg),
        ans:accumulatedData
      }
      saveChatMsg(msgPayload, "/api/addChatMsg");
    } catch {
      setAnsLoading(false);
    }

  },
  getRagChatAnswer:async (msg:Message, chatId:string|null)=>{
    set({loadingAns:false})
    const {setAnsLoading, updateAnswer, updateChatList} = get();
    setAnsLoading(true);
    const payload = {
      ques:msg.msg,
      chatId:chatId,
    };
    try {
      const reader = await getStream(payload, "/api/llmRagChat"); 
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

      }

      const msgChatId = Number(chatId) ?? 0;
      if(msgChatId==0){
        return;
      }
      console.log(accumulatedData);
      const msgPayload = {
        chatId:msgChatId,
        ques:JSON.stringify(msg),
        ans:accumulatedData
      }
      saveChatMsg(msgPayload, "/api/ragMsg");
    } catch {
      setAnsLoading(false);
    }

  },
  resetData:(messages=[], answers={})=>{
    set({messages:messages, answers:answers})
  },
  setAnsLoading:(status)=>{
    set({loadingAns:status})
  },
}));


export default useStore;
