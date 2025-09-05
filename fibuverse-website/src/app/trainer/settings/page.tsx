"use client";

import { useState } from "react";

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

  return (
    <div className="flex h-full">
      {/* Left inner sidebar */}
      <div className="w-1/4 border-r border-gray-700 bg-gray-800 p-4 flex flex-col gap-2">
        {sections.map((section) => (
          <button
            key={section}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition ${
              selectedSection === section ? "bg-gray-700 font-semibold" : ""
            }`}
            onClick={() => setSelectedSection(section)}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Right main content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{selectedSection} Settings</h1>

        {/* Placeholder content for the selected section */}
        <div className="space-y-4">
          <p>
            This is a placeholder area for the <strong>{selectedSection}</strong> section.
          </p>

          <div className="space-y-2">
            <label className="block text-gray-300">Field 1</label>
            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none" placeholder="Placeholder value" />

            <label className="block text-gray-300">Field 2</label>
            <input className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none" placeholder="Placeholder value" />
          </div>

          <button className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
