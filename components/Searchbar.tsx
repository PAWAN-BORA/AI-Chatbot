"use client"

import { StoreContext } from "@/app/Store";
import useStore from "@/store/store";
import { getRandomId } from "@/utils/utils";
import { FormEvent, useContext, useState } from "react";

export default function Searchbar() {

  const [inputVal, setInputVal] = useState("");
  const {dispatch} = useContext(StoreContext)!
  const setMessage = useStore(state=>state.setMessage);

  const handleSubmit = (e:FormEvent)=>{
    e.preventDefault();
    // dispatch({
    //   type:"humanMsg",
    //   msg:inputVal,
    // });
    setMessage({type:"humnaMsg", msg:inputVal, id:getRandomId().toString()})
    setInputVal("");
  }

  return(
   <div className="flex justify-center">
      <form className="min-w-96 flex gap-2 p-4 border border-gray-400 rounded-xl items-center" onSubmit={handleSubmit}>
        <input 
          className="w-full p-2 border-none outline-none bg-transparent focus:ring-0"
          type="text" 
          placeholder="Ask anything" 
          value={inputVal}
          onChange={(e)=>{setInputVal(e.target.value)}}
        />
        <button className="cursor-pointer"  type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  )
}

