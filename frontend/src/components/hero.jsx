"use client";
import { useState } from "react";

export default function Hero() {
  const [showSignup, setShowSignup] = useState(false);
  const cards = [1, 2, 3, 4, 5, 6]; // 7 ke liye [1, 2, 3, 4, 5, 6, 7]
  return (
    // <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
    //   {/* LOGIN CARD */}
    //   <form className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-4">
    //     <h1 className="text-2xl font-bold text-stone-900">Login now!</h1>

    //     <input
    //       type="email"
    //       placeholder="Email"
    //       className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
    //     />
    //     <input
    //       type="password"
    //       placeholder="Password"
    //       className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
    //     />

    //     <button
    //       type="submit"
    //       className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
    //     >
    //       Login
    //     </button>

    //     <p className="text-sm text-center text-stone-600">
    //       New user?{" "}
    //       <button
    //         type="button"
    //         onClick={() => setShowSignup(true)}
    //         className="text-red-500 font-semibold hover:underline"
    //       >
    //         Sign up
    //       </button>
    //     </p>
    //   </form>

    //   {/* SIGNUP MODAL */}
    //   {showSignup && (
    //     <div
    //       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    //       onClick={() => setShowSignup(false)}
    //     >
    //       <form
    //         onClick={(e) => e.stopPropagation()}
    //         onSubmit={(e) => {
    //           e.preventDefault();
    //           // yahan signup API call karo
    //           setShowSignup(false);
    //         }}
    //         className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-4"
    //       >
    //         <button
    //           type="button"
    //           onClick={() => setShowSignup(false)}
    //           className="absolute top-3 right-4 text-2xl text-stone-400 hover:text-stone-700"
    //         >
    //           ×
    //         </button>

    //         <h2 className="text-2xl font-bold text-stone-900">
    //           Create account
    //         </h2>

    //         <input
    //           type="text"
    //           placeholder="Full name"
    //           className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
    //         />
    //         <input
    //           type="email"
    //           placeholder="Email"
    //           className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
    //         />
    //         <input
    //           type="password"
    //           placeholder="Password"
    //           className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
    //         />

    //         <button
    //           type="submit"
    //           className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
    //         >
    //           Sign up
    //         </button>

    //         <p className="text-sm text-center text-stone-600">
    //           Already have an account?{" "}
    //           <button
    //             type="button"
    //             onClick={() => setShowSignup(false)}
    //             className="text-red-500 font-semibold hover:underline"
    //           >
    //             Login
    //           </button>
    //         </p>
    //       </form>
    //     </div>
    //   )}
    // </main>
    <>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-6 max-w-7xl mx-auto">
        {cards.map((item) => (
          <div
            key={item}
            className="card w-full bg-white text-stone-800 border border-stone-200 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <figure className="h-40 bg-gradient-to-br from-red-500 via-orange-500 to-amber-400" />

            <div className="card-body">
              <h2 className="card-title">Card title!</h2>
              <p className="text-stone-500">
                A card component has a figure, a body part, and inside body
                there are title and actions parts
              </p>
              <div className="card-actions justify-end">
                <button className="btn bg-red-500 hover:bg-red-600 text-white border-none">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
