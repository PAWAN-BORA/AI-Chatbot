"use client";
import { ThemeContext } from "@/app/ThemeProvider"
import { customFetch } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { MouseEvent, useContext, useEffect, useState } from "react"

export default function Header(){

  const {theme, setTheme} = useContext(ThemeContext)!;
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  function toggleDropDown(e:MouseEvent<HTMLButtonElement>){
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  }
  useEffect(()=>{
    function clickOutside() {
      console.log("outside clicked..");
      setIsOpen(false);
    }
    window.addEventListener('click', clickOutside)
    return ()=>{

      window.removeEventListener('click', clickOutside)
    }
  }, [])

  async function handleLogout(){
    const res = await customFetch("/api/logout");
    if(res.ok){
      router.push("/login");
    }
  }
  const isDarkMode = theme=="dark";
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
          <div className="absolute right-0 mt-2 w-40 bg-primarygray shadow-lg rounded-lg transition-opacity" onClick={(e)=>{e.stopPropagation(); e.preventDefault();}}>
            <button className="flex items-center justify-between gap-4 w-full text-left px-4 py-2 hover:bg-primaryyellow" onClick={()=>{setTheme(isDarkMode?"light":"dark")}}>
              <span>{isDarkMode?"Dark":"Light"}</span>
              <div className="relative">
                {/* Track */}
                <div className="w-14 h-8 bg-menubg rounded-full shadow-inner" />

                {/* Thumb with icons */}
                <div className={`absolute top-1 left-1 w-6 h-6 flex items-center justify-center bg-menufg rounded-full transform transition-transform duration-300 ${ isDarkMode ? 'translate-x-6' : 'translate-x-0' }`}>
                  {isDarkMode ? 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>: 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  }
                </div>
              </div>             
              {/* <span>dark</span> */}

              {/* {theme==="dark"? 
                <div>light</div>:
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              } */}
              {/* Toggle Theme */}
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-primaryyellow" onClick={handleLogout}>
              Logout 
            </button>
          </div>
        }
      </div>
    </header>
  )
}


