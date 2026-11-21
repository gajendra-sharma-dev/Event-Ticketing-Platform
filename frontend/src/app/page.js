import { Suspense } from "react";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <Suspense
      fallback={<p className="p-10 text-center text-neutral-500">Loading...</p>}
    >
      <Hero />
    </Suspense>
  );
}
