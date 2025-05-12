import { ValidationError } from "@/lib/errors";
import { RagChat } from "@/model/Ragchat";
import { withErrorHandler } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

async function chatList(){
  const chat = await RagChat.create();
  const session = chat.getSession()
  const data = await chat.getChatData(session.userId);
  return NextResponse.json(data, {status:200})
}

export const GET = withErrorHandler(chatList);


async function deleteChat(req:NextRequest){
  const chat = await RagChat.create();
  const data = await req.json();
  if(data.chatId==undefined || isNaN(data.chatId)){
    throw new ValidationError("Invalid Chat id");
  }
  const deleteId = await chat.deleteChat(data.chatId);
  return NextResponse.json({msg:`chat deleted successfully with chat id ${deleteId}`}, {status:200})
}

export const DELETE = withErrorHandler(deleteChat);


async function updateChat(req:NextRequest){
  const chat = await RagChat.create();
  const data = await req.json();
  if(data.chatId==undefined || isNaN(data.chatId)){
    throw new ValidationError("Invalid Chat id");
  }
  await chat.updateChatTitle(data.chatId, data.title);
  return NextResponse.json({msg:`chat updated successfully`}, {status:200})
}

export const PUT = withErrorHandler(updateChat);
