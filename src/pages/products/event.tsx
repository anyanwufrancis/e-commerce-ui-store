import { useEffect, useState } from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import { IProduct } from "@/interface/iproducts";
const Products = () => {

    const [products, setProducts] = useState<IProduct[]>([]);

   

    useEffect(() => {
        try {
            fetch('https://fakestoreapi.com/products')
                .then(res => res.json())
                .then(data => {
                    setProducts(data)
                })
        } catch (err) {
            console.error(err);
        }
    }, [products])


    return (
        <main>
       
       

        
            <div className=" rounded-[10px] border-2 w-[15em] ml-[5em] border-200-red  font-medium text-[20px] pl-[2em]">
                <input  type="search" placeholder="Type to search" >
                </input>
             </div>
      
    
             <div className="border-2">
        <div className="grid grid-cols-4 gap-4">
        
            {
                products.length && products.map(({ image, title, price }, i) => (
                    <Card key={i} sx={{ maxWidth: 345 }} className="p-4">
                        <CardMedia
                            component="img"
                            alt="green iguana"
                            height="140"
                            image={image}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {price}
                            </Typography>
                        </CardContent>
                        {/* <CardActions>
                            <Button size="small">Share</Button>
                            <Button size="small">Learn More</Button>
                        </CardActions> */}
                    </Card>
                ))
            }
           
         </div>
         </div>
         </main>

     
    );
};

export default Products;