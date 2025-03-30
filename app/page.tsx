import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Chatbox from "@/components/Chatbox";
import Searchbar from "@/components/Searchbar";
import pool from "@/lib/db";

export default async function Home(){
  let sideList:string[] = []
  let error = null;
  try {
    let [sideList] = await pool.execute("SELECT * from chat WHERE user_id = ?", [1]);
  } catch(err) {
    console.log(err);
    error = "Error in Db"
  }

  return(
    <div className="grid grid-cols-[256px_1fr] h-screen">
      <Sidebar initialList={sideList} error={error}/>
      <div className="flex flex-col flex-1 pb-2 h-screen">
        <Header />
        <Chatbox/>
        <Searchbar/>
      </div>
    </div>
  )
}

