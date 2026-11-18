"use client";
import { useState } from "react";

export default function Hero() {
  const [showSignup, setShowSignup] = useState(false);
  const cards = [1, 2, 3, 4, 5, 6];
  return (
    <>
      <span className="text-rotate text-5xl md:text-7xl font-bold duration-6000 mt-8">
        <span className="justify-items-center">
          <span>MOVIES</span>
          <span>CONCERTS</span>
          <span className="font-bold italic px-2 text-red-500">COMEDY ▶︎▶︎</span>
          <span>SPORTS</span>
          <span className="font-bold italic px-2 text-red-500">
            LIVE SHOWS ▶︎▶︎
          </span>
        </span>
      </span>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-6 max-w-7xl mx-auto my-4">
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
