import { ValidationError } from "@/lib/errors";
import { Chat } from "@/model/chat";
import { withErrorHandler } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

async function addMsg(req:NextRequest){
  const chat = await Chat.create();
  const data = await req.json();
  if(data.chatId==undefined || data.ques==undefined || data.ans==undefined){
    throw new ValidationError();
  }
  const msgId = await chat.addChatMsg(data.chatId, data.ques, data.ans);
  return NextResponse.json({msg:"successfull", id:msgId}, {status:200})

}

export const POST = withErrorHandler(addMsg)
