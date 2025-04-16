import { verifySession } from "@/lib/session";
import { getChatData } from "@/model/chat";
import { NextResponse } from "next/server";

type UserData = {
  user_id:number,
  name:string,
  email:string,

}
export async function GET(){
  try {
    const session = await verifySession();
    if(session==null){
      return NextResponse.json({msg:"unauthorized"}, {status:401})
    }
    const userId = (session as UserData).user_id;
    const data = await getChatData(userId);
    return NextResponse.json(data, {status:200})
  } catch(err) {
    console.log(err);
    return NextResponse.json({msg:"failed"}, {status:503})
  }
}
