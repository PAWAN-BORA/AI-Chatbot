import pool from "@/lib/db";

export type UserData = {
  userId:number,
  name:string,
  email:string,
  password:string,
}

export async function getUser(username:string){

  const [res] = await pool.execute("SELECT user_id as userId, name, email, password from users where email=? AND status=1", [username]);
  return (res as UserData[]);

}
export async function addUser(name:string, email:string, password:string){
  const [res] = await pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password]);
  return (res as {insertId:number}).insertId;

}
