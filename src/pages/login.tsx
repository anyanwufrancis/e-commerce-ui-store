import { useEffect, useState } from "react";
import { IProduct } from "@/interface/iproducts";


const Login=() =>{
    const [product] = useState<IProduct[]>([]);

    
    useEffect(() => {
        try {
            fetch('https://dummyjson.com/user/login', {
            method:'POST',
            headers: { 'Content-Type' : 'application/json'  },
            body: JSON.stringify({
                username:'emilys',
                password:'emilyspass',
                experiesInMins:30,
            }),
            })
            .then(res => res.json())
            .then(console.log)
               
        } catch (err) {
            console.error(err);
        }
     }, [product])


            
    return(
        <main>
            <div>
                <img src="remitel-logo.png" alt="remitel-log" />
            </div>
            <div>
                 <h1 className="text-[5px] font-black text-[white]">Sign in</h1>
            </div>
            <div className="font-black text-[2em]">
                <p> Fill the form to register an account</p>
            </div>
                <div className="ml-[6em]">
                    <label htmlFor="email" id="test"  className="mt-[1.5em] text-[2em]">Email</label> <br/>
                    <input type="email" placeholder="Please enter your email" 
                    name="email" id="email"/>
                    <br/>
                    <label htmlFor="password" id="wed" className="mt-[1.5em] text-[2em]">Password</label> <br/>
                    <input type="password" placeholder="Create your password" name="password" id="password"/> 
                </div>
                <div  className="rounded-[25px] text-[1.7em] border-[2] mt-[2em] text-[white] bg-[black] pt-[6px] pb-[5px] pl-[6px] pr-[5px] w-[17em] ml-[1.5em]">
                    <button>Sign up</button>
                </div>
            
        </main>
    )
}
export default Login;