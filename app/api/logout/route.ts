import { deleteSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(){
  try {
    await deleteSession();
    return Response.json({"msg":"logout successfully!"});
  } catch(e) {
    let msg = "Error occured";
    if(e instanceof Error){
      msg = e.message;
    }
    const error = {msg:msg, err:e}
    return NextResponse.json(error, {status:503})
  }

}
