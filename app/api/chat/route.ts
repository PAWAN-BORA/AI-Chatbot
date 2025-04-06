import { deleteChat } from "@/model/chat";
import { NextRequest, NextResponse } from "next/server";



export async function DELETE(req:NextRequest){
  try {
    const data = await req.json();
    if(data.chatId==undefined || isNaN(data.chatId)){
      return NextResponse.json({msg:"failed"}, {status:400})
    }
    const deleteId = await deleteChat(data.chatId);
    return NextResponse.json({msg:`chat deleted successfully with chat id ${deleteId}`}, {status:200})
  } catch(err) {
    console.log(err);
    let message = "unknown error";
    if(err instanceof Error){
      message = err.message;
    }
    return NextResponse.json({msg:message}, {status:503})
  }
}
