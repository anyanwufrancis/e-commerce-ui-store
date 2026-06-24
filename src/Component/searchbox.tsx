// Import necessary modules and types
import { IProduct } from "@/interface/iproducts";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

type ISearchProps = {
  products: IProduct[]; 
  setProducts: Dispatch<SetStateAction<IProduct[]>>; 
};

const Searchbox: React.FC<ISearchProps> = ({ products, setProducts }) => {
  const [query, setQuery] = useState(''); 

  useEffect(() => {

    const searchedproduct = products.filter((product: IProduct) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  
    setProducts(searchedproduct);
  }, [query]);

  return (
    <main>

      <input
        type="text" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search for products..."
        className="border-2 py-1 px-1 rounded-[5px]" 
      />
    </main>
  );
};

export default Searchbox;