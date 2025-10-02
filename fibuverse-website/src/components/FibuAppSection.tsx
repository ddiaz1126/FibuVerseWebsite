import React from 'react';
import { MessageCircle, Laptop, Brain, Target, TrendingUp, Users } from 'lucide-react';
import Image from "next/image";

const screenshot = "/images/fibu_home.png";

export default function FibuAppSection() {

  const features = [
    {
    icon: <Target className="w-6 h-6" />,
    title: "All-in-One Fitness Tracking",
    description: "Keep all your fitness data in one place — log meals, workouts, and runs."
    },
    {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Insightful Tracking",
    description: "Receive real-time insights to monitor progress and optimize results effortlessly"
    },
    {
    icon: <Users className="w-6 h-6" />,
    title: "Trainer Marketplace",
    description: "Browse and connect with trainers who fit your goals and style"
    },
    {
    icon: <Laptop className="w-6 h-6" />,
    title: "Trainer Portal",
    description: "Manage clients, send personalized workouts and plans, communicate directly, and receive real-time updates on progress"
    },
    {
    icon: <Brain className="w-6 h-6" />,
    title: "AI Agents",
    description: "Smart support working in the background to guide your fitness journey"
    },
    {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Fibu (AI)",
    description: "Ask questions, get instant advice, and receive personalized guidance anytime"
    }
  ];

  return (
    <section className="relative w-full py-12 px-8 bg-black overflow-hidden">

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Main Content - Left Features, Right Image */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Features List - Left Side */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">
            The <span className="text-yellow-400 font-extrabold">Fibu</span> App
            </h2>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Fibu is your complete fitness companion — track nutrition, weights, runs, and interact with AI agents to optimize wellness. Currently in beta on iOS via TestFlight, it also connects clients with trainers, allowing trainers to create workouts and plans, track progress, and message clients directly, all in one seamless app.
            </p>

            </div>
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-4 rounded-xl bg-gray-900/50 border border-gray-700/30 hover:border-yellow-400/60 transition-all duration-300 hover:bg-gray-800/60 hover:shadow-xl hover:shadow-yellow-400/20"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-gray-700/50 group-hover:bg-yellow-500/20 transition-colors duration-300">
                    <div className="text-gray-300 group-hover:text-yellow-400 transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {/* CTA Section */}
            <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/50">
                Contact for Beta Access
                </button>
            </div>
            </div>
          </div>

          {/* App Screenshot - Right Side */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Glowing border effect */}
              <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, #facc15 50%, transparent 70%)',
                    animation: 'diagonal-glow 3s linear infinite',
                  }}
                />
              </div>

              {/* Screenshot container */}
                <div className="relative overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 group-hover:scale-105 w-full max-w-xs">
                  <Image
                    src={screenshot}           // your image source
                    alt="Fibu App screenshot"
                    width={1200}               // specify width
                    height={800}               // specify height
                    className="w-full h-auto"  // Tailwind classes still apply
                    priority={true}            // optional: preload for LCP images
                  />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>


              {/* Floating elements around image */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-yellow-400/20 rounded-full border border-yellow-400/40 animate-pulse" />
              <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-purple-400/20 rounded-full border border-purple-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Simple keyframes */}
      <style jsx>{`
        @keyframes diagonal-glow {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
      `}</style>
    </section>
  );
}