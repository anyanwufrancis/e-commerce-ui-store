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
    <main className="w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products..."
        aria-label="Search for products"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/25 sm:text-base"
      />
    </main>
  );
};

export default Searchbox;