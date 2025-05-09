import Header from "@/components/Header";


import Sidebar from "@/components/sidebar/Sidebar";
import Chatbox from "@/components/Chatbox";
import Searchbar from "@/components/Searchbar";
type Props = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}
export default async function Home({searchParams}:Props){
  const params = await searchParams;
  const chatId = typeof params.chat_id=="string"?params.chat_id:undefined;

  return(
    <div className="grid grid-cols-[256px_1fr] h-screen">
      <Sidebar chatId={chatId}/>
      <div className="flex flex-col flex-1 pb-2 h-screen">
        <Header />
        <Chatbox/>
        <Searchbar/>
      </div>
    </div>
  )
}

