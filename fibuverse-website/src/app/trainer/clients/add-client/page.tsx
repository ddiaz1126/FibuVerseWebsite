// add-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/api/trainer";

export default function AddClientPage() {
  const router = useRouter();

  // -------------------- Form State --------------------
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    city: "",
    home_state: "",
    country: "",
    height: "",
    body_weight: "",
  });

  const [error, setError] = useState("");

  // -------------------- Handle Input Changes --------------------
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

    // -------------------- Submit --------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- validate required fields ---
        const { first_name, last_name, email } = formData;
        if (!first_name || !last_name || !email) {
            setError("First name, last name, and email are required.");
            return;
        }

        setError("");

      try {
        await createClient(formData);

        alert(`Client ${formData.first_name} added successfully!`);
        router.push("/trainer/clients");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error(err);
        } else {
          setError("Error submitting client.");
          console.error(err);
        }
      }
    };

  return (
<div className="max-w-2xl mx-auto mt-6 p-6 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl shadow-lg border border-gray-700">
  <h1 className="text-xl mb-5 font-bold text-center">Add New Client</h1>

  {error && (
    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
      {error}
    </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-4">
    {/* Personal Information Section */}
    <div>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-300 border-b border-gray-700 pb-2">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Personal Information
      </h2>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="John"
            required
          />
        </div>

        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="john.doe@example.com"
            required
          />
        </div>

        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">Phone Number</label>
          <input
            type="text"
            value={formData.phone_number}
            onChange={(e) => handleChange("phone_number", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">Date of Birth</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleChange("date_of_birth", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>
    </div>

    {/* Location Section */}
    <div>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-300 border-b border-gray-700 pb-2">
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Location
      </h2>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="San Francisco"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">State/Province</label>
          <input
            type="text"
            value={formData.home_state}
            onChange={(e) => handleChange("home_state", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="California"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="block mb-1.5 text-gray-300 text-xs font-medium">Country</label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) => handleChange("country", e.target.value)}
          className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          placeholder="United States"
        />
      </div>
    </div>

    {/* Physical Information Section */}
    <div>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-300 border-b border-gray-700 pb-2">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
        Physical Information
      </h2>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">Height (cm)</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleChange("height", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="175"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-gray-300 text-xs font-medium">Body Weight (kg)</label>
          <input
            type="number"
            value={formData.body_weight}
            onChange={(e) => handleChange("body_weight", e.target.value)}
            className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="70"
          />
        </div>
      </div>
    </div>

    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm transition-all"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Add Client
      </button>
    </div>
    
  </form>
</div>
  );
}
