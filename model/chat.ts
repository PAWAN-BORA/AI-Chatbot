import 'server-only'
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
  let [res] = await pool.execute("SELECT * from chat where user_id=? ORDER BY chat_id DESC", [userId]);
  return (res as {[key:string]:string}[]).map((item)=>{
    return {
      chatId:item.chat_id,
      userId:item.user_id,
      title:item.title
    } as ChatData
  });
}


export async function getChatMsg(chatId:number){
  let [res] = await pool.execute("SELECT * from chat_msg where chat_id=?", [chatId]);
  return (res as {[key:string]:string}[]).map((item)=>{
    let ques = null;
    try{
      ques = JSON.parse(item.ques);
    } catch {
      ques = {};
    }
    return {
      msgId:item.msg_id,
      chatId:item.chat_id,
      ques:ques,
      ans:item.ans
    } 
  });
}

export async function getLimetedChatMsg(chatId:number, limit:number=100){
  const query = `SELECT * from chat_msg WHERE chat_id=? LIMIT ${limit}`;
  const values = [chatId];
  let [res] = await pool.execute(query, values);
  return (res as {[key:string]:string}[]).map((item)=>{
    let ques = null;
    try{
      ques = JSON.parse(item.ques);
    } catch {
      ques = {};
    }
    return {
      msgId:item.msg_id,
      chatId:item.chat_id,
      ques:ques,
      ans:item.ans
    } 
  });
}


export async function deleteChat(chatId:number){
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("DELETE from chat_msg WHERE chat_id=?", [chatId]);
    let [res] = await connection.execute("DELETE from chat WHERE chat_id=?", [chatId]);
    connection.commit();
    return (res as ChatResult).insertId ;
  } catch(err) {
    await connection.rollback();
    if(err instanceof Error){
      throw new Error("Error: "+err.message)
    }
    throw new Error("Error: unknown")
  } finally {
    connection.release();
  }

}
