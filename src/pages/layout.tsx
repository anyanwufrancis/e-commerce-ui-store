export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='w-full  text-black'>
      <a href="Products ">
        <button className="border-2 rounded-[15px] bg-[black] py-4 text-[white]">Products </button>
      </a>
      <a href="Sign in ">
        <button className="border-2 rounded-[15px] bg-[black] py-4 text-[white]">Sign in </button>
      </a>
      {children}
      
    </main>
  );
}
