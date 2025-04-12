"use client";
import { getChatList } from "@/utils/chatFetch";
import { getRandomId } from "@/utils/utils";
import { ActionDispatch, createContext, ReactNode, useEffect, useReducer } from "react";


export type Message = {
  type:string,
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
type State = {
  sidebarList:ChatData[],
  messages:Message[],
}

type Action = {
  type:string,
  msg?:string,
  data?:ChatData[],
  quesList?:Message[],
}
type StoreValue = {
  sidebarList:ChatData[],
  messages:Message[],
  dispatch:ActionDispatch<[action: Action]>
  // getChats:()=>void;
}




export const StoreContext = createContext<null|StoreValue>(null)


function reducer(state:State, action:Action):State{
  if(action.type == 'humanMsg'){
    const prevMessages = [...state.messages];
    prevMessages.push({
      type:action.type,
      msg:action.msg??"",
      id:getRandomId().toString(),
    });
    return {...state, messages:prevMessages}
  } else if(action.type=='resetMsg'){
    return {...state, messages:action.quesList??[]}
  } else if(action.type=="sidebar"){

    return {...state, sidebarList:action.data??[]}
  }
  return state;
}
export default function Store({children}:{children:ReactNode}){


  const [state, dispatch] = useReducer(reducer, {sidebarList:[], messages:[]});
  useEffect(()=>{
    // getChats();
  }, [])

  // async function getChats(){
  //   try {
  //     const chatList:ChatData[] = await getChatList();
  //     dispatch({
  //       type:"sidebar",
  //       data:chatList,
  //     });
  //   } catch(err) {
  //
  //     console.log(err);
  //   }
  // }
  return <StoreContext.Provider 
    value={{
      sidebarList:state.sidebarList,
      messages:state.messages,
      dispatch:dispatch,
      // getChats:getChats,
    }}
  >
    {children}
  </StoreContext.Provider>
}
