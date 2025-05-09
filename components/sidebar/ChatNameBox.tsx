import { ChatData } from "@/store/store";
import { updateChat } from "@/utils/chatFetch";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SideDivProps = {
  chat:ChatData,
  changeChat:(chat:ChatData)=>void,
  handleDelete:(chat:ChatData)=>void,
}
export default function ChatNameBox({chat, changeChat, handleDelete}:Readonly<SideDivProps>){

  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat_id");
  const [title, setTitle] = useState(chat.title);
  const [isEditable, setIsEditable] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    setTitle(chat.title);
  }, [chat.title]);

  function handleDoubleClick(){
    setIsEditable(true);
    setTimeout(() => {
      const ele = divRef.current;
      ele?.focus();
      if(ele==null)return;
      const range = document.createRange();
      range.selectNodeContents(ele);
      range.collapse(false);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }
  function handleBlur(){
    setIsEditable(false);
    updateTitle();
  }
  async function updateTitle(){
    try {
      const text = divRef.current?.innerText;
      const payload = {
        chatId:chat.chatId,
        title:text ?? "",
      }
      const res = await updateChat(payload);
      console.log(res)

    } catch(err){
      console.log(err)

      // TODO: show error snackbar.
    } finally {
    }
  }
  return(
    <div 
      className={`my-0.5 p-1 flex select-none justify-between items-center gap-2 hover:bg-primarygray ${chatId==chat.chatId?"bg-primarygray":""}`}
    >
      <div
        ref={divRef}
        onClick={()=>{changeChat(chat)}}
        onDoubleClick={handleDoubleClick}
        suppressContentEditableWarning={true}
        className="cursor-pointer flex-1" 
        contentEditable={isEditable}
        onBlur={handleBlur}
      >
        {title}
      </div>
      <div
        className="cursor-pointer"
        onClick={()=>{handleDelete(chat)}}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </div>
    </div>
  )
}
