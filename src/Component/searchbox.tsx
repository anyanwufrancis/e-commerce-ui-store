import { IProduct } from "@/interface/iproducts"
import{ useState,useEffect } from"react";
const Searchbox =()=>{
    const [product]=useState<IProduct[]>([])
    useEffect (()=>{
        try{
            fetch('https://dummyjson.com/products/search?q=phone')
            .then(res => res.json())
            .then(console.log);
      
        }catch(err){
            console.error(err)
        }
    }, [product])
    return(
        <div className=" rounded-[10px] border-2 w-[15em] ml-[5em] border-200-red  font-medium text-[20px] pl-[2em]">
        <input  type="search" placeholder="Type to search" >
        </input>
     </div>
    )
   
}
export default Searchbox;