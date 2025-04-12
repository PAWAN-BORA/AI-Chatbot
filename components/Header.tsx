"use client";
import { ThemeContext } from "@/app/ThemeProvider"
import { MouseEvent, useContext, useEffect, useState } from "react"

export default function Header(){

  const {theme, setTheme} = useContext(ThemeContext)!;
  const [isOpen, setIsOpen] = useState(false);
  function toggleDropDown(e:MouseEvent<HTMLButtonElement>){
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  }
  useEffect(()=>{
    function clickOutside() {
      setIsOpen(false);
    }
    window.addEventListener('click', clickOutside)
    return ()=>{

      window.removeEventListener('click', clickOutside)
    }
  }, [])
  return(
    <header className="flex items-center justify-between bg-primarygray px-4 py-1 shadow-md">
      {/* Left Side - Title */}
      <h1 className="text-xl font-bold">Chat Bot</h1>

      {/* Right Side - Dropdown */}
      <div className="relative">
        <button 
          className="p-2 rounded-full bg-primaryyellow hover:bg-gray-700"
          onClick={toggleDropDown}
        >
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
        {isOpen && 
          <div className="absolute right-0 mt-2 w-40 bg-primarygray shadow-lg rounded-lg transition-opacity">
            <button className="w-full text-left px-4 py-2 hover:bg-primaryyellow" onClick={()=>{setTheme(theme=="dark"?"light":"dark")}}>
              Toggle Theme
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-primaryyellow">
              Logout / Login
            </button>
          </div>
        }
      </div>
    </header>
  )
}


