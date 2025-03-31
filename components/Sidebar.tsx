"use client"
import { ChatData, StoreContext } from "@/app/Store"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useContext, useState } from "react"
import Tooltip from "./ToolTip";


export default function Sidebar() {

  const {sidebarList} = useContext(StoreContext)!;
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function changeChat(chat:ChatData|null){
    if(chat==null){

    window.history.pushState(null, "", "/");
      return;
    }
    window.history.pushState(null, "", "?chat_id="+chat.chatId)
  }
  return(
    <div className="h-full overflow-y-auto mx-1">
      <div className="flex justify-between gap-2 mt-2 py-2 border-b border-b-primarygray">
        <div>Chat Bot</div>
        <div className="cursor-pointer" onClick={()=>{changeChat(null)}}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </div>
      </div>

      <div className="mt-2">
        {sidebarList.map((item)=>{

          let chatId = searchParams.get("chat_id");
          return(
            <div 
              key={item.chatId} 
              className={`my-0.5 p-1 cursor-pointer hover:bg-primarygray ${chatId==item.chatId?"bg-primarygray":""}`}
              onClick={()=>{changeChat(item)}}
            >
              {item.title}
            </div>
          )
        })}
      </div>
    </div>
  )

}
