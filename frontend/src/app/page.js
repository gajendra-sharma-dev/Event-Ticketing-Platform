import Image from "next/image";
import Navbar from "@/components/Navbar";
import React from "react";
import Footer from "@/components/footer";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
}
