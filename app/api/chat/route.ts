import { ValidationError } from "@/lib/errors";
import { Chat } from "@/model/chat";
import { withErrorHandler } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

async function deleteChat(req:NextRequest){
  const chat = await Chat.create();
  const data = await req.json();
  if(data.chatId==undefined || isNaN(data.chatId)){
    throw new ValidationError("Invalid Chat id");
  }
  const deleteId = await chat.deleteChat(data.chatId);
  return NextResponse.json({msg:`chat deleted successfully with chat id ${deleteId}`}, {status:200})
}

export const DELETE = withErrorHandler(deleteChat);


async function updateChat(req:NextRequest){
  const chat = await Chat.create();
  const data = await req.json();
  if(data.chatId==undefined || isNaN(data.chatId)){
    throw new ValidationError("Invalid Chat id");
  }
  await chat.updateChatTitle(data.chatId, data.title);
  return NextResponse.json({msg:`chat updated successfully`}, {status:200})
}

export const PUT = withErrorHandler(updateChat);
