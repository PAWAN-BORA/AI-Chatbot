export default function ErrorBox({errMsg}:Readonly<{errMsg:string}>){


  return(
    <div className="bg-red-200 text-red-600 py-1 px-2 rounded text-sm">
      {errMsg}
    </div>
  )
}
