import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, GripVertical, Link2, Search } from 'lucide-react';
import { searchExerciseLibrary, getTrainerClients, sendTrainerWorkout } from "@/api/trainer";
import { SessionData, Exercise, ExerciseSet, Client, WorkoutPayload} from "@/api/trainerTypes";

/*
Structure
-----------
1. Exercises are ordered primarily by exerciseOrder (index)
2. Exercises are then grouped by setStructure of 0 (single), 1 (superset), or 2 (circuit)
3. Groups are then ordered by groupId that is the order of group in the workout
- Group Ids are given but not updated during, still unique so groups stay intact, will be updated at the end. 
*/


export default function WorkoutEditor() {
  const [exercises, setExercises] = useState<SessionData[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedGroupId, setDraggedGroupId] = useState<number | null>(null);
  const [uploadedFile, ] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const muscleGroups = ["Chest", "Upper Back", "Legs", "Shoulders", "Biceps", "Triceps", "Abs", "Quadriceps", "Glutes", "Hamstrings", "Lats"];
  const equipmentOptions = ["Barbell", "Dumbbell", "Machine", "Bodyweight", "Cable", "Smith Machine"];
  const [, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Workout Variables
  const [workoutName, setWorkoutName] = useState('');       // For workout name input
  const [workoutType, setWorkoutType] = useState('');       // For workout type dropdown
  const [workoutDate, setWorkoutDate] = useState<string | null>(null); // For workout date
  const [notes, setNotes] = useState('');   
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);

  // refs for debounce/abort
  const debounceRef = useRef<number | null>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);


