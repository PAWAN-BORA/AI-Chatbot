import { getChatData } from "@/model/chat";
import { NextResponse } from "next/server";

export async function GET(){
  try {
    const data = await getChatData(1);
    return NextResponse.json(data, {status:200})
  } catch(err) {
    console.log(err);
    return NextResponse.json({msg:"failed"}, {status:503})
  }
}
