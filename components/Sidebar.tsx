"use client"
import { useState } from "react"


type SidebarProps = {
  initialList:string[]
  error:null|string,
}
export default function Sidebar({initialList, error}:Readonly<SidebarProps>) {


  const [sideList, setSideList] = useState<string[]>(initialList);
  console.log(sideList, 'tste.')

  if(error!=null){
    return <div>{error}</div>
  }
  return(
    <div className="bg-red-100 h-full overflow-auto">

      <div>
        Top part
      </div>

      <div className="mt-2">
        {sideList.map((item)=>{

          console.log(item);
          return(
            <div>
              test
            </div>
          )
        })}
      </div>
    </div>
  )

}
