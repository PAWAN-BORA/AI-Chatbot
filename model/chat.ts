import 'server-only'
import pool from "@/lib/db";
import { verifySession } from '@/lib/session';
import { UserData } from './users';
import { UnauthorizedError } from '@/lib/errors';


type ChatResult = {
  insertId:number,
}
type ChatData = {
  chatId:string,
  userId:string,
  title:string,
}
export class Chat {
  private session:UserData;
  private constructor(session:UserData){
    this.session = session;
  }
  static async create(){
    const session = await verifySession();
    if(session==null){
      throw new UnauthorizedError();
    }
    return new Chat(session as UserData)
  }

  public getSession(){
    return this.session;
  }

  public async newChat(userId:number, title:string){
    const [res] = await pool.execute("INSERT INTO chat (user_id, title) VALUES (?, ?)", [userId, title]);
    return (res as ChatResult).insertId ;
  }
  public async getChatData(userId:number){
    const [res] = await pool.execute("SELECT * from chat where user_id=? ORDER BY chat_id DESC", [userId]);
    return (res as {[key:string]:string}[]).map((item)=>{
      return {
        chatId:item.chat_id,
        userId:item.user_id,
        title:item.title
      } as ChatData
    });
  }

  public async addChatMsg(chatId:number, ques:string, ans:string){
    const [res] = await pool.execute("INSERT INTO chat_msg (chat_id, ques, ans) VALUES (?, ?, ?)", [chatId, ques, ans]);
    return (res as ChatResult).insertId ;
  }

  public async getChatMsg(chatId:number){
    const [res] = await pool.execute("SELECT * from chat_msg where chat_id=?", [chatId]);
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

  public async getLimetedChatMsg(chatId:number, limit:number=100){
    const query = `SELECT * from chat_msg WHERE chat_id=? LIMIT ${limit}`;
    const values = [chatId];
    const [res] = await pool.execute(query, values);
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
  public async deleteChat(chatId:number){
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute("DELETE from chat_msg WHERE chat_id=?", [chatId]);
      const [res] = await connection.execute("DELETE from chat WHERE chat_id=?", [chatId]);
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
  public async updateChatTitle(chatId:number, title:string){
    const [res] = await pool.execute("UPDATE chat SET title=? WHERE chat_id=?", [title, chatId]);
    return (res as ChatResult).insertId ;

  }
}