//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUploadedFile(file);
//       console.log('File uploaded:', file.name);
//       // TODO: Send file to backend for processing
//     }
//   };

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

    const searchExercises = useCallback(
    async (query: string) => {
        if (!query.trim() && !selectedMuscleGroup && !selectedEquipment) {
        setSearchResults([]);
        return;
        }

        try {
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
    },
    [selectedMuscleGroup, selectedEquipment] // ✅ dependencies
    );


  // Core search logic — called by the effect below
    const runSearch = async (
    query: string,
    muscle?: string | null,
    equipment?: string
    ) => {
    try {
        const results = await searchExerciseLibrary(query, muscle, equipment);
        setSearchResults(results);
    } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
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
      runSearch(searchQuery, selectedMuscleGroup, selectedEquipment ?? undefined)
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

    const selectExercise = (selectedExercise: Exercise) => {
    // Determine groupId for a new exercise
    let groupId: number;

    if (groupAddContext) {
        const base = exercises.find(e => e.id === groupAddContext.baseExerciseId);
        if (base) {
        // Reuse existing groupId or assign a new one
        groupId = base.groupId ?? exercises.length + 1;

        // Update all exercises in the group to the new setStructure
        const updatedExercises = exercises.map(ex =>
            ex.groupId === groupId
            ? { ...ex, setStructure: groupAddContext.setStructure }
            : ex
        );
        setExercises(updatedExercises);
        } else {
        groupId = exercises.length + 1;
        }
    } else {
        groupId = exercises.length + 1; // new single group
    }

    const newSession: SessionData = {
        id: Date.now(),
        exerciseId: selectedExercise,
        exerciseName: "",
        exerciseOrder: exercises.length + 1,
        setStructure: groupAddContext?.setStructure ?? 0, // 0 = single
        groupId,
        sets: [
            {
            setsOrder: 1,
            reps: '10',
            rir: 2,
            rirOrRpe: 0,
            weight: '',
            weightUnit: 0,
            durationOrVelocity: 0,
            duration: null,
            },
        ],
    };

    // If adding to a group, assign new exercise to that group
    if (groupAddContext) {
        newSession.groupId = groupId;
        newSession.setStructure = groupAddContext.setStructure;
        setGroupAddContext(null);
    }

    setExercises(prev => [...prev, newSession]);
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
    }, [searchQuery, searchExercises]);


    const removeExercise = (id: number) => {
    const exerciseToRemove = exercises.find(ex => ex.id === id);
    if (!exerciseToRemove) return;

    const updatedExercises = exercises.filter(ex => ex.id !== id);

    if (exerciseToRemove.groupId !== null && exerciseToRemove.groupId !== undefined) {
        // find others in same group
        const remainingInGroup = updatedExercises.filter(
        ex => ex.groupId === exerciseToRemove.groupId
        );

        if (remainingInGroup.length === 1) {
        // Only one left, reset it to a single
        const lone = remainingInGroup[0];
        setExercises(
            updatedExercises.map(ex =>
            ex.id === lone.id
                ? { ...ex, setStructure: 0, groupId: null } // back to single
                : ex
            )
        );
        return;
        }
    }

    setExercises(updatedExercises);
    };

    // const updateExercise = <K extends keyof SessionData>(
    //     id: number,
    //     field: K,
    //     value: SessionData[K]
    //     ) => {
    //     setExercises(exercises.map(ex =>
    //         ex.id === id ? { ...ex, [field]: value } : ex
    //     ));
    // };

    // Drag start
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        setDraggedGroupId(exercises[index].groupId ?? exercises[index].id); // singles use their own id as group
        e.dataTransfer.effectAllowed = 'move';
    };

    // Drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const draggedExercise = exercises[draggedIndex];
        const targetExercise = exercises[index];

        // Only allow moving within same group
        const draggedGroup = draggedExercise.groupId ?? draggedExercise.id;
        const targetGroup = targetExercise.groupId ?? targetExercise.id;
        if (draggedGroup !== targetGroup) return;

        const newExercises = [...exercises];
        newExercises.splice(draggedIndex, 1);
        newExercises.splice(index, 0, draggedExercise);

        setDraggedIndex(index);
        setExercises(newExercises);
    };

    // Drag end
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDraggedGroupId(null);
    };

    // Returns all exercises in the same group
    const getGroupExercises = (groupId: number) => {
        return exercises.filter(ex => (ex.groupId ?? ex.id) === groupId);
    };

    const handleGroupDragStart = (e: React.DragEvent<HTMLDivElement>, groupId: number) => {
        setDraggedGroupId(groupId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleGroupDragOver = (e: React.DragEvent<HTMLDivElement>, targetGroupId: number) => {
        e.preventDefault();
        if (draggedGroupId === null || draggedGroupId === targetGroupId) return;

        const draggedGroupExercises = getGroupExercises(draggedGroupId);
        const otherExercises = exercises.filter(ex => (ex.groupId ?? ex.id) !== draggedGroupId);

        // Find target group index
        const targetIndex = otherExercises.findIndex(ex => (ex.groupId ?? ex.id) === targetGroupId);

        const newExercises = [
            ...otherExercises.slice(0, targetIndex),
            ...draggedGroupExercises,
            ...otherExercises.slice(targetIndex),
        ];

        setExercises(newExercises);
    };

    const handleGroupDragEnd = () => setDraggedGroupId(null);

    // Check if this exercise is the first in its group
    const isFirstInGroup = (exercise: SessionData) => {
        const groupId = exercise.groupId ?? exercise.id;
        const groupExercises = getGroupExercises(groupId);
        return groupExercises[0]?.id === exercise.id;
    };

    // Context for adding exercises to a group (superset or circuit)
    const [groupAddContext, setGroupAddContext] = useState<{
    baseExerciseId: number;             // exercise.id of the base exercise
    setStructure: 0 | 1 | 2;           // 0=single, 1=superset, 2=circuit
    } | null>(null);

    // -------- Sets Handling -----------
    // Add a set
    const addSet = (exerciseId: number) => {
    setExercises(exercises.map(ex => {
        if (ex.id === exerciseId) {
        // Get the last set's setsOrder, default to 0 if none
        const lastOrder = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].setsOrder : 0;

        const newSet: ExerciseSet = {
            setsOrder: lastOrder + 1, // increment
            reps: '10',
            rir: 2,
            rirOrRpe: 0,
            weight: '',
            weightUnit: 0,
            durationOrVelocity: 0,
            duration: null
        };

        return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
    }));
    };


    // Remove a set
    const removeSet = (exerciseId: number, setIndex: number) => {
    setExercises(exercises.map(ex => {
        if (ex.id === exerciseId) {
        const newSets = ex.sets
            .filter((_, i) => i !== setIndex)
            .map((s, i) => ({ ...s, setsOrder: i + 1 })); // re-number
        return { ...ex, sets: newSets };
        }
        return ex;
    }));
    };

    // Update a field in a set
    const updateSetField = <K extends keyof ExerciseSet>(
    exerciseId: number,
    setIndex: number,
    field: K,
    value: ExerciseSet[K]
    ) => {
    setExercises(exercises.map(ex => {
        if (ex.id === exerciseId) {
        const newSets = ex.sets.map((s, i) => i === setIndex ? { ...s, [field]: value } : s);
        return { ...ex, sets: newSets };
        }
        return ex;
    }));
    };
    const updateAllSetsField = <K extends keyof ExerciseSet>(
        exerciseId: number,
        field: K,
        value: ExerciseSet[K]
        ) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
            const updatedSets = ex.sets.map(set => ({
                ...set,
                [field]: value,
            }));
            return { ...ex, sets: updatedSets };
            }
            return ex;
        }));
    };

    const handleArrowNavigation = (
        e: React.KeyboardEvent<HTMLInputElement>,
        exerciseId: number,
        setIndex: number,
        colIndex: number
        ) => {
        const totalCols = 4; // reps, weight, rir, duration
        const exercise = exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        let nextSetIndex = setIndex;
        let nextColIndex = colIndex;

        switch (e.key) {
            case 'ArrowRight':
            case 'Enter':
                nextColIndex = (colIndex + 1) % totalCols;
                break;
            case 'ArrowLeft':
                nextColIndex = (colIndex - 1 + totalCols) % totalCols;
                break;
            case 'ArrowDown':
                nextSetIndex = Math.min(setIndex + 1, exercise.sets.length - 1);
                break;
                case 'ArrowUp':
            nextSetIndex = Math.max(setIndex - 1, 0);
                break;
                default:
                return;
        }

        e.preventDefault();
        const nextTabIndex = nextSetIndex * totalCols + nextColIndex;
        const nextInput = document.querySelector<HTMLInputElement>(`[tabindex='${nextTabIndex}']`);
        nextInput?.focus();
    };

    const handleSaveClients = async () => {
    // Create a workout payload for each selected client
        const workoutPayloads: WorkoutPayload[] = selectedClientsWithDates.map((clientWithDate) => ({
            workout_data: {
            client_id: clientWithDate.clientId,
            workout_name: workoutName || 'Default Workout',
            workout_date: clientWithDate.date,
            workout_start_time: new Date(clientWithDate.date).toISOString(),
            workout_end_time: new Date(new Date(clientWithDate.date).getTime() + 60 * 60 * 1000).toISOString(),
            workout_type: workoutType || 'General',
            duration: 60,
            prebuilt_workout: 1,
            exercises: exercises.map(ex => ({
                id: typeof ex.exerciseId === 'object' ? ex.exerciseId.id : ex.exerciseId,
                exercise_name: ex.exerciseName,
                exercise_order: ex.exerciseOrder,
                group_id: ex.groupId ?? 0,
                set_structure: ex.setStructure ?? 0,
                sets: ex.sets.map(s => ({
                sets_order: s.setsOrder,
                weight: s.weight ?? 0,
                reps: s.reps ?? '0',
                rir: s.rir ?? null,
                weight_unit: s.weightUnit ?? null,
                duration_or_velocity: s.durationOrVelocity ?? null,
                rir_or_rpe: s.rirOrRpe ?? null,
                duration: s.duration ?? null
                }))
            }))
        }
        }
        ));

        // Add the template workout with client_id: 0
        const templatePayload: WorkoutPayload = {
            workout_data: {
            client_id: 0,
            workout_name: workoutName || 'Default Workout',
            workout_date: workoutDate 
                ? new Date(workoutDate).toISOString().split('T')[0] 
                : new Date().toISOString().split('T')[0],
            workout_start_time: new Date().toISOString(),
            workout_end_time: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
            workout_type: workoutType || 'General',
            duration: 60,
            prebuilt_workout: 1, // Mark as template
            exercises: exercises.map(ex => ({
                id: typeof ex.exerciseId === 'object' ? ex.exerciseId.id : ex.exerciseId,
                exercise_name: ex.exerciseName,
                exercise_order: ex.exerciseOrder,
                group_id: ex.groupId ?? 0,
                set_structure: ex.setStructure ?? 0,
                sets: ex.sets.map(s => ({
                sets_order: s.setsOrder,
                weight: s.weight ?? 0,
                reps: s.reps ?? '0',
                rir: s.rir ?? null,
                weight_unit: s.weightUnit ?? null,
                duration_or_velocity: s.durationOrVelocity ?? null,
                rir_or_rpe: s.rirOrRpe ?? null,
                duration: s.duration ?? null
                }))
            }))
            }
        };

        // Add template to the payloads array
        workoutPayloads.push(templatePayload);

        console.log('Workout payloads for all clients + template:', workoutPayloads);

        try {
            // Send each workout individually, but all in parallel
            await Promise.all(
            workoutPayloads.map(payload => sendTrainerWorkout(payload))
            );
            
            alert(`Successfully assigned workout to ${selectedClientsWithDates.length} client(s) and saved as template!`);
            setShowModal(false);
            setSelectedClientsWithDates([]);
        } catch (error) {
            console.error('Error saving workouts:', error);
            alert('Failed to save one or more workouts');
        }
    };

    // Add state for selected clients with dates
    const [selectedClientsWithDates, setSelectedClientsWithDates] = useState<{
        clientId: number;
        date: string;
    }[]>([]);

    // Handle checkbox toggle
    const handleClientToggle = (clientId: number) => {
    setSelectedClientsWithDates((prev) => {
        const exists = prev.find((c) => c.clientId === clientId);
        if (exists) {
        // Remove if already selected
        return prev.filter((c) => c.clientId !== clientId);
        } else {
        // Add with today's date as default
        return [...prev, { clientId, date: new Date().toISOString().split('T')[0] }];
        }
    });
    };

    // Handle date change
    const handleDateChange = (clientId: number, newDate: string) => {
    setSelectedClientsWithDates((prev) =>
        prev.map((c) => (c.clientId === clientId ? { ...c, date: newDate } : c))
    );
    };

    // Check if client is selected
    const isClientSelected = (clientId: number) => {
    return selectedClientsWithDates.some((c) => c.clientId === clientId);
    };

    // Get date for a client
    const getClientDate = (clientId: number) => {
    return selectedClientsWithDates.find((c) => c.clientId === clientId)?.date || '';
    };
    async function fetchClients() {
    try {
        setLoading(true);
        const data = await getTrainerClients();
        console.log("Raw API data:", data);
        const clientList = data as Client[];
        setClients(clientList); // ← important: set state here
    } catch (err) {
        console.error("Failed to load clients:", err);
    } finally {
        setLoading(false);
    }
    }

    const assignAndSaveWorkout = () => {
        setShowModal(true);
        fetchClients(); // load clients when modal opens
    };

    // const cancelWorkout = () => {
    //     console.log('Cancel Workout clicked');
    // };

    const saveWorkout = async () => {
        const payload = formatWorkoutForSend();
        console.log("Current Workout:", payload);
        
        try {
            const response = await sendTrainerWorkout(payload);
            console.log("Workout saved successfully:", response);
            alert("Workout saved successfully!");
            
            // Optional: Clear the form or redirect
            // resetWorkoutForm();
            // router.push('/workouts');
        } catch (error) {
            console.error("Failed to save workout:", error);
            alert("Failed to save workout. Please try again.");
        }
    };

    const formatWorkoutForSend = () => {
        const formattedWorkout = {
            workout_data: {
            client_id: 0, // or null
            workout_name: workoutName || 'Default Workout',
            workout_date: workoutDate 
            ? new Date(workoutDate).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0],
            workout_start_time: new Date().toISOString(),
            workout_end_time: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
            workout_type: workoutType || 'General',
            duration: 60,
            prebuilt_workout: 1,
            exercises: exercises.map(ex => ({
                id: typeof ex.exerciseId === 'object' ? ex.exerciseId.id : ex.exerciseId,
                exercise_name: ex.exerciseName,
                exercise_order: ex.exerciseOrder,
                group_id: ex.groupId ?? 0,
                set_structure: ex.setStructure ?? 0,
                sets: ex.sets.map(s => ({
                sets_order: s.setsOrder,
                weight: s.weight ?? 0,
                reps: s.reps ?? '0',
                rir: s.rir ?? null,
                weight_unit: s.weightUnit ?? null,
                duration_or_velocity: s.durationOrVelocity ?? null,
                rir_or_rpe: s.rirOrRpe ?? null,
                duration: s.duration ?? null
                }))
            }))
            }
        };

        console.log('Formatted Workout Payload:', formattedWorkout);
        return formattedWorkout;
    };


  return (
    <div className="flex-1 border-r border-gray-800 overflow-y-auto bg-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-3xl font-bold mb-2">Create Workout</h2>
        </div>
          {/* Workout Name */}
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Workout Name</label>
            <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Enter workout name"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>

        {/* Workout Type + Date */}
        <div className="flex gap-4 mb-4">
            {/* Type Dropdown */}
            <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Workout Type</label>
            <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="">Select type</option>
                <option value="General">General</option>
                <option value="Strength">Strength</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Powerlifting">Powerlifting</option>
                <option value="HIIT">HIIT</option>
            </select>
            </div>

            {/* Date Picker */}
            <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Workout Date (Optional)</label>
            <input
                type="date"
                value={workoutDate ?? ''}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                    // onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center py-3">
                    {uploadedFile ? (
                      <>
                        <svg className="w-10 h-10 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {/* <p className="text-sm font-medium text-green-400 mb-1">{uploadedFile.name}</p> */}
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

                <div className="flex items-center gap-3">
                {/* Only show these if there’s at least one exercise */}
                {exercises.length > 0 && (
                    <>
                    <button
                        onClick={saveWorkout}
                        className="px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-lg"
                    >
                        Save Workout
                    </button>

                    <button
                    onClick={() => assignAndSaveWorkout()}
                    className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg"
                    >
                    Assign & Save
                    </button>

                        {showModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Select Clients</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                </div>
                            </div>

                            {/* Client List */}
                            <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="text-center py-12">
                                <p className="text-gray-400">Loading clients...</p>
                                </div>
                            ) : clients.length > 0 ? (
                                <div className="space-y-3">
                                {clients.map((client) => (
                                    <div key={client.id} className="space-y-2">
                                    <label className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer group">
                                        <input
                                        type="checkbox"
                                        checked={isClientSelected(client.id)}
                                        onChange={() => handleClientToggle(client.id)}
                                        className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                        />
                                        <span className="text-white group-hover:text-blue-400 transition-colors">
                                        {client.first_name} {client.last_name}
                                        </span>
                                    </label>
                                    
                                    {/* Date picker - only show if client is selected */}
                                    {isClientSelected(client.id) && (
                                        <div className="ml-7 pl-4 border-l-2 border-gray-700">
                                        <label className="block text-sm text-gray-400 mb-1">
                                            Assign Date:
                                        </label>
                                        <input
                                            type="date"
                                            value={getClientDate(client.id)}
                                            onChange={(e) => handleDateChange(client.id, e.target.value)}
                                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        </div>
                                    )}
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                <p className="text-gray-400">No clients found</p>
                                </div>
                            )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
                                <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                                >
                                Cancel
                                </button>
                                <button
                                onClick={handleSaveClients}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                Save
                                </button>
                            </div>
                            </div>
                        </div>
                        )}
                    </>
                    )}
                    {/* Always show Add Exercise */}
                    <button
                        onClick={addExercise}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        <Plus size={16} />
                        Add Exercise
                    </button>
                </div>
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
                    Click &quot;Add Exercise&quot; to get started
                </button>
              </div>
            ) : (
              exercises.map((exercise, index) => (
                <div key={exercise.id}>
                  {/* Group Label */}
                    {isFirstInGroup(exercise) || exercise.setStructure === 0 ? (
                    <div
                        draggable
                        onDragStart={(e) => handleGroupDragStart(e, exercise.groupId ?? exercise.id)}
                        onDragOver={(e) => handleGroupDragOver(e, exercise.groupId ?? exercise.id)}
                        onDragEnd={handleGroupDragEnd}
                        className={`mb-2 flex items-center gap-2 text-sm font-medium cursor-move ${
                        exercise.setStructure === 1
                            ? 'text-purple-400'
                            : exercise.setStructure === 2
                            ? 'text-green-400'
                            : 'text-gray-400'
                        }`}
                    >
                        <Link2 size={16} />
                        {exercise.setStructure === 1
                        ? 'Superset'
                        : exercise.setStructure === 2
                        ? 'Circuit'
                        : 'Single'}
                    </div>
                    ) : null}
                    <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-gray-800 rounded-lg p-4 border transition-all ${
                        exercise.setStructure === 1
                        ? 'border-purple-500/50 ml-4'
                        : exercise.setStructure === 2
                        ? 'border-green-500/50 ml-4'
                        : 'border-gray-700'
                    }  ${
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
                            <div className="font-semibold text-white">{exercise.exerciseId.name}</div>
                            {exercise.exerciseId.category && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {exercise.exerciseId.category} • {exercise.exerciseId.equipment}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sets Section */}
                        <div className="mt-3 space-y-2">
                        {/* Header Row */}
                        <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_60px] gap-2 items-center mb-2 font-semibold text-gray-400">
                            <div className="text-center">Set</div>
                            <div className="text-center">Reps</div>

                            {/* Weight header as dropdown */}
                            <div className="text-center">
                                <select
                                value={exercise.sets[0]?.weightUnit ?? 0}
                                onChange={(e) =>
                                    updateAllSetsField(exercise.id, 'weightUnit', e.target.value === '1' ? 1 : 0)
                                }
                                className="w-full bg-transparent text-gray-400 text-sm text-center focus:outline-none cursor-pointer"
                                >
                                <option value={0}>Weight (lbs)</option>
                                <option value={1}>Weight (kg)</option>
                                </select>
                            </div>

                            {/* RIR/RPE header as dropdown */}
                            <div className="text-center">
                                <select
                                value={exercise.sets[0]?.rirOrRpe ?? 0}
                                onChange={(e) =>
                                    updateAllSetsField(
                                    exercise.id,
                                    'rirOrRpe',
                                    e.target.value === '1' ? 1 : 0
                                    )
                                }
                                className="w-full bg-transparent text-gray-400 text-sm text-center focus:outline-none cursor-pointer"
                                >
                                <option value={0}>RIR</option>
                                <option value={1}>RPE</option>
                                </select>
                            </div>

                            {/* Duration/Velocity header as dropdown */}
                            <div className="text-center">
                                <select
                                value={exercise.sets[0]?.durationOrVelocity ?? 0}
                                onChange={(e) =>
                                    updateAllSetsField(
                                    exercise.id,
                                    'durationOrVelocity',
                                    e.target.value === '1' ? 1 : 0
                                    )
                                }
                                className="w-full bg-transparent text-gray-400 text-sm text-center focus:outline-none cursor-pointer"
                                >
                                <option value={0}>Duration</option>
                                <option value={1}>Velocity</option>
                                </select>
                            </div>

                            <div className="text-center">Actions</div>
                        </div>

                        {/* Sets Rows */}
                        {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_60px] gap-2 items-center mb-2">
                            <div className="text-center font-semibold">{setIndex + 1}</div>

                            <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSetField(exercise.id, setIndex, 'reps', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            tabIndex={setIndex * 4 + 0} // column 0 = reps
                            onKeyDown={(e) => handleArrowNavigation(e, exercise.id, setIndex, 0)}
                            />

                            <input
                            type="text"
                            value={set.weight}
                            onChange={(e) => updateSetField(exercise.id, setIndex, 'weight', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            tabIndex={setIndex * 4 + 1} // column 1 = weight
                            onKeyDown={(e) => handleArrowNavigation(e, exercise.id, setIndex, 1)}
                            />

                            <input
                            type="number"
                            value={set.rir}
                            onChange={(e) => updateSetField(exercise.id, setIndex, 'rir', Number(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            tabIndex={setIndex * 4 + 2} // column 2 = RIR
                            onKeyDown={(e) => handleArrowNavigation(e, exercise.id, setIndex, 2)}
                            />

                            <input
                            type="number"
                            value={set.duration ?? ''}
                            onChange={(e) => updateSetField(exercise.id, setIndex, 'duration', e.target.value ? Number(e.target.value) : null)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            tabIndex={setIndex * 4 + 3} // column 3 = duration
                            onKeyDown={(e) => handleArrowNavigation(e, exercise.id, setIndex, 3)}
                            />

                            <button
                                onClick={() => removeSet(exercise.id, setIndex)}
                                className="text-2xl text-red-500 px-2 py-1 rounded hover:bg-red-500/10"
                            >
                                -
                            </button>
                            </div>
                        ))}

                        {/* Add Set Button */}
                        <div className="text-right">
                            <button
                            onClick={() => addSet(exercise.id)}
                            className="text-sm px-3 py-1 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30 transition-colors mt-2"
                            >
                            + Add Set
                            </button>
                        </div>
                        </div>
                        {/* Group Actions */}
                        <div className="flex gap-2">
                        {exercise.setStructure === 0 && (
                            <button
                            onClick={() => {
                                setGroupAddContext({ baseExerciseId: exercise.id, setStructure: 1 });
                                setShowExerciseSearch(true);
                            }}
                            className="text-sm px-3 py-1 bg-purple-600/20 text-purple-400 rounded-md hover:bg-purple-600/30 transition-colors"
                            >
                            + Start Superset
                            </button>
                        )}

                        {exercise.setStructure === 1 && (
                            <button
                            onClick={() => {
                                setGroupAddContext({ baseExerciseId: exercise.id, setStructure: 2 });
                                setShowExerciseSearch(true);
                            }}
                            className="text-sm px-3 py-1 bg-green-600/20 text-green-400 rounded-md hover:bg-green-600/30 transition-colors"
                            >
                            + Create Circuit
                            </button>
                        )}

                        {exercise.setStructure === 2 && (
                            <button
                            onClick={() => {
                                setGroupAddContext({ baseExerciseId: exercise.id, setStructure: 2 });
                                setShowExerciseSearch(true);
                            }}
                            className="text-sm px-3 py-1 bg-green-600/20 text-green-400 rounded-md hover:bg-green-600/30 transition-colors"
                            >
                            + Add to Circuit
                            </button>
                        )}
                        </div>


                      </div>
                      {/* Remove Button */}
                        <button
                        onClick={() => removeExercise(exercise.id)} // use the session id
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
      </div>
    </div>
  );
}