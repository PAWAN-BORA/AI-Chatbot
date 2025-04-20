import { ValidationError } from "@/lib/errors";
import { Chat } from "@/model/chat";
import { withErrorHandler } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

async function chatMsg(req:NextRequest){
  const chat = await Chat.create();
  const chatId = req.nextUrl.searchParams.get("chat_id");
  if(chatId==null){
    throw new ValidationError("Chat id is missing")
  }
  const data = await chat.getChatMsg(Number(chatId));
  return NextResponse.json(data, {status:200})
}

export const GET = withErrorHandler(chatMsg);
