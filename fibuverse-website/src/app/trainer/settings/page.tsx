"use client";

import { useState } from "react";
import AccountSection from "@/components/settings/Account"

const sections = [
  "Account",
  "Notifications",
  "Security",
  "Billing",
  "Integrations",
];

export default function SettingsPage() {
  const [selectedSection, setSelectedSection] = useState(sections[0]);

  const renderSection = () => {
    switch (selectedSection) {
      case "Account":
        return <AccountSection />;
      default:
        return (
          <div className="space-y-3">
            <p className="text-gray-300 text-xs">
              This is a placeholder area for the <strong>{selectedSection}</strong> section.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex h-full text-sm gap-3 p-3 w-full">
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

        <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 overflow-auto shadow-lg">
          <h1 className="text-lg font-bold mb-4 text-white">
            {selectedSection} Settings
          </h1>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}