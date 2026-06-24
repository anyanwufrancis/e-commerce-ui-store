// import { accounts } from '@/interface/account';
// import { FormEvent, useState } from 'react';
// import { Link } from 'react-router-dom';

// const SignIn = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [isOpen, setIsOpen] = useState(false);

//   const handleLogin = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!email || !password) {
//       setError('Please fill in all fields');
//       return;
//     }

//     const user = accounts.find(acc => acc.email === email && acc.password === password);

//     if (user) {
//       alert('Successfully logged in.');
//       setError('');
//       setTimeout(() => {
//         window.location.href = '/product';
//       }, 1500);
//     } else {
//       alert("You don't have an account with us. Please create one.");
//       setError('');
//     }
//   };

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   return (
//     <main
//       className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
//       style={{ backgroundImage: `url('log.jpg')` }}
//     >
//       {/* Top-right Dropdown Menu */}
//       <div className="absolute top-4 right-4">
//         <div className="relative">
//           <button
//             onClick={toggleDropdown}
//             className="inline-flex w-[5em] rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-700 focus:outline-none"
//           >
         
//             Menu
//           </button>

//           {isOpen && (
//             <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
//               <div className="py-1">
//                 <Link
//                   to="/"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Home
//                 </Link>
//                 <Link
//                   to="/product"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Product
//                 </Link>
//                 <Link
//                   to="/AdminSignin"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Admin SignIn
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Login Form */}
//       <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-md w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

//         {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@example.com"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-2 text-sm text-blue-600"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? 'Hide' : 'Show'}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
//           >
//             Login
//           </button>
//         </form>

//         <p className="mt-4 text-sm text-center text-gray-800">
//           Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
//         </p>
//       </div>
//     </main>
//   );
// };

// export default SignIn;
