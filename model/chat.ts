import pool from "@/lib/db";

type ChatResult = {
  insertId:number,
}
export async function newChat(userId:string, title:string){

  let [res] = await pool.execute("INSERT INTO chat (user_id, title) VALUES (?, ?)", [userId, title]);
  return (res as ChatResult).insertId ;

}

export async function addChatMsg(chatId:number, ques:string, ans:string){
  let [res] = await pool.execute("INSERT INTO chat_msg (chat_id, ques, ans) VALUES (?, ?, ?)", [chatId, ques, ans]);
  return (res as ChatResult).insertId ;
}

type ChatData = {
  chatId:string,
  userId:string,
  title:string,
}
export async function getChatData(userId:number){
  let [res] = await pool.execute("SELECT * from chat where user_id=?", [userId]);
  return (res as {[key:string]:string}[]).map((item)=>{
    return {
      chatId:item.chat_id,
      userId:item.user_id,
      title:item.title
    } as ChatData
  });
}
