"use client";
import { ThemeContext } from "@/app/ThemeProvider"
import { useContext } from "react"

export default function Header(){

  const {theme, setTheme} = useContext(ThemeContext)!;
  return(
    <header className="flex items-center justify-between bg-primarygray px-4 py-1 shadow-md">
      {/* Left Side - Title */}
      <h1 className="text-xl font-bold">Chat Bot</h1>

      {/* Right Side - Dropdown */}
      <div className="relative group">
        <button className="p-2 rounded-full bg-primaryyellow hover:bg-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v.01M12 12v.01M12 18v.01"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-40 bg-primarygray shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-full text-left px-4 py-2 hover:bg-primaryyellow" onClick={()=>{setTheme(theme=="dark"?"light":"dark")}}>
            Toggle Theme
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-primaryyellow">
            Logout / Login
          </button>
        </div>
      </div>
    </header>
  )
}


