"use client"
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react"
import Modal from "./Modal";
import { deleteChat, getChatMsg, updateChat } from "@/utils/chatFetch";
import useStore, { AnsData, ChatData, ChatMsg } from "@/store/store";


export default function Sidebar({chatId}:Readonly<{chatId:string|undefined}>) {

  // const {getChats} = useContext(StoreContext)!;
  const sidebarList = useStore(state=>state.chatList);
  const updateChatList = useStore(state=>state.updateChatList);
  const resetData = useStore(state=>state.resetData);
  const searchParams = useSearchParams();
  const [delObj, setDelObj] = useState<{status:boolean, chat:null|ChatData}>({
    status:false,
    chat:null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(()=>{
    async function getChatList(){
      if(chatId==null)return;
      try {
        const msgList:ChatMsg[] = await getChatMsg(chatId);
        const quesList = [], ansList:AnsData={};
        for(const chat of msgList){
          const quesId = chat.ques.id;
          quesList.push(chat.ques);
          ansList[quesId] = chat.ans;
        }
        resetData(quesList, ansList);
      } catch(err) {
        console.log(err);
      }
    }
    getChatList();
  }, [chatId, resetData])
  function changeChat(chat:ChatData|null){
    if(chat==null){
      window.history.pushState(null, "", "/");
      resetData();
      return;
    }
    window.history.pushState(null, "", "?chat_id="+chat.chatId)
    chatMsgList(chat.chatId);
  }

  function handleDelete(chat:ChatData){
    setDelObj((prev)=>{
      return {...prev, status:true, chat:chat}
    });

  }
  async function chatMsgList(chatId:string){
    try {
      const msgList:ChatMsg[] = await getChatMsg(chatId);
      const quesList = [], ansList:AnsData={};
      for(const chat of msgList){
        const quesId = chat.ques.id;
        quesList.push(chat.ques);
        ansList[quesId] = chat.ans;
      }
      resetData(quesList, ansList);
    } catch(err) {
      console.log(err);
    }
  }
  async function deleteChatData(chat:ChatData|null){
    if(chat==null) return;
    setDeleting(true);
    try {
      await deleteChat(chat.chatId);
      setDelObj((prev)=>{
        return {...prev, status:false, chat:null}
      });
      updateChatList();
      const chatId = searchParams.get("chat_id");
      if(chatId==chat.chatId){
        changeChat(null);
      }

    } catch(err){

      console.log(err);
      // TODO: show error snackbar.
    } finally {
      setDeleting(false)
    }
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
          return(
            <SideDiv key={item.chatId} chat={item} changeChat={changeChat} handleDelete={handleDelete}/>
          )
        })}
      </div>
      <Modal
        isOpen={delObj.status}
        title="Delete Chat"
        onClose={()=>{
          setDelObj((prev)=>{
            return {...prev, status:false, chat:null}
          });
        }}
        
      >
        <div>Are you sure to delele chat <b>{delObj.chat?.title}</b>?</div>
        <div className="flex justify-end mt-4">
          <button 
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
            onClick={()=>{deleteChatData(delObj.chat)}}
            disabled={deleting}
          >
            {deleting?
              "Deleting...":"Delete"
            }
          </button>
        </div>
      </Modal>
    </div>
  )

}

type SideDivProps = {
  chat:ChatData,
  changeChat:(chat:ChatData)=>void,
  handleDelete:(chat:ChatData)=>void,
}
function SideDiv({chat, changeChat, handleDelete}:Readonly<SideDivProps>){

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
