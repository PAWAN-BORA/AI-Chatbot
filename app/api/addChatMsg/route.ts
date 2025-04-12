import { addChatMsg } from "@/model/chat";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req:NextRequest){

  const data = await req.json();
  if(data.chatId==undefined || data.ques==undefined || data.ans==undefined){
    return NextResponse.json({msg:"failed"}, {status:400})
  }

  try {
    const msgId = await addChatMsg(data.chatId, data.ques, data.ans);
    return NextResponse.json({msg:"successfull", id:msgId}, {status:200})
  } catch(err) {
    console.log(err);
    return NextResponse.json({msg:"failed"}, {status:503})
  }


}
