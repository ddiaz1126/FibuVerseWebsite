"use client";

import Header from "@/components/Header";


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <Header logoSrc="/images/logo.png" />

      {/* Hero / Banner */}
      <section className="relative w-full h-[400px] flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-purple-900 text-center px-6 md:px-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">About FibuVerse</h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
          FibuVerse is a platform designed to empower developers, trainers, and
          fitness enthusiasts by combining intelligent agents with actionable insights.
        </p>
      </section>

      {/* About Content */}
      <section className="w-full max-w-6xl mx-auto py-12 px-6 md:px-12 space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-yellow-400">Our Mission</h2>
          <p className="text-gray-300">
            Our mission is to make AI-powered fitness and nutrition tools accessible to everyone. 
            We bridge the gap between technology and health by providing intuitive, interactive solutions.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-yellow-400">Our Team</h2>
          <p className="text-gray-300">
            FibuVerse is built by a passionate team of developers, data scientists, and fitness experts
            dedicated to creating innovative AI experiences.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-yellow-400">Why FibuVerse?</h2>
          <p className="text-gray-300">
            We combine the latest in AI technology with real-world fitness and nutrition insights, 
            enabling users to interact with intelligent agents, track progress, and make informed decisions.
          </p>
        </div>
      </section>

      {/* Optional Footer / Call to Action */}
      <section className="w-full py-12 bg-gray-900 text-center px-6">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">Get Started Today</h2>
        <p className="text-gray-300 mb-6">Join FibuVerse and explore the future of AI-powered fitness and nutrition.</p>
        <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400 transition">
          Try Fibu App
        </button>
      </section>
    </div>
  );
}