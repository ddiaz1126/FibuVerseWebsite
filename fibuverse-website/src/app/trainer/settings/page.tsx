"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutTrainer } from "@/api/trainer"; // ✅ import your centralized API call

const sections = [
  "Profile",
  "Account",
  "Notifications",
  "Security",
  "Billing",
  "Integrations",
];

export default function SettingsPage() {
  const [selectedSection, setSelectedSection] = useState(sections[0]);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const accessToken = localStorage.getItem("access_token") ?? undefined; // convert null → undefined

      if (refreshToken) {
        await logoutTrainer(refreshToken, accessToken);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Logout failed", err);
      } else {
        console.error("Logout failed with unknown error", err);
      }
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("trainer_user");

      router.push("/trainerlogin");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex h-full text-sm gap-3 p-3 w-full">
        {/* Left inner sidebar */}
        <div className="w-1/6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
          {sections.map((section) => (
            <button
              key={section}
              className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-700/50 transition-all border text-xs ${
                selectedSection === section 
                  ? "bg-gray-700 font-semibold border-gray-600 shadow-lg" 
                  : "border-transparent"
              }`}
              onClick={() => setSelectedSection(section)}
            >
              {section}
            </button>
          ))}
        </div>
        
        {/* Right main content */}
        <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 overflow-auto shadow-lg">
          <h1 className="text-lg font-bold mb-3 text-white">{selectedSection} Settings</h1>
          
          {/* Placeholder content for the selected section */}
          <div className="space-y-3">
            <p className="text-gray-300 text-xs">
              This is a placeholder area for the <strong>{selectedSection}</strong> section.
            </p>
            
            <div className="space-y-2">
              <div>
                <label className="block text-gray-300 mb-1 text-[10px] font-medium">Field 1</label>
                <input
                  className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                  placeholder="Placeholder value"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1 text-[10px] font-medium">Field 2</label>
                <input
                  className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                  placeholder="Placeholder value"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-blue-500/20 transform hover:scale-[1.02] font-medium text-[10px]">
                Save Changes
              </button>
              
              {selectedSection === "Account" && (
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-red-500/20 transform hover:scale-[1.02] font-medium text-[10px]"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}