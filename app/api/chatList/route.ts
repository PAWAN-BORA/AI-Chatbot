import { getChatData } from "@/model/chat";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req:NextRequest){
  try {
    const data = await getChatData(1);
    return NextResponse.json(data, {status:200})
  } catch(err) {
    console.log(err);
    return NextResponse.json({msg:"failed"}, {status:503})
  }
}
