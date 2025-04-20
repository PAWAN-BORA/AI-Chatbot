import pool from "@/lib/db";

export type UserData = {
  userId:number,
  name:string,
  email:string,
}

export async function getUser(username:string, password:string){

  const [res] = await pool.execute("SELECT user_id as userId, name, email from users where email=? AND password=? AND status=1", [username, password]);
  return (res as UserData[]);

}
