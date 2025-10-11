import React, { useState } from 'react';

type ProgramType = 
  | "Weight Loss"
  | "Muscle Gain"
  | "Performance"
  | "Body Recomposition"
  | "Maintenance"
  | "Pre/Post Competition"
  | "Health & Wellness";

type DietaryApproach = 
  | "Standard"
  | "Ketogenic"
  | "Low Carb"
  | "Paleo"
  | "Vegan"
  | "Vegetarian"
  | "Mediterranean"
  | "Intermittent Fasting"
  | "Carb Cycling";

interface Meal {
  id: number;
  name: string;
  time: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  fiber: string;
  foods: string;
  notes: string;
}

export default function NutritionPlanBuilder() {
  const [planName, setPlanName] = useState("");
  const [programType, setProgramType] = useState<ProgramType>("Weight Loss");
  const [dietaryApproach, setDietaryApproach] = useState<DietaryApproach>("Standard");
  const [targetCalories, setTargetCalories] = useState("");
  const [proteinTarget, setProteinTarget] = useState("");
  const [carbsTarget, setCarbsTarget] = useState("");
  const [fatsTarget, setFatsTarget] = useState("");
  const [fiberTarget, setFiberTarget] = useState("");
  const [waterTarget, setWaterTarget] = useState("8");
  const [description, setDescription] = useState("");

  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, name: "Breakfast", time: "07:00", calories: "", protein: "", carbs: "", fats: "", fiber: "", foods: "", notes: "" },
    { id: 2, name: "Lunch", time: "12:00", calories: "", protein: "", carbs: "", fats: "", fiber: "", foods: "", notes: "" },
    { id: 3, name: "Dinner", time: "18:00", calories: "", protein: "", carbs: "", fats: "", fiber: "", foods: "", notes: "" },
  ]);

  const programTypes: ProgramType[] = [
    "Weight Loss",
    "Muscle Gain",
    "Performance",
    "Body Recomposition",
    "Maintenance",
    "Pre/Post Competition",
    "Health & Wellness",
  ];

  const dietaryApproaches: DietaryApproach[] = [
    "Standard",
    "Ketogenic",
    "Low Carb",
    "Paleo",
    "Vegan",
    "Vegetarian",
    "Mediterranean",
    "Intermittent Fasting",
    "Carb Cycling",
  ];

  const addMeal = () => {
    setMeals([
      ...meals,
      { id: Date.now(), name: "Snack", time: "15:00", calories: "", protein: "", carbs: "", fats: "", fiber: "", foods: "", notes: "" },
    ]);
  };

  const removeMeal = (id: number) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  const updateMeal = (id: number, field: keyof Meal, value: string) => {
    setMeals(meals.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const duplicateMeal = (id: number) => {
    const mealToDupe = meals.find((m) => m.id === id);
    if (mealToDupe) {
      const newMeal = { ...mealToDupe, id: Date.now(), name: `${mealToDupe.name} (Copy)` };
      const index = meals.findIndex((m) => m.id === id);
      const newMeals = [...meals];
      newMeals.splice(index + 1, 0, newMeal);
      setMeals(newMeals);
    }
  };

  const moveMeal = (id: number, direction: "up" | "down") => {
    const index = meals.findIndex((m) => m.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === meals.length - 1)
    ) {
      return;
    }

    const newMeals = [...meals];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newMeals[index], newMeals[targetIndex]] = [newMeals[targetIndex], newMeals[index]];
    setMeals(newMeals);
  };

  const getTotalCalories = () => {
    return meals.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0);
  };

  const getTotalProtein = () => {
    return meals.reduce((sum, m) => sum + (parseFloat(m.protein) || 0), 0);
  };

  const getTotalCarbs = () => {
    return meals.reduce((sum, m) => sum + (parseFloat(m.carbs) || 0), 0);
  };

  const getTotalFats = () => {
    return meals.reduce((sum, m) => sum + (parseFloat(m.fats) || 0), 0);
  };

  const getTotalFiber = () => {
    return meals.reduce((sum, m) => sum + (parseFloat(m.fiber) || 0), 0);
  };

  const calculateMacroPercentages = () => {
    const totalCals = getTotalCalories();
    if (totalCals === 0) return { protein: 0, carbs: 0, fats: 0 };
    
    const proteinCals = getTotalProtein() * 4;
    const carbsCals = getTotalCarbs() * 4;
    const fatsCals = getTotalFats() * 9;

    return {
      protein: Math.round((proteinCals / totalCals) * 100),
      carbs: Math.round((carbsCals / totalCals) * 100),
      fats: Math.round((fatsCals / totalCals) * 100),
    };
  };

  const macroPercentages = calculateMacroPercentages();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
            <div>
                <h1 className="text-3xl font-bold mb-1">Nutrition Plan Builder</h1>
                <p className="text-gray-400 text-sm">Design personalized meal plans with precision macro tracking</p>
            </div>
            <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                Save as Template
                </button>
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors shadow-md">
                Save & Assign
                </button>
            </div>
            </div>
        </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-4 gap-6 flex-1 overflow-hidden">
        {/* Left Column - Plan Details & Targets */}
        <div className="col-span-1 space-y-4 overflow-y-auto pr-2">
          {/* Client & Plan Info */}
