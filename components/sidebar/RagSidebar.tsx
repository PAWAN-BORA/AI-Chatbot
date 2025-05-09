"use client"
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react"
import Modal from "@/components/Modal";
import { deleteChat, getChatMsg } from "@/utils/chatFetch";
import useStore, { AnsData, ChatData, ChatMsg } from "@/store/store";
import ChatNameBox from "./ChatNameBox";
import SideHead from "./SideHead";
import ChatDeleteModal from "./ChatDeleteModal";


export default function RagSidebar({chatId}:Readonly<{chatId:string|undefined}>) {

  // const {getChats} = useContext(StoreContext)!;
  const sidebarList = useStore(state=>state.ragChatList);
  const updateChatList = useStore(state=>state.updateRagChatList);
  const resetData = useStore(state=>state.resetData);
  const searchParams = useSearchParams();
  const [delObj, setDelObj] = useState<{status:boolean, chat:null|ChatData}>({
    status:false,
    chat:null,
  });
  const [deleting, setDeleting] = useState(false);
  useEffect(()=>{
    resetData();
    updateChatList();
  }, [resetData, updateChatList])
  useEffect(()=>{
    async function getChatList(){
      if(chatId==null)return;
      try {
        const msgList:ChatMsg[] = await getChatMsg(chatId);
        const quesList = [], ansList:AnsData={};
        console.log(msgList, 'msglist')
        if(msgList.length==0){
          window.history.pushState(null, "", "/");
          resetData();
          return;
        }
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
    <div className="h-full overflow-y-auto mx-1 border-r border-r-primarygray">
      <SideHead newChat={()=>{changeChat(null)}}/>
      <div className="mt-2">
        {sidebarList.map((item)=>{
          return(
            <ChatNameBox key={item.chatId} chat={item} changeChat={changeChat} handleDelete={handleDelete}/>
          )
        })}
      </div>
      <ChatDeleteModal
        isOpen={delObj.status}
        chatTitle={delObj.chat?.title}
        onClose={()=>{
          setDelObj((prev)=>{
            return {...prev, status:false, chat:null}
          });
        }}
        deleteChat={()=>{deleteChatData(delObj.chat)}}
        isDisable={deleting}
      />
    </div>
  )

}

