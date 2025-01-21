import{ useState,useEffect } from"react";
import { IProduct } from "@/interface/iproducts"
const SortPro = () =>{
   
    const [product,setProducts]=useState<IProduct[]>([])
    useEffect(()=>{
        try{
            fetch('http://fakestoreapi.com/product?sort=desc')
            .then(res =>res.json())
            .then(data =>{
                setProducts(data)
            })
        
        }catch(err) {
            console.error(err)
        }
    },[product])
}

export default SortPro;