<div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-lg font-semibold">Plan Information</h2>
            </div>
            
            <div className="space-y-3">

              <div>
                <label className="text-xs text-gray-400 block mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., Week 1 - Fat Loss Phase"
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Program Goal</label>
                <select
                  value={programType}
                  onChange={(e) => setProgramType(e.target.value as ProgramType)}
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {programTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Dietary Approach</label>
                <select
                  value={dietaryApproach}
                  onChange={(e) => setDietaryApproach(e.target.value as DietaryApproach)}
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {dietaryApproaches.map((approach) => (
                    <option key={approach} value={approach}>
                      {approach}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Plan Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any special instructions or considerations..."
                  rows={3}
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Daily Nutrition Targets */}
<div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-semibold">Daily Targets</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Total Calories</label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    placeholder="2000"
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500">kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Protein</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={proteinTarget}
                      onChange={(e) => setProteinTarget(e.target.value)}
                      placeholder="150"
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-500">g</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Carbs</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={carbsTarget}
                      onChange={(e) => setCarbsTarget(e.target.value)}
                      placeholder="200"
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-500">g</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Fats</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={fatsTarget}
                      onChange={(e) => setFatsTarget(e.target.value)}
                      placeholder="65"
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-500">g</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Fiber</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={fiberTarget}
                      onChange={(e) => setFiberTarget(e.target.value)}
                      placeholder="30"
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-500">g</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Daily Water Intake</label>
                <div className="relative">
                  <input
                    type="number"
                    value={waterTarget}
                    onChange={(e) => setWaterTarget(e.target.value)}
                    placeholder="8"
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500">glasses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Macro Summary Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-lg text-white">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Daily Totals
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">Total Calories</span>
                <span className="text-xl font-bold">{getTotalCalories()}</span>
              </div>
              <div className="h-px bg-white/20"></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-90">Protein</span>
                  <span className="font-semibold">{getTotalProtein()}g ({macroPercentages.protein}%)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-90">Carbs</span>
                  <span className="font-semibold">{getTotalCarbs()}g ({macroPercentages.carbs}%)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-90">Fats</span>
                  <span className="font-semibold">{getTotalFats()}g ({macroPercentages.fats}%)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-90">Fiber</span>
                  <span className="font-semibold">{getTotalFiber()}g</span>
                </div>
              </div>
              <div className="h-px bg-white/20 my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">Total Meals</span>
                <span className="text-lg font-bold">{meals.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Meal Builder */}
        <div className="col-span-3 overflow-hidden flex flex-col">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div>
                <h2 className="text-xl font-semibold mb-1">Daily Meal Structure</h2>
                <p className="text-sm text-gray-400">Configure meals with precise macronutrient targets</p>
              </div>
              <button
                onClick={addMeal}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Meal
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              {meals.map((meal, index) => (
                <div key={meal.id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors shadow-sm">
                  {/* Meal Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveMeal(meal.id, "up")}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveMeal(meal.id, "down")}
                            disabled={index === meals.length - 1}
                            className="text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">#{index + 1}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => updateMeal(meal.id, "name", e.target.value)}
                          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-base font-semibold w-40 focus:outline-none focus:border-blue-500 transition-colors"
                        />

                        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <input
                            type="time"
                            value={meal.time}
                            onChange={(e) => updateMeal(meal.id, "time", e.target.value)}
                            className="bg-transparent text-sm font-medium text-gray-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateMeal(meal.id)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Duplicate Meal"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeMeal(meal.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Remove Meal"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Macronutrient Grid */}
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase">Calories</label>
                      <input
                        type="number"
                        value={meal.calories}
                        onChange={(e) => updateMeal(meal.id, "calories", e.target.value)}
                        placeholder="500"
                        className="w-full text-lg font-semibold bg-transparent focus:outline-none"
                      />
                      <span className="text-xs text-gray-500">kcal</span>
                    </div>
                    
                    <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700">
                      <label className="text-xs font-bold text-blue-400 block mb-1.5 uppercase">Protein</label>
                      <input
                        type="number"
                        value={meal.protein}
                        onChange={(e) => updateMeal(meal.id, "protein", e.target.value)}
                        placeholder="30"
                        className="w-full text-lg font-semibold text-blue-300 bg-transparent focus:outline-none"
                      />
                      <span className="text-xs text-blue-500">grams</span>
                    </div>

                    <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-700">
                      <label className="text-xs font-bold text-yellow-400 block mb-1.5 uppercase">Carbs</label>
                      <input
                        type="number"
                        value={meal.carbs}
                        onChange={(e) => updateMeal(meal.id, "carbs", e.target.value)}
                        placeholder="50"
                        className="w-full text-lg font-semibold text-yellow-300 bg-transparent focus:outline-none"
                      />
                      <span className="text-xs text-yellow-500">grams</span>
                    </div>

                    <div className="bg-red-900/30 rounded-lg p-3 border border-red-700">
                      <label className="text-xs font-bold text-red-400 block mb-1.5 uppercase">Fats</label>
                      <input
                        type="number"
                        value={meal.fats}
                        onChange={(e) => updateMeal(meal.id, "fats", e.target.value)}
                        placeholder="15"
                        className="w-full text-lg font-semibold text-red-300 bg-transparent focus:outline-none"
                      />
                      <span className="text-xs text-red-500">grams</span>
                    </div>

                    <div className="bg-green-900/30 rounded-lg p-3 border border-green-700">
                      <label className="text-xs font-bold text-green-400 block mb-1.5 uppercase">Fiber</label>
                      <input
                        type="number"
                        value={meal.fiber}
                        onChange={(e) => updateMeal(meal.id, "fiber", e.target.value)}
                        placeholder="8"
                        className="w-full text-lg font-semibold text-green-300 bg-transparent focus:outline-none"
                      />
                      <span className="text-xs text-green-500">grams</span>
                    </div>
                  </div>

                  {/* Food Items */}
                  <div className="mb-3">
                    <label className="text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Food Items & Options
                    </label>
                    <textarea
                      value={meal.foods}
                      onChange={(e) => updateMeal(meal.id, "foods", e.target.value)}
                      placeholder="Example: 6oz grilled chicken breast, 1 cup brown rice, 2 cups steamed broccoli, 1 tbsp olive oil"
                      rows={2}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Preparation Notes */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Preparation Notes
                    </label>
                    <input
                      type="text"
                      value={meal.notes}
                      onChange={(e) => updateMeal(meal.id, "notes", e.target.value)}
                      placeholder="e.g., 'Can substitute salmon for chicken' or 'Meal prep friendly - prepare 3 servings'"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              ))}

                {/* Empty State */}
                {meals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    No meals added yet
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                    Click &quot;Add Meal&quot; to start building your nutrition plan
                    </p>
                </div>
                )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}