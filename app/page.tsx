import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Chatbox from "@/components/Chatbox";
import Searchbar from "@/components/Searchbar";

export default function Home(){
  

  console.log("page rerender..")
  return(
    <div className="grid grid-cols-[256px_1fr] h-screen">
      <Sidebar/>
      <div className="flex flex-col flex-1 pb-2 h-screen">
        <Header />
        <Chatbox/>
        <Searchbar/>
      </div>
    </div>
  )
}

