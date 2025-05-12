import Chatbox from "@/components/Chatbox";
import ChatRagSearchBox from "@/components/ChatRagSearchBox";
import Header from "@/components/Header";
import RagSidebar from "@/components/sidebar/RagSidebar";


type Props = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}
export default async function Rag({searchParams}:Props){
  const params = await searchParams;
  const chatId = typeof params.chat_id=="string"?params.chat_id:undefined;
  return(
    <div className="grid grid-cols-[256px_1fr] h-screen">
      <RagSidebar chatId={chatId}/>

      <div className="flex flex-col flex-1 pb-2 h-screen">
        <Header />
        <Chatbox />
        <ChatRagSearchBox/>
      </div>
    </div>
  )
}
