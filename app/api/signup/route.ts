import { ValidationError } from "@/lib/errors";
import { addUser } from "@/model/users";
import { withErrorHandler } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

async function signup(req:NextRequest){
  const body = await req.json();
  console.log(body);
  console.log("----------------------------------");
  if(body.name==undefined || body.password==undefined || body.email==undefined){
    throw new ValidationError("wrong payload")
  }
  const hashPassword = await bcrypt.hash(body.password, 10);
  const id = await addUser(body.name, body.email, hashPassword);
  return NextResponse.json({msg:"User created successfully", id:id});
}

export const POST = withErrorHandler(signup);
