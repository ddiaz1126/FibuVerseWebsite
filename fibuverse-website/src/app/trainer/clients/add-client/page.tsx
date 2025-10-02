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
    <div className="max-w-xl mx-auto mt-10 p-6 bg-gray-800 text-white rounded shadow">
      <h1 className="text-2xl mb-6 font-bold">Add New Client</h1>

      {error && <div className="mb-4 text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Required Fields */}
        <div>
          <label className="block mb-1">First Name *</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Last Name *</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        {/* Optional Fields */}
        <div>
          <label className="block mb-1">Phone Number</label>
          <input
            type="text"
            value={formData.phone_number}
            onChange={(e) => handleChange("phone_number", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Date of Birth</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleChange("date_of_birth", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1">State</label>
          <input
            type="text"
            value={formData.home_state}
            onChange={(e) => handleChange("home_state", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1">Height (cm)</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleChange("height", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1">Body Weight (kg)</label>
          <input
            type="number"
            value={formData.body_weight}
            onChange={(e) => handleChange("body_weight", e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded mt-4 font-bold"
        >
          Add Client
        </button>
      </form>
    </div>
  );
}
