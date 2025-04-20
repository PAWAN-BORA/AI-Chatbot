import { Chat } from "@/model/chat";
import { withErrorHandler } from "@/utils/utils";
import { NextResponse } from "next/server";

async function chatList(){
  const chat = await Chat.create();
  const session = chat.getSession()
  const data = await chat.getChatData(session.userId);
  return NextResponse.json(data, {status:200})
}

export const GET = withErrorHandler(chatList);
