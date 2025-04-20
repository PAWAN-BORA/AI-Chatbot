import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { createSession } from "@/lib/session";
import { getUser } from "@/model/users";
import { withErrorHandler } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

async function login(req:NextRequest){
  const body = await req.json();
  if(body.username==undefined || body.password==undefined){
    throw new ValidationError("wrong payload")
  }
  const data = await getUser(body.username, body.password);
  if(data.length==0){
    throw new UnauthorizedError("wrong username or password")
  }
  await createSession(data[0])
  return NextResponse.json(data[0]);

}

export const POST = withErrorHandler(login);
