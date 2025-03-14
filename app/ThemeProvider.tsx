"use client";
import { createContext, ReactNode, useEffect, useState } from "react";


type ThemeData ={
  theme:string,
  setTheme:(theme:string)=>void
}
export const ThemeContext = createContext<ThemeData|null>(null)
export default function ThemeProvider({children}:{children:ReactNode}){

  const [currentTheam, setCurrentTheme] = useState("light");
  useEffect(()=>{
    let theme = localStorage.getItem("theme");
    if(theme!=undefined){
      setTheme(theme);
    }
  }, []);
  function setTheme(theme:string){
    let documentEle = document.documentElement;
    if(documentEle!=undefined){
      documentEle.setAttribute("class", `theme-${theme}`);
    }
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme)
  }
  return <ThemeContext.Provider value={{
    theme:currentTheam,
    setTheme:setTheme,
  }}>{children}</ThemeContext.Provider>
}
