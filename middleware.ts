import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/session';
 
// This function can be marked async if using await inside
export async function middleware(request: NextRequest) {
  const session = await verifySession();
  if(session==null){
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
 
export const config = {
  matcher: [
    '/((?!login|signup|_next/static|_next/image|api|favicon.ico).*)'
  ],
}
