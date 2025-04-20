'use client';

import ErrorBox from "@/components/common/ErrorBox";
import Loader from "@/components/common/Loader";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginPayload = {
  username:string,
  password:string,
}
async function login(payload:LoginPayload){
  const res = await fetch("/api/login", {
    method:"POST",
    body:JSON.stringify(payload)
  })
  if(res.ok){
    const result = await res.json();
    return result;
  }
  const errorRes =  await res.json(); 
  throw new Error(errorRes.msg || "Error in getting data.");
}

export default function Login(){

  // const {mutate, isPending, status, data, error} = useMutation({
  //   mutationFn:login,
  //   retry:false,
  //   onSuccess:()=>{
  //     console.log("login successfully");
  //     router.push("/");
  //   }
  // });
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error|null>(null);

  async function handleLogin(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({username, password})
      router.push("/");
    } catch(err) {
      if(err instanceof Error){
        setError(err);
      } else {
        setError(new Error("Server Error."))
      }
    } finally {
      setLoading(false);
    }
    // mutate({username:username, password:password});
  }
  return(
    <div className="min-h-screen flex items-center justify-center bg-primarygray">
      <div className="w-full max-w-md bg-background p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && 
          <div className="mb-4 text-center">
            <ErrorBox errMsg={error.message}/> 
          </div>
        }

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 text-foreground">Username</label>
            <input
              type="text"
              placeholder="Enter email"
              value={username}
              onChange={(e)=>{setUsername(e.target.value)}}
              className="w-full px-4 py-2 border bg-white text-black border-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e)=>{setPassword(e.target.value)}}
              placeholder="Enter password"
              className="w-full px-4 py-2 bg-white text-black border border-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-foreground text-background py-2 rounded-md cursor-pointer
            hover:bg-foreground/20 transition flex justify-center 
            disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-default"
            disabled={loading}
            
          >
            {loading?<Loader size={20}/>:"Login"}
          </button>
        </form>
      </div>
    </div>
  )

}
