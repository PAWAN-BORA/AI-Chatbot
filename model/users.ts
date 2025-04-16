import pool from "@/lib/db";



export async function getUser(username:string, password:string){

  const [res] = await pool.execute("SELECT user_id, name, email from users where email=? AND password=? AND status=1", [username, password]);
  return (res as {[key:string]:string}[]);

}
