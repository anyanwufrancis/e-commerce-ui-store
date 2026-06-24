// import { accounts } from '@/interface/account';
// import { FormEvent, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// const SignUp = () => {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [isOpen, setIsOpen] = useState(false); // Dropdown toggle
//   const navigate = useNavigate(); // Hook for navigation

//   const handleSignUp = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     // Validation
//     if (!fullName || !email || !password || !confirmPassword) {
//       setMessage('Please fill in all fields');
//       return;
//     }

//     if (password !== confirmPassword) {
//       setMessage("Passwords don't match");
//       return;
//     }

//     // Check if email already exists
//     const existingUser = accounts.find(acc => acc.email === email);
//     if (existingUser) {
//       setMessage('Email already registered');
//       return;
//     }

//     // Save new account
//     accounts.push({ email, password });
//     alert('Account created successfully!');
//     // Navigate to products page
//     navigate('/product');
//   };

//   const toggleDropdown = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <>
//       {/* Top-right Dropdown Menu (aligned near form) */}
//       <div className="flex justify-end p-4">
//         <div className="relative">
//           <button
//             onClick={toggleDropdown}
//             className="inline-flex w-[5em] rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-700 focus:outline-none"
//           >
//             Menu
           
//           </button>

//           {/* Dropdown Items */}
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
//                   to="/signin"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Products
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

//       {/* SignUp Form */}
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//           <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//             Create an Account
//           </h2>
//           {message && <p className="text-red-500 mb-4">{message}</p>}
//           <form onSubmit={handleSignUp} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Full Name</label>
//               <input
//                 type="text"
//                 className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 placeholder="Your full name"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Email</label>
//               <input
//                 type="email"
//                 className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@example.com"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Password</label>
//               <input
//                 type="password"
//                 className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
//               <input
//                 type="password"
//                 className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="Confirm Password"
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
//             >
//               Sign Up
//             </button>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SignUp;
