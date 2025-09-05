// src/app/page.tsx
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header logoSrc="/images/logo.png" />

      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex flex-col md:flex-row justify-center items-center px-8 overflow-hidden">
        {/* Gold dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #facc15 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Left content */}
        <div className="flex-1 relative z-10">
          <h1 className="text-5xl font-bold mb-4 max-w-3xl">
            Welcome to FibuVerse!
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mb-6 text-left">
            Interact with intelligent agents, explore nutrition insights, and
            discover the tools developers and trainers use to shape Fibu.
          </p>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Try Fibu App
            </button>
            <button className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right floating agent count */}
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0 relative z-10">
          <div className="bg-gray-900/70 border border-yellow-500/40 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm w-64">
            <div className="text-5xl font-bold text-yellow-400">128</div>
            <div className="text-gray-300 mt-2">Active Agents</div>
          </div>
        </div>
      </section>

      {/* Agents Showcase Section */}
      <section className="relative w-full py-12 px-8 bg-gray-1000 overflow-hidden">
        {/* Section title */}
        <h2 className="text-3xl font-bold text-white mb-6">Agents</h2>

        {/* Horizontal scrollable vertical cards */}
        <div className="flex overflow-x-auto gap-6 pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[120px] max-w-[160px] h-[200px] bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 flex-shrink-0 shadow-lg hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-gray-600 rounded-full mb-3 flex items-center justify-center text-white font-bold text-lg">
                  A{i + 1}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 truncate">Agent {i + 1}</h3>
                <p className="text-gray-300 text-xs break-words">
                  Handles workouts, nutrition tracking, and intelligent suggestions.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Application Section */}
      <section className="w-full py-20 px-8 bg-gray-900">
        <h2 className="text-3xl font-bold mb-6">The Fibu App</h2>
        <p className="text-gray-300 mb-12 max-w-4xl">
          Track nutrition, weights, runs, and interact with AI agents to
          optimize fitness and wellness.
        </p>
        <div className="w-full h-80 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
          App Screenshots Here
        </div>
      </section>

      {/* Trainer Portal Highlights */}
      <section className="w-full py-20 px-8">
        <h2 className="text-3xl font-bold mb-6">Trainer Portal</h2>
        <p className="text-gray-300 mb-12 max-w-4xl">
          Manage AI agents, monitor clients, and customize recommendations with ease.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">Agent Management</div>
          <div className="bg-gray-800 p-6 rounded-lg">Client Analytics</div>
          <div className="bg-gray-800 p-6 rounded-lg">Custom Recommendations</div>
        </div>
      </section>

      {/* Developer Access Highlights */}
      <section className="w-full py-20 px-8 bg-gray-900">
        <h2 className="text-3xl font-bold mb-6">Developer Access</h2>
        <p className="text-gray-300 mb-12 max-w-4xl">
          Integrate Fibu AI agents into your own apps, experiment with APIs, and explore the sandbox environment.
        </p>
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            View API Docs
          </button>
          <button className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition">
            Try Sandbox
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-black border-t border-gray-800 text-gray-400 flex flex-col md:flex-row justify-between items-center">
        <div>© 2025 FibuVerse</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#">Docs</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}


// Header

// Hero Section

// Agent Showcase / Node Network

// Application

// Trainer Portal Highlights

// Developer Access Highlights

// Footer