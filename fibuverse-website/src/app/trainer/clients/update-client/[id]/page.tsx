"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateClient, getClientProfile } from "@/api/trainer";
import { CreateClientPayload } from "@/api/trainerTypes"
import Image from "next/image";

export default function UpdateClientPage() {
  const router = useRouter();
    const params = useParams();
    const clientId = Number(params.id);  

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
    fitness_goal: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // -------------------- Load Client Data --------------------
  useEffect(() => {
    const loadClient = async () => {
      try {
        const client = await getClientProfile(clientId);
        setFormData({
          first_name: client.first_name || "",
          last_name: client.last_name || "",
          email: client.email || "",
          phone_number: client.phone_number || "",
          gender: client.gender || "",
          date_of_birth: client.date_of_birth || "",
          city: client.city || "",
          home_state: client.home_state || "",
          country: client.country || "",
          height: client.height?.toString() || "",
          body_weight: client.body_weight?.toString() || "",
          fitness_goal: client.fitness_goal || "",
        });
        setCurrentImageUrl(client.profile_image || null);
        setLoading(false);
      } catch (err) {
        console.error("Error loading client:", err);
        setError("Failed to load client data");
        setLoading(false);
      }
    };

    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  // -------------------- Handle Input Changes --------------------
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // New handler for image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      // Preview the new image
      setCurrentImageUrl(URL.createObjectURL(file));
    }
  };

  // -------------------- Submit --------------------
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    try {
        // Build payload with proper typing
        const payload: Partial<CreateClientPayload> = { ...formData };
        
        // Only include image if a new one was selected
        if (profileImage) {
        payload.profile_image = profileImage;
        }

        await updateClient(clientId, payload);

        alert(`Client ${formData.first_name} updated successfully!`);
        router.push("/trainer/clients");
    } catch (err: unknown) {
        if (err instanceof Error) {
        setError(err.message);
        console.error(err);
        } else {
        setError("Error updating client.");
        console.error(err);
        }
    }
    };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-6 p-6 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl shadow-lg border border-gray-700">
        <p className="text-center">Loading client data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl shadow-lg border border-gray-700">
      <h1 className="text-xl mb-5 font-bold text-center">Update Client</h1>

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
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-gray-300 text-xs font-medium">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block mb-1.5 text-gray-300 text-xs font-medium">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="john.doe@example.com"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
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

          {/* Profile Image */}
          <div className="mt-3">
            <label className="block mb-1.5 text-gray-300 text-xs font-medium">Profile Image</label>
            {currentImageUrl && (
              <div className="mb-2 flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <Image
                    src={currentImageUrl}
                    alt="Current profile"
                    fill
                    sizes="64px"
                    className="rounded-full object-cover border-2 border-gray-600"
                  />
                </div>
                <span className="text-xs text-gray-400">Current image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
            />
            {profileImage && (
              <p className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                New image selected: {profileImage.name}
              </p>
            )}
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

        {/* Fitness Goal Section */}
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-300 border-b border-gray-700 pb-2">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Fitness Goal
          </h2>

          <div>
            <label className="block mb-1.5 text-gray-300 text-xs font-medium">Goal</label>
            <input
              type="text"
              value={formData.fitness_goal}
              onChange={(e) => handleChange("fitness_goal", e.target.value)}
              className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g., Weight loss, Muscle gain, General fitness"
            />
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
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Update Client
          </button>
        </div>
      </form>
    </div>
  );
}