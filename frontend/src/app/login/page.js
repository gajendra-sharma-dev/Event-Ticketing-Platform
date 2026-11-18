"use client";
import { useState } from "react";

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      {/* LOGIN CARD */}
      <form className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Login now!</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
        >
          Login
        </button>

        <p className="text-sm text-center text-stone-600">
          New user?{" "}
          <button
            type="button"
            onClick={() => setShowSignup(true)}
            className="text-red-500 font-semibold hover:underline"
          >
            Sign up
          </button>
        </p>
      </form>

      {/* SIGNUP MODAL */}
      {showSignup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowSignup(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              // yahan signup API call karo
              setShowSignup(false);
            }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-4"
          >
            <button
              type="button"
              onClick={() => setShowSignup(false)}
              className="absolute top-3 right-4 text-2xl text-stone-400 hover:text-stone-700"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-stone-900">
              Create account
            </h2>

            <input
              type="text"
              placeholder="Full name"
              className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
            >
              Sign up
            </button>

            <p className="text-sm text-center text-stone-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setShowSignup(false)}
                className="text-red-500 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      )}
    </main>
  );
}
