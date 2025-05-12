import { ValidationError } from "@/lib/errors";
import { RagChat } from "@/model/Ragchat";
import { withErrorHandler } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

async function chatMsg(req:NextRequest){
  const chat = await RagChat.create();
  const chatId = req.nextUrl.searchParams.get("chat_id");
  if(chatId==null){
    throw new ValidationError("Chat id is missing")
  }
  const data = await chat.getChatMsg(Number(chatId));
  return NextResponse.json(data, {status:200})
}

export const GET = withErrorHandler(chatMsg);
async function addMsg(req:NextRequest){
  const chat = await RagChat.create();
  const data = await req.json();
  if(data.chatId==undefined || data.ques==undefined || data.ans==undefined){
    throw new ValidationError();
  }
  const msgId = await chat.addChatMsg(data.chatId, data.ques, data.ans);
  return NextResponse.json({msg:"successfull", id:msgId}, {status:200})

}

export const POST = withErrorHandler(addMsg)
