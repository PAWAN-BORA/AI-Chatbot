"use client";
import { getRandomId } from "@/utils/utils";
import { stat } from "fs";
import { act, ActionDispatch, createContext, ReactNode, useReducer } from "react";

export type Message = {
  type:string,
  msg:string,
  id:string,
}
type State = {
  sidebarList:string[],
  messages:Message[]
}

type StoreValue = {
  sidebarList:string[],
  messages:Message[],
  dispatch:ActionDispatch<[action: any]>
}

export const StoreContext = createContext<null|StoreValue>(null)


function reducer(state:State, action:any){
  if(action.type == 'humanMsg'){
    let prevMessages = [...state.messages];
    prevMessages.push({
      type:action.type,
      msg:action.msg,
      id:getRandomId().toString(),
    });
    return {...state, messages:prevMessages}
  } else if(action.type=='aiMessage'){

  }
  console.log('state not updated...')
  return state;
}
export default function Store({children}:{children:ReactNode}){


  const [state, dispatch] = useReducer(reducer, {sidebarList:[], messages:[]});
  return <StoreContext.Provider 
    value={{
      sidebarList:state.sidebarList,
      messages:state.messages,
      dispatch:dispatch
    }}
  >
    {children}
  </StoreContext.Provider>
}
