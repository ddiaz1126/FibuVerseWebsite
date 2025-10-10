"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { logoutTrainer, getTrainerProfile, updateTrainerProfile } from "@/api/trainer"; // ✅ import your centralized API call
import { TrainerProfile } from "@/api/trainerTypes";


export default function AccountSection() {
  // const router = useRouter();
  const [profileData, setProfileData] = useState<TrainerProfile | null>(null);
  const [originalData, setOriginalData] = useState<TrainerProfile | null>(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        const data = await getTrainerProfile();
        setProfileData(data);
        setOriginalData(data); // ✅ Store original data
        setImagePreview(data.profile_picture || "/default-avatar.png");
      } catch (error) {
        console.error("Failed to fetch trainer profile:", error);
      }
    };

    fetchTrainerData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // ✅ Store the file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!profileData) {
        throw new Error("Profile data is missing");
      }

      const formData = new FormData();
      
      // Add the image if one was selected
      if (selectedFile) {
        formData.append('profile_picture', selectedFile);
      }
      
      // Define which fields are allowed to be updated (removed favorite_workouts)
      const editableFields = [
        'name',
        'city',
        'state',
        'specialization',
        'bio',
        'experience_years',
        'hourly_rate',
        'instagram_url',
        'youtube_url',
        'podcast_url',
        'website_url',
      ];
      
      // Only send editable fields
      editableFields.forEach((key) => {
        const value = profileData[key as keyof TrainerProfile];
        
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Handle certifications specially
      if (profileData.certifications) {
        formData.append('certifications', profileData.certifications);
      }

      const updatedUser = await updateTrainerProfile(formData);
      
      setProfileData(updatedUser);
      setOriginalData(updatedUser);
      setSelectedFile(null);
      setIsEditing(false);
      alert("Profile updated successfully!");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error instanceof Error ? error.message : "An error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    if (originalData) {
      setProfileData(originalData); // ✅ Revert to original
      setImagePreview(originalData.profile_picture || "/default-avatar.png");
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const accessToken = localStorage.getItem("access_token") ?? undefined;

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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("trainer_user");
       window.location.href = "/trainerlogin";
      // router.push("/trainerlogin");
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div>
        <h2 className="text-md font-semibold mb-3 text-white">Profile Information</h2>
        <div className="flex items-start gap-6">
          {/* Left side - Form fields */}
          <div className="flex-1 space-y-3">
            {/* Basic Info */}
            <div>
              <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData?.name || ""}
                  onChange={(e) =>
                    setProfileData(profileData ? { ...profileData, name: e.target.value } : null)
                  }
                  className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-white text-xs font-semibold">
                  {profileData?.name || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                Email
              </label>
              <p className="text-gray-400 text-xs">{profileData?.email}</p>
              <p className="text-gray-500 text-[9px] mt-0.5">
                Email cannot be changed
              </p>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData?.city}
                    onChange={(e) =>
                        setProfileData({ ...profileData, city: e.target.value } as TrainerProfile)
                    }
                    className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                    placeholder="City"
                  />
                ) : (
                  <p className="text-white text-xs">
                    {profileData?.city || "Not set"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData?.state}
                    onChange={(e) =>
                        setProfileData({ ...profileData, state: e.target.value } as TrainerProfile)
                    }
                    className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                    placeholder="State"
                  />
                ) : (
                  <p className="text-white text-xs">
                    {profileData?.state || "Not set"}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Info */}
            <div>
              <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                Specialization
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData?.specialization}
                  onChange={(e) =>
                    setProfileData({ ...profileData, specialization: e.target.value } as TrainerProfile)
                  }
                  className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                  placeholder="e.g., Strength Training, Yoga, etc."
                />
              ) : (
                <p className="text-white text-xs">
                  {profileData?.specialization || "Not set"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                  Experience (Years)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profileData?.experience_years || 0}
                    onChange={(e) =>
                      setProfileData({ 
                        ...profileData, 
                        experience_years: parseInt(e.target.value) || 0 
                      } as TrainerProfile)
                    }
                    className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                    placeholder="0"
                  />
                ) : (
                  <p className="text-white text-xs">
                    {profileData?.experience_years || 0} years
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                  Hourly Rate ($)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={profileData?.hourly_rate}
                    onChange={(e) =>
                        setProfileData({ ...profileData, hourly_rate: e.target.value } as TrainerProfile)
                    }
                    className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                    placeholder="0.00"
                  />
                ) : (
                  <p className="text-white text-xs">
                    ${profileData?.hourly_rate || "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={profileData?.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value } as TrainerProfile)
                  }
                  className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs resize-none"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-white text-xs">
                  {profileData?.bio || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-[10px] font-medium">
                Certifications
              </label>
              {isEditing ? (
                <textarea
                  value={profileData?.certifications}
                  onChange={(e) =>
                      setProfileData({ ...profileData, certifications: e.target.value } as TrainerProfile)
                  }
                  className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs resize-none"
                  rows={2}
                  placeholder="List your certifications..."
                />
              ) : (
                <p className="text-white text-xs">
                  {profileData?.certifications || "Not set"}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Profile Image */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-700 shadow-xl">
              <Image
                src={imagePreview || "/default-avatar.png"}
                alt="Profile"
                fill
                className="object-cover"
                onError={() => setImagePreview("/default-avatar.png")}
              />
            </div>
            
            {isEditing && (
              <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-lg transition-all text-[10px] font-medium">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                Change Photo
              </label>
            )}
          </div>
        </div>

      {/* Social Links Section */}
      <div className="border-t border-gray-700 pt-4 mt-6">
        <h2 className="text-md font-semibold mb-3 text-white">Social Links</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-300 mb-1 text-[10px] font-medium">
              Instagram
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profileData?.instagram_url}
                onChange={(e) =>
                  setProfileData({ ...profileData, instagram_url: e.target.value } as TrainerProfile)
                }
                className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                placeholder="https://instagram.com/..."
              />
            ) : (
              <p className="text-white text-xs truncate">
                {profileData?.instagram_url || "Not set"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-[10px] font-medium">
              YouTube
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profileData?.youtube_url}
                onChange={(e) =>
                  setProfileData({ ...profileData, youtube_url: e.target.value } as TrainerProfile)
                }
                className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                placeholder="https://youtube.com/..."
              />
            ) : (
              <p className="text-white text-xs truncate">
                {profileData?.youtube_url || "Not set"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-[10px] font-medium">
              Podcast
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profileData?.podcast_url}
                onChange={(e) =>
                  setProfileData({ ...profileData, podcast_url: e.target.value } as TrainerProfile)
                }
                className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                placeholder="https://..."
              />
            ) : (
              <p className="text-white text-xs truncate">
                {profileData?.podcast_url || "Not set"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-[10px] font-medium">
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profileData?.website_url}
                onChange={(e) =>
                  setProfileData({ ...profileData, website_url: e.target.value } as TrainerProfile)
                }
                className="w-full p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500/50 transition-colors text-white text-xs"
                placeholder="https://..."
              />
            ) : (
              <p className="text-white text-xs truncate">
                {profileData?.website_url || "Not set"}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Profile Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-700 mt-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-blue-500/20 transform hover:scale-[1.02] font-medium text-[10px]"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-green-500/20 transform hover:scale-[1.02] font-medium text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-all font-medium text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Appearance / Dark Mode Section */}
    {/* <div className="border-t border-gray-700 pt-4 mt-4">
      <h2 className="text-md font-semibold mb-2 text-gray-200">Appearance</h2>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-[10px]">Dark Mode</span>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          className="w-5 h-5 rounded bg-gray-700 border-gray-600 accent-blue-500"
        />
      </div>
    </div> */}


      {/* Danger Zone */}
      <div className="border-t border-gray-700 pt-4">
        <h2 className="text-md font-semibold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-gray-400 text-[10px] mb-3">
          Once you log out, you&apos;ll need to sign in again to access your account.
        </p>
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-red-500/20 transform hover:scale-[1.02] font-medium text-[10px]"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}