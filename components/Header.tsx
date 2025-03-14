"use client";
import { ThemeContext } from "@/app/ThemeProvider"
import { useContext } from "react"

export default function Header(){

  const {theme, setTheme} = useContext(ThemeContext)!;
  return(
    <header className="flex justify-center mt-2 gap-4">
      <div>AI chat Bot</div>
      <button onClick={()=>{setTheme(theme=="dark"?"light":"dark")}}>
        {theme=="dark"?"light theme":"dark Theme"}
      </button>
    </header>
  )
}


