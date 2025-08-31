// src/app/page.tsx
import Header from "@/components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with logo */}
      <Header logoSrc="/images/logo.png" />

      <main className="p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to FibuVerse!</h1>
        <p className="text-lg text-gray-300">
          Your AI agents at your service.
        </p>
      </main>
    </div>
  );
}