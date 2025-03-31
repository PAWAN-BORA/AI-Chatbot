import { ReactNode } from "react";
import {createPortal} from 'react-dom';


type TooltipProps = {
  children:ReactNode,
  title:ReactNode,
}

export default function Tooltip({children, title}:Readonly<TooltipProps>){


  return createPortal(
    <div className="group relative">
      {children}
       <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-sm px-2 py-1 rounded whitespace-nowrap">
        {title}
       </div>
      {/* <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-l-transparent border-r-transparent border-b-transparent border-t-4 border-t-gray-800"></div> */}
    </div>,
    document.body
  )
}
