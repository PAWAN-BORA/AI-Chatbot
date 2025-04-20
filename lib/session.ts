import 'server-only';
import { SignJWT, jwtVerify } from "jose";
import { cookies } from 'next/headers'

const key = new TextEncoder().encode("test123");

type Payload = Record<string, string|number>;
const algorithum = "HS256";
function encrypt(payload:Payload){
  return new SignJWT(payload)
  .setProtectedHeader({alg:algorithum})
  .setExpirationTime("2h")
  .sign(key);
}
const sessionCookie = {
  name:"token",
  option:{
    httpOnly:true,
    secure:true,
    maxAge:60*60*2,
    path:"/",
  },

}
async function decrypt(jwt:string){

  try {
    const {payload} = await jwtVerify(jwt, key, {algorithms:[algorithum]});

    return payload;
  } catch(err) {
    console.log(err);
    return null;
  }
}

export async function createSession(payload:Payload){
  const token = await encrypt(payload);
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie.name, token, {...sessionCookie.option});
}
export async function verifySession(){
  const cookieStore = await cookies()
  const token = cookieStore.get(sessionCookie.name);
  if(token==undefined){
    return null;
  }
  const session =  await decrypt(token.value);
  return session;

}
export async function deleteSession(){
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie.name);
}
