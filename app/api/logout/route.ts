import { deleteSession } from "@/lib/session";
import { withErrorHandler } from "@/utils/utils";
import { NextResponse } from "next/server";

export async function logout(){
  await deleteSession();
  return NextResponse.json({"msg":"logout successfully!"});
}

export const GET = withErrorHandler(logout);
