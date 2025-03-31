"use client";
import Header from "@/components/Header";


import Sidebar from "@/components/Sidebar";
import Chatbox from "@/components/Chatbox";
import Searchbar from "@/components/Searchbar";
// import dynamic from "next/dynamic";
// const Chatbox = dynamic(() => import("../components/Chatbox"), { ssr: false })

export default function Home(){
  // let sideList:string[] = []
  // let error = null;
  // try {
  //   let [sideList] = await pool.execute("SELECT * from chat WHERE user_id = ?", [1]);
  // } catch(err) {
  //   console.log(err);
  //   error = "Error in Db"
  // }

  return(
    <div className="grid grid-cols-[256px_1fr] h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 pb-2 h-screen">
        <Header />
        <Chatbox/>
        <Searchbar/>
      </div>
    </div>
  )
}

