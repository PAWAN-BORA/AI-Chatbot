'use client';

import Chatbox from "@/components/Chatbox";
import Header from "@/components/Header";
import Searchbar from "@/components/Searchbar";
import RagSidebar from "@/components/sidebar/RagSidebar";


export default function Rag(){


  return(
    <div className="grid grid-cols-[256px_1fr] h-screen">
      <RagSidebar chatId={undefined}/>

      <div className="flex flex-col flex-1 pb-2 h-screen">
        <Header />
        <Chatbox />
        <Searchbar/>
      </div>
    </div>
  )
}
