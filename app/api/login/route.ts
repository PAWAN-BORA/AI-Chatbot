import { createSession } from "@/lib/session";
import { getUser } from "@/model/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){


  try {
    const body = await req.json();
    if(body.username==undefined || body.password==undefined){
      return NextResponse.json({msg:"wrong payload"}, {status:400})
    }
    const data = await getUser(body.username, body.password);
    if(data.length==0){
      return NextResponse.json({msg:"wrong username or password"}, {status:401})
    }
    await createSession(data[0])
    return Response.json(data[0]);
  } catch(e) {
    let msg = "Error occured";
    if(e instanceof Error){
      msg = e.message;
    }
    const error = {msg:msg, err:e}
    return NextResponse.json(error, {status:503})
  }

}
