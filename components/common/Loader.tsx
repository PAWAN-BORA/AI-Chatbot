const Loader = ({size=30}:{size?:number})=>{
  return(
    <div 
      className={`border-4 border-success border-t-transparent rounded-full animate-spin`}
      style={{width:`${size}px`, height:`${size}px`}}
    >
    </div>
  )
};

export default Loader;
