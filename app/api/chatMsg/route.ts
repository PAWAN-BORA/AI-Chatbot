import { verifySession } from "@/lib/session";
import { getChatMsg } from "@/model/chat";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
  try {
    const session = await verifySession();
    if(session==null){
      return NextResponse.json({msg:"unauthorized"}, {status:401})
    }
    const chatId = req.nextUrl.searchParams.get("chat_id");
    if(chatId==null){
      return NextResponse.json({msg:"failed"}, {status:400})
    }
    const data = await getChatMsg(Number(chatId));
    return NextResponse.json(data, {status:200})
  } catch(err) {
    console.log(err);
    return NextResponse.json({msg:"failed"}, {status:503})
  }
}
