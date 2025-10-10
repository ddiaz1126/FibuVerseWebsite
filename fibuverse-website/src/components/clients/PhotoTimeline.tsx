import { useState, useEffect, useCallback } from "react";
import { Camera, X, Plus, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { sendProgressPhoto, fetchProgressPhotos } from "@/api/trainer"; // Update with correct path
import Image from "next/image";

interface ProgressPhoto {
  id: number;
  image_url: string | null;
  date_taken: string;
  weight?: number | null;
  body_fat_percentage?: number | null;
  notes?: string | null;
  body_part?: string | null;
  is_private: boolean;
  created_at: string;
}

interface PhotoTimelinePageProps {
  clientId: number;
}

export default function PhotoTimelinePage({ clientId }: PhotoTimelinePageProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state
  const [uploadData, setUploadData] = useState({
    image: null as File | null,
    date_taken: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat_percentage: '',
    notes: '',
    body_part: '',
    is_private: false
  });

  // Fetch photos on mount
    const loadPhotos = useCallback(async () => {
    try {
        setIsLoading(true);
        const response = await fetchProgressPhotos(clientId);
        setPhotos(response.photos);
    } catch (error) {
        console.error("Failed to load progress photos:", error);
    } finally {
        setIsLoading(false);
    }
    }, [clientId]);

    // Fetch photos on mount
    useEffect(() => {
    loadPhotos();
    }, [loadPhotos]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setUploadData({ ...uploadData, image: e.target.files[0] });
    }
    };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.image) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', uploadData.image);
      formData.append('date_taken', uploadData.date_taken);
      if (uploadData.weight) formData.append('weight', uploadData.weight);
      if (uploadData.body_fat_percentage) formData.append('body_fat_percentage', uploadData.body_fat_percentage);
      if (uploadData.notes) formData.append('notes', uploadData.notes);
      if (uploadData.body_part) formData.append('body_part', uploadData.body_part);
      formData.append('is_private', 'false');

      await sendProgressPhoto(clientId, formData);
      
      // Reset form and reload photos
      setUploadData({
        image: null,
        date_taken: new Date().toISOString().split('T')[0],
        weight: '',
        body_fat_percentage: '',
        notes: '',
        body_part: '',
        is_private: false,
      });
      setShowUploadForm(false);
      await loadPhotos(); // ✅ Now accessible
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const calculateTotalWeightLoss = () => {
    const photosWithWeight = photos.filter(p => p.weight);
    if (photosWithWeight.length < 2) return 0;
    
    // Sort oldest to newest
    const sorted = [...photosWithWeight].sort((a, b) => 
      new Date(a.date_taken).getTime() - new Date(b.date_taken).getTime()
    );
    
    // Oldest weight - Newest weight (positive = weight loss)
    return (sorted[0].weight! - sorted[sorted.length - 1].weight!).toFixed(1);
  };
  const getWeightChange = (currentIndex: number) => {
    if (currentIndex >= photos.length - 1) return null;
    
    const currentPhoto = photos[currentIndex]; // Newer
    const previousPhoto = photos[currentIndex + 1]; // Older
    
    if (currentPhoto.weight != null && previousPhoto.weight != null) {
      return currentPhoto.weight - previousPhoto.weight;
    }
    
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section with matching style */}
      <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-white">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Progress Photos
            <span className="text-xs text-gray-400 font-normal">
              ({photos.length} photos{photos.length > 1 && ` · ${calculateTotalWeightLoss()}kg lost`})
            </span>
          </h2>
          
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <button 
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Photo
              </button>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="mt-4 space-y-4">
            {/* Upload Form */}
            {showUploadForm && (
              <form onSubmit={handleUpload} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Photo — JPG format is preferred; PNG files are also accepted. Other file types are not supported.
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
                      onChange={handleFileSelect}
                      required
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Date Taken *
                    </label>
                    <input
                      type="date"
                      value={uploadData.date_taken}
                      onChange={(e) => setUploadData({ ...uploadData, date_taken: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={uploadData.weight}
                      onChange={(e) => setUploadData({ ...uploadData, weight: e.target.value })}
                      placeholder="85.5"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Body Fat %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={uploadData.body_fat_percentage}
                      onChange={(e) => setUploadData({ ...uploadData, body_fat_percentage: e.target.value })}
                      placeholder="20.5"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Body Part
                    </label>
                    <select
                      value={uploadData.body_part}
                      onChange={(e) => setUploadData({ ...uploadData, body_part: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select...</option>
                      <option value="front">Front</option>
                      <option value="back">Back</option>
                      <option value="side">Side</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={uploadData.notes}
                      onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                      placeholder="Add notes about this photo..."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  {/* <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadData.is_private}
                        onChange={(e) => setUploadData({ ...uploadData, is_private: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                      />
                      Private (only visible to trainers)
                    </label>
                  </div> */}
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isUploading || !uploadData.image}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Photo Grid */}
            <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-400">Loading photos...</div>
                </div>
              ) : photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Camera className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-gray-400">No progress photos yet</p>
                  <p className="text-gray-500 text-sm mt-1">Click &quot;Add Photo&quot; to upload your first photo</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {photos.map((photo, index) => (
                      <div 
                        key={photo.id} 
                        className="relative animate-fadeInScale"
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'backwards'
                        }}
                      >
                        {/* Timeline connector */}
                        {index < photos.length - 1 && (
                          <div className="hidden md:block absolute left-full top-8 w-3 h-1.5 bg-gradient-to-r from-purple-500 to-transparent z-0">
                            <div className="absolute -right-1 -top-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        
                        {/* Photo card */}
                        <div
                          onClick={() => setSelectedPhoto(photo)}
                          className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800/50 cursor-pointer border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-110 hover:z-20 hover:shadow-2xl hover:shadow-purple-500/30"
                        >
                        {photo.image_url ? (
                        <Image 
                            src={photo.image_url} 
                            alt={`Progress photo from ${photo.date_taken}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <Camera className="w-6 h-6 text-gray-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-125" />
                        </div>
                        )}
                          
                          {/* Info overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 transition-all duration-300 group-hover:from-black group-hover:via-black/70">
                            <p className="text-white text-xs font-semibold truncate transition-all duration-300 group-hover:text-purple-400">
                                {new Date(photo.date_taken).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            {photo.weight && (
                                <p className="text-purple-400 text-xs transition-all duration-300 group-hover:text-white">{photo.weight}kg</p>
                            )}
                            </div>
                            {/* Weight change badge */}
                            {index < photos.length - 1 && photo.weight != null && photos[index + 1].weight != null && (() => {
                              const diff = photos[index + 1].weight! - photo.weight!; // older - newer
                              const isLoss = diff > 0;
                              const sign = isLoss ? "−" : "+";
                              const absDiff = Math.abs(diff).toFixed(1);

                              return (
                                <div
                                  className={`absolute top-2 right-2 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:rotate-3
                                  ${isLoss ? "bg-blue-500" : "bg-green-500"}`}
                                >
                                  {sign}{absDiff}
                                </div>
                              );
                            })()}

                          {/* Private badge */}
                          {/* {photo.is_private && (
                            <div className="absolute top-2 left-2 bg-gray-900/80 text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-semibold border border-gray-700">
                              Private
                            </div>
                          )} */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl max-w-md w-full overflow-hidden border border-gray-700 shadow-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative aspect-[3/4] bg-gray-900/50">
                {selectedPhoto.image_url ? (
                <Image 
                    src={selectedPhoto.image_url} 
                    alt={`Progress photo from ${selectedPhoto.date_taken}`}
                    fill
                    sizes="(max-width: 448px) 100vw, 448px"
                    className="object-cover"
                />
                ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-600" />
                </div>
                )}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-all hover:rotate-90 duration-300 border border-gray-700"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Info */}
            <div className="p-4 space-y-2 bg-gray-900/50 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">
                  {new Date(selectedPhoto.date_taken).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
                {selectedPhoto.weight && (
                  <span className="text-purple-400 font-semibold text-sm">{selectedPhoto.weight} kg</span>
                )}
              </div>
              {selectedPhoto.body_fat_percentage && (
                <p className="text-gray-400 text-sm">Body Fat: {selectedPhoto.body_fat_percentage}%</p>
              )}
              {selectedPhoto.body_part && (
                <p className="text-gray-400 text-sm capitalize">View: {selectedPhoto.body_part}</p>
              )}
              {selectedPhoto.notes && (
                <p className="text-gray-400 text-sm">{selectedPhoto.notes}</p>
              )}
              {/* {selectedPhoto.is_private && (
                <p className="text-xs text-gray-500 italic">Private - Only visible to trainers</p>
              )} */}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8) rotate(-5deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9) rotate(-2deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}