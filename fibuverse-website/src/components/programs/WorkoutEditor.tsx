import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, GripVertical, Link2, Search } from 'lucide-react';
import { searchExerciseLibrary } from "@/api/trainer";

export default function WorkoutEditor() {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const muscleGroups = ["Chest", "Upper Back", "Legs", "Shoulders", "Biceps", "Triceps", "Abs", "Quadriceps", "Glutes", "Hamstrings", "Lats"];
  const equipmentOptions = ["Barbell", "Dumbbell", "Machine", "Bodyweight", "Cable", "Smith Machine"];
  const [isSearching, setIsSearching] = useState(false);

  // refs for debounce/abort
  const debounceRef = useRef<number | null>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      console.log('File uploaded:', file.name);
      // TODO: Send file to backend for processing
    }
  };

  const handleAudioRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      console.log('Starting audio recording...');
      // TODO: Implement audio recording logic
      // navigator.mediaDevices.getUserMedia({ audio: true })
    } else {
      console.log('Stopping audio recording...');
      // TODO: Stop recording and send to backend
    }
  };

  const generateWorkoutFromAI = () => {
    console.log('Generating workout from AI...');
    // TODO: Send uploadedFile or audio to backend API
    // The backend will process and return workout data
  };

  const searchExercises = async (query: string) => {
    // Don't block if query is empty — filters alone can trigger search
    if (!query.trim() && !selectedMuscleGroup && !selectedEquipment) {
        setSearchResults([]);
        return;
    }

    try {
        // Call your backend API with query + optional filters
        const results = await searchExerciseLibrary(
        query,
        selectedMuscleGroup,
        selectedEquipment
        );

        setSearchResults(results);
    } catch (err) {
        console.error("[WorkoutEditor] searchExercises error:", err);
        setSearchResults([]);
    }
    };

  // Core search logic — called by the effect below
  const runSearch = async (query: string, muscle?: string | null, equipment?: string) => {
    try {
      const results = await searchExerciseLibrary(query, muscle, equipment);
      setSearchResults(results);
    } catch (err: unknown) {
      if ((err as any)?.name === "AbortError") {
        // fetch aborted — ignore
        return;
      }
      console.error("[WorkoutEditor] searchExercises error:", err);
      setSearchResults([]);
    }
  };

  // When query or filters change — debounce the query but also handle filter clicks
  useEffect(() => {
    // Cancel previous debounce and pending fetch
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
      abortCtrlRef.current = null;
    }

    const hasSearchOrFilter = searchQuery.trim() !== "" || selectedMuscleGroup || selectedEquipment;
    if (!hasSearchOrFilter) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    abortCtrlRef.current = controller;

    // If you want filter clicks to be instant, use a very small debounce (0-150ms).
    // Keep 200-300ms for user typing. Here I use 200ms.
    debounceRef.current = window.setTimeout(() => {
      runSearch(searchQuery, selectedMuscleGroup, selectedEquipment, controller.signal)
        .finally(() => {
          setIsSearching(false);
        });
    }, 200);

    // cleanup
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (controller) controller.abort();
    };
  }, [searchQuery, selectedMuscleGroup, selectedEquipment]);

  // Toggle handlers for filter buttons (they update state — effect will run)
  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroup(prev => (prev === group ? null : group));
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev => (prev === eq ? null : eq));
  };


  const selectExercise = (selectedExercise) => {
    const newExercise = {
      id: Date.now(),
      exerciseId: selectedExercise.id,
      name: selectedExercise.name,
      category: selectedExercise.category,
      equipment: selectedExercise.equipment,
      sets: 3,
      reps: 10,
      weight: '',
      rir: 2,
      intensityType: 'RIR',
      groupId: null
    };
    
    setExercises([...exercises, newExercise]);
    setShowExerciseSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const addExercise = () => {
    setShowExerciseSearch(true);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchExercises(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const removeExercise = (id) => {
    const exerciseToRemove = exercises.find(ex => ex.id === id);
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    
    // Clean up groups - if removing leaves only 1 exercise in group, ungroup it
    if (exerciseToRemove?.groupId) {
      const remainingInGroup = updatedExercises.filter(ex => ex.groupId === exerciseToRemove.groupId);
      if (remainingInGroup.length === 1) {
        setExercises(updatedExercises.map(ex => 
          ex.groupId === exerciseToRemove.groupId ? { ...ex, groupId: null } : ex
        ));
        return;
      }
    }
    
    setExercises(updatedExercises);
  };

  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const createGroup = (exerciseId, type = 'superset') => {
    const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);
    const exercise = exercises[exerciseIndex];
    
    // If already in a group, add to that group
    const groupId = exercise.groupId || `group-${Date.now()}`;
    
    const newExercise = {
      id: Date.now() + 1,
      name: '',
      sets: 3,
      reps: 10,
      weight: '',
      rir: 2,
      intensityType: 'RIR',
      groupId: groupId
    };

    const updatedExercises = [...exercises];
    if (!exercise.groupId) {
      updatedExercises[exerciseIndex] = { ...updatedExercises[exerciseIndex], groupId };
    }
    updatedExercises.splice(exerciseIndex + 1, 0, newExercise);
    
    setExercises(updatedExercises);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newExercises = [...exercises];
    const draggedItem = newExercises[draggedIndex];
    newExercises.splice(draggedIndex, 1);
    newExercises.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setExercises(newExercises);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    
    // Clean up any groups with only 1 exercise after drag
    const groupCounts = {};
    exercises.forEach(ex => {
      if (ex.groupId) {
        groupCounts[ex.groupId] = (groupCounts[ex.groupId] || 0) + 1;
      }
    });
    
    const cleanedExercises = exercises.map(ex => {
      if (ex.groupId && groupCounts[ex.groupId] === 1) {
        return { ...ex, groupId: null };
      }
      return ex;
    });
    
    setExercises(cleanedExercises);
  };

  const getGroupExercises = (groupId) => {
    return exercises.filter(ex => ex.groupId === groupId);
  };

  const getGroupType = (groupId) => {
    const groupExercises = getGroupExercises(groupId);
    if (groupExercises.length === 2) return 'Superset';
    if (groupExercises.length >= 3) return 'Circuit';
    return '';
  };

  const isFirstInGroup = (exercise) => {
    if (!exercise.groupId) return false;
    const groupExercises = getGroupExercises(exercise.groupId);
    return groupExercises[0]?.id === exercise.id;
  };

  return (
    <div className="flex-1 border-r border-gray-800 overflow-y-auto bg-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Create Workout</h2>
          <p className="text-gray-400 text-sm">Build your perfect workout routine</p>
        </div>

        {/* AI Generation Section */}
        <div className="mb-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30 overflow-hidden">
          <button
            onClick={() => setIsAIGeneratorOpen(!isAIGeneratorOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-purple-900/10 transition-colors"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Workout Generator
            </h3>
            <svg 
              className={`w-5 h-5 transition-transform ${isAIGeneratorOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isAIGeneratorOpen && (
            <div className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* File/Image Upload */}
                <div className="bg-gray-800/50 rounded-lg p-3 border-2 border-dashed border-gray-600 hover:border-purple-500 transition-all cursor-pointer">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center py-3">
                    {uploadedFile ? (
                      <>
                        <svg className="w-10 h-10 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-green-400 mb-1">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-medium text-gray-300 mb-1">Upload Image or File</p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF, TXT up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>

                {/* Audio Recording */}
                <div className="bg-gray-800/50 rounded-lg p-3 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all">
                  <div className="flex flex-col items-center justify-center py-3">
                    <button
                      onClick={handleAudioRecord}
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all shadow-lg ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isRecording ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {isRecording ? 'Recording...' : 'Record Audio'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isRecording ? 'Click to stop' : 'Describe your workout verbally'}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={generateWorkoutFromAI}
                disabled={!uploadedFile && !isRecording}
                className={`w-full mt-3 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  uploadedFile || isRecording
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gray-700 cursor-not-allowed opacity-50'
                }`}
              >
                Generate Workout with AI
              </button>
            </div>
          )}
        </div>

        {/* Exercise Search Modal */}
        {showExerciseSearch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Select Exercise</h3>
                  <button
                    onClick={() => {
                      setShowExerciseSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exercises... (e.g., bench press, squat)"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                {/* Filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                {/* Muscle Groups */}
                {muscleGroups.map((group) => (
                    <button
                    key={group}
                    onClick={() => setSelectedMuscleGroup(selectedMuscleGroup === group ? null : group)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors
                        ${selectedMuscleGroup === group 
                        ? "bg-blue-600 text-white border-blue-600" 
                        : "bg-gray-800 text-gray-300 border-gray-700 hover:border-blue-500"}
                    `}
                    >
                    {group}
                    </button>
                ))}

                {/* Equipment */}
                {equipmentOptions.map((eq) => (
                    <button
                    key={eq}
                    onClick={() => setSelectedEquipment(selectedEquipment === eq ? null : eq)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors
                        ${selectedEquipment === eq 
                        ? "bg-green-600 text-white border-green-600" 
                        : "bg-gray-800 text-gray-300 border-gray-700 hover:border-green-500"}
                    `}
                    >
                    {eq}
                    </button>
                ))}
                </div>

              </div>

              {/* Results */}
            `<div className="flex-1 overflow-y-auto p-6">
            {(searchQuery || selectedMuscleGroup || selectedEquipment) && searchResults.length > 0 ? (
                <div className="space-y-2">
                {searchResults.map((exercise) => (
                    <button
                    key={exercise.id}
                    onClick={() => selectExercise(exercise)}
                    className="w-full p-4 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 hover:border-blue-500 transition-all text-left group"
                    >
                    <div className="flex items-center justify-between">
                        <div>
                        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {exercise.name}
                        </h4>
                        <div className="flex gap-3 mt-1">
                            <span className="text-xs text-gray-400">{exercise.category}</span>
                            <span className="text-xs text-gray-500">• {exercise.equipment}</span>
                        </div>
                        </div>
                        <Plus className="text-gray-600 group-hover:text-blue-400 transition-colors" size={20} />
                    </div>
                    </button>
                ))}
                </div>
            ) : (searchQuery || selectedMuscleGroup || selectedEquipment) && searchResults.length === 0 ? (
                <div className="text-center py-12">
                <p className="text-gray-400">No exercises found</p>
                <p className="text-gray-600 text-sm mt-2">Try a different search term or filter</p>
                </div>
            ) : (
                <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Start typing to search exercises</p>
                <p className="text-gray-600 text-sm mt-2">Search from 1,100+ exercises</p>
                </div>
            )}
            </div>
            </div>
          </div>
        )}

        {/* Exercises Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-300">
              Exercises ({exercises.length})
            </label>
            <button
              onClick={addExercise}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus size={16} />
              Add Exercise
            </button>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            {exercises.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
                <p className="text-gray-500 mb-3">No exercises added yet</p>
                <button
                  onClick={addExercise}
                  className="text-blue-500 hover:text-blue-400 text-sm font-medium"
                >
                  Click "Add Exercise" to get started
                </button>
              </div>
            ) : (
              exercises.map((exercise, index) => (
                <div key={exercise.id}>
                  {/* Group Label */}
                  {isFirstInGroup(exercise) && (
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-400">
                      <Link2 size={16} />
                      {getGroupType(exercise.groupId)}
                    </div>
                  )}
                  
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-gray-800 rounded-lg p-4 border transition-all ${
                      exercise.groupId 
                        ? 'border-purple-500/50 ml-4' 
                        : 'border-gray-700'
                    } ${
                      draggedIndex === index ? 'opacity-50' : 'hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      <div className="mt-3 text-gray-600 cursor-move hover:text-gray-400">
                        <GripVertical size={20} />
                      </div>

                      {/* Exercise Content */}
                      <div className="flex-1 space-y-3">
                        {/* Exercise Number and Name */}
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            exercise.groupId ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{exercise.name}</div>
                            {exercise.category && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {exercise.category} • {exercise.equipment}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sets, Reps, Weight, RIR/RPE */}
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Sets</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Reps</label>
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Weight</label>
                            <input
                              type="text"
                              value={exercise.weight}
                              onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              <select
                                value={exercise.intensityType}
                                onChange={(e) => updateExercise(exercise.id, 'intensityType', e.target.value)}
                                className="bg-transparent text-xs text-gray-400 focus:outline-none cursor-pointer"
                              >
                                <option value="RIR">RIR</option>
                                <option value="RPE">RPE</option>
                              </select>
                            </label>
                            <input
                              type="number"
                              value={exercise.rir}
                              onChange={(e) => updateExercise(exercise.id, 'rir', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              max="10"
                            />
                          </div>
                        </div>

                        {/* Group Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => createGroup(exercise.id, 'superset')}
                            className="text-xs px-3 py-1 bg-purple-600/20 text-purple-400 rounded-md hover:bg-purple-600/30 transition-colors"
                          >
                            {exercise.groupId ? '+ Add to Group' : '+ Superset/Circuit'}
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        className="mt-3 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {exercises.length > 0 && (
          <div className="flex gap-3 pt-6 border-t border-gray-800">
            <button className="flex-1 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg">
              Save Workout
            </button>
            <button className="px-6 py-3 bg-gray-800 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}