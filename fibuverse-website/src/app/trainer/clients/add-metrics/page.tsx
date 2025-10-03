"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendHealthMetricsData, sendBodyMeasurementData, sendBodyFatData, sendFitnessTestsData } from "@/api/trainer";
import fitnessMetadata from "@/app/data/fitness_metric_metadata.json";

function MetricsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = Number(searchParams.get("clientId")) || 1;
  const clientName = searchParams.get("clientName") || "Unknown";
  const clientGender = searchParams.get("clientGender") || "Unknown";
  const clientAgeStr = searchParams.get("clientAge");
  const clientAge = clientAgeStr ? Number(clientAgeStr) : null;

  // Metric Ranges for specific Client for Gauges
  const getRangesForMetric = (
    metric: string,
    gender?: string | null,
    age?: number | null
  ) => {
    const defaultGender = "male";
    
    // Type assertion to tell TypeScript this is safe
    const metricData = fitnessMetadata[metric as keyof typeof fitnessMetadata];
    
    if (!metricData) return null;
    
    // Determine gender to use
    const g = gender && metricData[gender.toLowerCase() as keyof typeof metricData] 
      ? gender.toLowerCase() 
      : defaultGender;
    
    // Determine age group
    const ageGroups = Object.keys(metricData[g as keyof typeof metricData]);
    let selectedGroup = ageGroups[0];
    
    if (age) {
      for (const group of ageGroups) {
        const [min, max] = group.split("-").map(Number);
        if (age >= min && age <= max) {
          selectedGroup = group;
          break;
        }
      }
    }
    
    const genderData = metricData[g as keyof typeof metricData];
    const ranges = genderData[selectedGroup as keyof typeof genderData];
    
    return ranges;
  };

  // -------------------- Health Metrics --------------------
  const [healthMetrics, setHealthMetrics] = useState({
    resting_hr: "",
    max_hr: "",
    vo2max: "",
    hrv_ms: "",
    systolic_bp: "",
    diastolic_bp: "",
  });

  // -------------------- Body Measurements --------------------
  const [bodyMeasurements, setBodyMeasurements] = useState({
    weight_kg: "",
    height_cm: "",
    bmi: "",
    waist_cm: "",
    hip_cm: "",
    waist_to_height_ratio: "",
    body_fat_percentage: "",
  });

  // -------------------- Body Fat Skinfolds --------------------
  const [skinfolds, setSkinfolds] = useState({
    chest: "",
    abdomen: "",
    thigh: "",
    triceps: "",
    subscapular: "",
    midaxillary: "",
    biceps: "",
    calf: "",
    suprailiac: "",
  });

    // -------------------- Fitness Tests --------------------
  const [fitnessTest, setFitnessTests] = useState({
    sit_and_reach_cm: "",
    hand_dynamometer_kg: "",
    plank_hold_seconds: "",
    wall_sit_seconds: "",
    balance_test_seconds: "",
    push_ups_test: "",
    sit_ups_test: "",
    pull_ups_test: "",
    bench_press_1rm_kg: "",
    leg_press_1rm_kg: "",
  });

  const handleChange = (section: string, field: string, value: string) => {
    switch (section) {
      case "health":
        setHealthMetrics({ ...healthMetrics, [field]: value });
        break;
      case "body":
        setBodyMeasurements({ ...bodyMeasurements, [field]: value });
        break;
      case "skinfold":
        setSkinfolds({ ...skinfolds, [field]: value });
        break;
      case "fitness":
        setFitnessTests({ ...fitnessTest, [field]: value });
        break;
    }
  };

  const handleSubmit = async () => {
    const payloads = [
      { func: sendHealthMetricsData, data: healthMetrics },
      { func: sendBodyMeasurementData, data: bodyMeasurements },
      { func: sendBodyFatData, data: skinfolds },
      { func: sendFitnessTestsData, data: fitnessTest },
    ];

    const clientPayload = { client_id: clientId };

    try {
      for (const { func, data } of payloads) {
        const hasData = Object.values(data).some(
          (val) => val !== null && val !== undefined && val !== ""
        );
        if (!hasData) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (func as any)({ ...clientPayload, ...data });
      }

      alert("Metrics sent successfully!");
      router.push("/trainer/clients");
    } catch (err) {
      console.error(err);
      alert("Failed to send some metrics.");
    }
  };

  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  // Renders a single health metric with dynamic gauge and table
  const renderHealthMetric = (field: string) => {
    const metricData = fitnessMetadata[field as keyof typeof fitnessMetadata];
    if (!metricData) return null;

    // get base numeric values for the chosen client (e.g., { low:20, healthy:50, high:100 })
    const rangesObj = getRangesForMetric(field, clientGender, Number(clientAge)) || {};
    const sortedLabels = Object.keys(rangesObj);                // ["low","healthy","high"]
    const sortedValues = sortedLabels.map((label) => rangesObj[label as keyof typeof rangesObj] ?? 0); // [20,50,100]

    if (sortedValues.length === 0) {
      // fallback single empty range
      return null;
    }

    // padding for visual breathing room
    const leftPadding = Math.max(sortedValues[0] - 20, 0);
    const rightPadding = sortedValues[sortedValues.length - 1] + 20;

    // Build ranges: each range covers previousBoundary -> currentBoundary.
    // last range extends to rightPadding
    const ranges = sortedLabels.map((label, i) => {
      const currBoundary = sortedValues[i];
      const nextBoundary = i < sortedLabels.length - 1 ? sortedValues[i + 1] : rightPadding;

      const colors: Record<string, string> = {
        low: "bg-red-500/30",          // very low / risky
        poor: "bg-red-400/30",      // slightly better than low, still bad
        healthy: "bg-green-500/30",    // normal healthy range
        overweight: "bg-yellow-500/30",   // slightly above healthy
        high: "bg-red-600/30",         // too high, risky
        obese: "bg-red-700/30",        // very high risk
        underweight: "bg-blue-400/30", // too low, also unhealthy
        good: "bg-green-600/30",    // solid healthy
        "below average": "bg-orange-400/30",
        average: "bg-yellow-400/30",
        "above average": "bg-green-500/30",
        excellent: "bg-green-700/30",    // top tier

      };

      // First range starts from leftPadding
      const rangeMin = i === 0 ? leftPadding : currBoundary;
      const rangeMax = nextBoundary;

      return {
        label,
        min: rangeMin,
        max: rangeMax,
        boundary: currBoundary,
        color: colors[label] ?? "bg-gray-500/30",
      };
    });

    // Tick values: show the canonical boundaries (the original values) so last high is visible
    const tickValues = sortedValues.slice(); // e.g. [20,50,100]

    // overall scale
    const overallMin = leftPadding;
    const overallMax = rightPadding;

    return (
      <MetricGauge
        key={field} // ← Add this
        label={field}
        value={Number(healthMetrics[field as keyof typeof healthMetrics]) || 0}
        onChange={(val) => handleChange("health", field, String(val))}        
        ranges={ranges}
        minValue={overallMin}
        maxValue={overallMax}
        ticks={tickValues}
        description={metricData.description}
        tableData={{
          male: metricData.male,
          female: metricData.female,
        }}
        expandedMetric={expandedMetric}
        setExpandedMetric={setExpandedMetric}
      />
    );
  };

  // Renders a single health metric with dynamic gauge and table
  const renderBodyMetric = (field: string) => {
    const metricData = fitnessMetadata[field as keyof typeof fitnessMetadata];
    if (!metricData) return null;

    // get base numeric values for the chosen client (e.g., { low:20, healthy:50, high:100 })
    const rangesObj = getRangesForMetric(field, clientGender, Number(clientAge)) || {};
    const sortedLabels = Object.keys(rangesObj);                // ["low","healthy","high"]
    const sortedValues = sortedLabels.map((label) => rangesObj[label as keyof typeof rangesObj] ?? 0); // [20,50,100]

    if (sortedValues.length === 0) {
      // fallback single empty range
      return null;
    }

    // padding for visual breathing room
    const leftPadding = Math.max(sortedValues[0] - 20, 0);
    const rightPadding = sortedValues[sortedValues.length - 1] + 20;

    // last range extends to rightPadding
    const ranges = sortedLabels.map((label, i) => {
          const currBoundary = sortedValues[i];
          const nextBoundary = i < sortedLabels.length - 1 ? sortedValues[i + 1] : rightPadding;

          const colors: Record<string, string> = {
            low: "bg-red-500/30",          // very low / risky
            healthy: "bg-green-500/30",    // normal healthy range
            high: "bg-red-600/30",         // too high, risky

            obese: "bg-red-700/30",        // very high risk
            underweight: "bg-blue-400/30", // too low, also unhealthy
            overweight: "bg-orange-500/30",// above healthy but not obese

            "below average": "bg-orange-400/30", // slightly concerning, warmer tone
            average: "bg-yellow-400/30",         // neutral baseline, balanced
            "above average": "bg-green-500/30",
          };

          // First range starts from leftPadding, others start at current boundary
          const rangeMin = i === 0 ? leftPadding : currBoundary;
          const rangeMax = nextBoundary;

          return {
            label,
            min: rangeMin,
            max: rangeMax,
            // store also the canonical boundary for tick labeling if needed
            boundary: currBoundary,
            color: colors[label] ?? "bg-gray-500/30",
          };
        });

    // Tick values: show the canonical boundaries (the original values) so last high is visible
    const tickValues = sortedValues.slice(); // e.g. [20,50,100]

    // overall scale
    const minVal = Math.min(...sortedValues);
    const maxVal = Math.max(...sortedValues);
    const padding = (maxVal - minVal) * 0.2;

    let overallMin = minVal - padding;
    let overallMax = maxVal + padding;

    // Round based on magnitude
    const isDecimal = overallMax <= 1;
    if (isDecimal) {
      // round to hundredth
      overallMin = Math.max(0, Math.round(overallMin * 100) / 100);
      overallMax = Math.round(overallMax * 100) / 100;
    } else {
      // whole numbers
      overallMin = Math.max(0, Math.floor(overallMin));
      overallMax = Math.ceil(overallMax);
    }

    return (
      <MetricGauge
        key={field} // ← Add this
        label={field}
        value={Number(bodyMeasurements[field as keyof typeof bodyMeasurements])}
        onChange={(val) => handleChange("body", field, String(val))}
        ranges={ranges}
        minValue={overallMin}
        maxValue={overallMax}
        ticks={tickValues}
        description={metricData.description}
        tableData={{
          male: metricData.male,
          female: metricData.female,
        }}
        expandedMetric={expandedMetric}
        setExpandedMetric={setExpandedMetric}
      />
    );
  };
    // Renders a single health metric with dynamic gauge and table
  const renderFitnessTests = (field: string) => {
    const metricData = fitnessMetadata[field as keyof typeof fitnessMetadata];
    if (!metricData) return null;

    // get base numeric values for the chosen client (e.g., { low:20, healthy:50, high:100 })
    const rangesObj = getRangesForMetric(field, clientGender, Number(clientAge)) || {};
    const sortedLabels = Object.keys(rangesObj);                // ["low","healthy","high"]
    const sortedValues = sortedLabels.map((label) => rangesObj[label as keyof typeof rangesObj] ?? 0); // [20,50,100]

    if (sortedValues.length === 0) {
      // fallback single empty range
      return null;
    }

    // padding for visual breathing room
    const leftPadding = Math.max(sortedValues[0] - 20, 0);
    const rightPadding = sortedValues[sortedValues.length - 1] + 20;

        // last range extends to rightPadding
    const ranges = sortedLabels.map((label, i) => {
          const currBoundary = sortedValues[i];
          const nextBoundary = i < sortedLabels.length - 1 ? sortedValues[i + 1] : rightPadding;

          const colors: Record<string, string> = {
            low: "bg-red-500/30",            // very low / risky
            poor: "bg-red-400/30",           // slightly better than low, still bad
            obese: "bg-red-700/30",          // very risky (darker red for severity)
            overweight: "bg-orange-400/30",     // caution, leaning unhealthy
            average: "bg-yellow-400/30",     // middle-of-the-road, neutral
            healthy: "bg-green-500/30",      // normal healthy range
            good: "bg-green-600/30",         // solid healthy
            excellent: "bg-green-700/30",    // top tier
          };

          // First range starts from leftPadding, others start at current boundary
          const rangeMin = i === 0 ? leftPadding : currBoundary;
          const rangeMax = nextBoundary;

          return {
            label,
            min: rangeMin,
            max: rangeMax,
            // store also the canonical boundary for tick labeling if needed
            boundary: currBoundary,
            color: colors[label] ?? "bg-gray-500/30",
          };
        });

    // Tick values: show the canonical boundaries (the original values) so last high is visible
    const tickValues = sortedValues.slice(); // e.g. [20,50,100]

    // overall scale
    const minVal = Math.min(...sortedValues);
    const maxVal = Math.max(...sortedValues);
    const padding = (maxVal - minVal) * 0.2;

    let overallMin = minVal - padding;
    let overallMax = maxVal + padding;

    // Round based on magnitude
    const isDecimal = overallMax <= 1;
    if (isDecimal) {
      // round to hundredth
      overallMin = Math.max(0, Math.round(overallMin * 100) / 100);
      overallMax = Math.round(overallMax * 100) / 100;
    } else {
      // whole numbers
      overallMin = Math.max(0, Math.floor(overallMin));
      overallMax = Math.ceil(overallMax);
    }

    return (
      <MetricGauge
        key={field} // ← Add this
        label={field}
        value={Number(fitnessTest[field as keyof typeof fitnessTest])}
        onChange={(val) => handleChange("fitness", field, String(val))}
        ranges={ranges}
        minValue={overallMin}
        maxValue={overallMax}
        ticks={tickValues}
        description={metricData.description}
        tableData={{
          male: metricData.male,
          female: metricData.female,
        }}
        expandedMetric={expandedMetric}
        setExpandedMetric={setExpandedMetric}
      />
    );
  };
  // 1️⃣ Create a render function for body metrics
  const renderSkinfold = (field: string) => {
      const metricData = fitnessMetadata[field as keyof typeof fitnessMetadata];
      if (!metricData) return null;

      // get base numeric values for the chosen client (e.g., { low:20, healthy:50, high:100 })
      const rangesObj = getRangesForMetric(field, clientGender, Number(clientAge)) || {};
      const sortedLabels = Object.keys(rangesObj);                // ["low","healthy","high"]
      const sortedValues = sortedLabels.map((label) => rangesObj[label as keyof typeof rangesObj] ?? 0); // [20,50,100]

      if (sortedValues.length === 0) {
        // fallback single empty range
        return null;
      }

      // padding for visual breathing room
      const leftPadding = Math.max(sortedValues[0] - 20, 0);
      const rightPadding = sortedValues[sortedValues.length - 1] + 20;

      // last range extends to rightPadding
      const ranges = sortedLabels.map((label, i) => {
        const currBoundary = sortedValues[i];
        const nextBoundary = i < sortedLabels.length - 1 ? sortedValues[i + 1] : rightPadding;

        const colors: Record<string, string> = {
          low: "bg-red-500/30",       // very low / risky
          poor: "bg-red-400/30",      // slightly better than low, still bad
          healthy: "bg-green-500/30", // normal healthy range
          average: "bg-yellow-400/30",// middle-of-the-road, not bad
          overweight: "bg-yellow-500/30",// slightly above healthy
          good: "bg-green-600/30",    // solid healthy
          obese: "bg-red-600/30",      // too high, risky
        };

        // First range starts from leftPadding, others start at current boundary
        const rangeMin = i === 0 ? leftPadding : currBoundary;
        const rangeMax = nextBoundary;

        return {
          label,
          min: rangeMin,
          max: rangeMax,
          // store also the canonical boundary for tick labeling if needed
          boundary: currBoundary,
          color: colors[label] ?? "bg-gray-500/30",
        };
      });

      // Tick values: show the canonical boundaries (the original values) so last high is visible
      const tickValues = sortedValues.slice(); // e.g. [20,50,100]

      // overall scale
      const minVal = Math.min(...sortedValues);
      const maxVal = Math.max(...sortedValues);
      const padding = (maxVal - minVal) * 0.2;

      let overallMin = minVal - padding;
      let overallMax = maxVal + padding;

      // Round based on magnitude
      const isDecimal = overallMax <= 1;
      if (isDecimal) {
        // round to hundredth
        overallMin = Math.max(0, Math.round(overallMin * 100) / 100);
        overallMax = Math.round(overallMax * 100) / 100;
      } else {
        // whole numbers
        overallMin = Math.max(0, Math.floor(overallMin));
        overallMax = Math.ceil(overallMax);
      }

      return (
        <MetricGauge
          key={field} // ← Add this
          label={field}
          value={Number(skinfolds[field as keyof typeof skinfolds])}
          onChange={(val) => handleChange("skinfold", field, String(val))}
          ranges={ranges}
          minValue={overallMin}
          maxValue={overallMax}
          ticks={tickValues}
          description={metricData.description}
          tableData={{
            male: metricData.male,
            female: metricData.female,
          }}
          expandedMetric={expandedMetric}
          setExpandedMetric={setExpandedMetric}
        />
      );
    };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Metrics for {clientName}</h1>
      {/* Info line */}
      <div className="text-base text-gray-400 mb-6">
        Using ranges for Gender: {clientGender}, Age: {clientAgeStr || "Unknown"}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Health Metrics */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2">📊 Health Metrics</h2>
          <div className="flex flex-col gap-3">
            {["resting_hr", "max_hr", "vo2max", "hrv_ms", "systolic_bp", "diastolic_bp"].map(
              renderHealthMetric
            )}
          </div>
        </section>

        {/* Body Measurements */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2">⚖️ Body Measurements</h2>
          <div className="flex flex-col gap-3">
            {[
              "weight_kg",
              "height_cm",
              "bmi",
              "waist_cm",
              "hip_cm",
              "waist_to_height_ratio",
              "body_fat_percentage",
            ].map(renderBodyMetric)}
          </div>
        </section>

        {/* Fitness Tests */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2">Fitness Tests</h2>
          <div className="flex flex-col gap-3">
            {[
              "sit_and_reach_cm",
              "hand_dynamometer_kg",
              "plank_hold_seconds",
              "wall_sit_seconds",
              "balance_test_seconds",
              "push_ups_test",
              "sit_ups_test",
              "pull_ups_test",
              "bench_press_1rm_kg",
              "leg_press_1rm_kg",
            ].map(renderFitnessTests)}
          </div>
        </section>

        {/* Body Fat Skinfolds */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2">🩺 Body Fat Skinfolds</h2>
          <div className="flex flex-col gap-3">
            {["chest", "abdomen", "thigh", "triceps", "subscapular", "midaxillary", "biceps", "calf", "suprailiac"].map(
              renderSkinfold
            )}
          </div>
        </section>


        <div className="flex justify-between mt-4">
          {/* Submit button */}
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit Metrics
          </button>

          {/* Send button */}
          {/* <button
            type="button"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSendMetrics}
          >
            Send Metrics
          </button> */}
        </div>

      </form>
    </div>
  );
}

interface MetricGaugeProps {
  label: string;
  value: number;
  onChange?: (val: number) => void;
  ranges?: { min: number; max: number; color: string }[];
  minValue: number;
  maxValue: number;
  ticks?: number[];
  description?: string;
  tableData?: {
    [gender: string]: {
      [ageRange: string]: {
        [metric: string]: number;
      };
    };
  };
  expandedMetric?: string | null;
  setExpandedMetric?: (metric: string | null) => void;
}
const MetricGauge: React.FC<MetricGaugeProps> = ({
  label,
  value,
  onChange,
  ranges,
  minValue,
  maxValue,
  ticks = [],
  description,
  tableData,
  expandedMetric,
  setExpandedMetric,
}) => {
  const calculateMarkerPosition = () => {
    const num = Number(value);
    if (!num && num !== 0) return 0;
    const pct = ((num - minValue) / (maxValue - minValue)) * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  const toPct = (abs: number) => ((abs - minValue) / (maxValue - minValue)) * 100;

  const labelColors: Record<string, string> = {};
  ranges?.forEach((r) => {
    // e.g., use min-max as key
    const key = `${r.min}-${r.max}`;
    labelColors[key] = r.color;
  });

  const formattedLabel = label.replace(/_/g, " ").toUpperCase();

  return (
    <div className="flex flex-col gap-6 w-full p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex items-center gap-6 w-full">
        {/* Input Section */}
        <div className="flex flex-col w-1/2 gap-2">
          <label className="text-sm font-semibold text-gray-300 tracking-wide">
            {formattedLabel}
          </label>
            <input
              type="number"
              step="any"
              value={value ?? ""}
              onChange={(e) => onChange?.(Number(e.target.value))} // safe call with optional chaining
              className="px-4 py-3 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              placeholder="Enter value..."
            />
        </div>

        {/* Gauge Section */}
        <div className="flex flex-col w-1/2 self-end"> {/* <-- self-end lowers the gauge */}
          {/* Gauge Bar */}
          <div className="relative h-8 w-full rounded-lg bg-gray-800/80 overflow-hidden shadow-inner border border-gray-700/50">
            {/* Colored ranges */}
            {ranges?.map((r) => {
              const left = toPct(r.min);
              const width = toPct(r.max) - toPct(r.min);
              return (
                <div
                  key={`${r.min}-${r.max}`} // safer key if label is not present
                  className={`${r.color} absolute top-0 h-full transition-all duration-300`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}

            {/* Marker for current value */}
            <div
              className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-300 z-10"
              style={{ left: `${calculateMarkerPosition()}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
            </div>

            {/* Vertical tick lines */}
            {ticks.map((t, i) => {
              const left = toPct(t);
              return (
                <div
                  key={`tick-${i}`}
                  className="absolute top-0 h-full w-px bg-white/20"
                  style={{ left: `${left}%` }}
                />
              );
            })}
            <div className="absolute top-0 h-full w-px bg-white/20" style={{ right: 0 }} />
          </div>

          {/* Tick labels */}
          <div className="relative w-full h-4">
            {ticks.map((t, i) => (
              <span
                key={`tick-label-${i}`}
                className="absolute text-sm font-medium text-gray-200"
                style={{ left: `${toPct(t)}%`, transform: "translateX(-50%)" }}
              >
                {t}
              </span>
            ))}
            <span className="absolute text-sm font-medium text-gray-200 right-0">
              {maxValue}
            </span>
          </div>
        </div>
      </div>

      {/* Dropdown Details Section */}
      {description && (
        <div className="border-t border-gray-700 pt-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
            onClick={() => setExpandedMetric && setExpandedMetric(expandedMetric === label ? null : label)}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${expandedMetric === label ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {expandedMetric === label ? "Hide Details" : "Show Details"}
          </button>

          {expandedMetric === label && tableData && (
            <div className="bg-gray-950/50 p-5 rounded-lg mt-4 border border-gray-700/50 backdrop-blur-sm animate-fadeIn">
              <p className="mb-4 text-sm text-gray-300 leading-relaxed">{description}</p>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-800/80">
                      <th className="border-b border-r border-gray-700 px-4 py-3 text-left font-semibold text-gray-300">Gender</th>
                      <th className="border-b border-r border-gray-700 px-4 py-3 text-left font-semibold text-gray-300">Age Range</th>
                      {Object.keys(tableData?.["male"]?.[Object.keys(tableData["male"])[0]] || {}).map((metricKey) => (
                        <th
                          key={metricKey}
                          className={`border-b border-r border-gray-700 px-4 py-3 text-left font-semibold ${labelColors[metricKey]}`}
                        >
                          {metricKey}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(tableData).map(([gender, ageGroups]) =>
                      Object.entries(ageGroups).map(([ageRange, values]) => (
                        <tr key={`${gender}-${ageRange}`} className="hover:bg-gray-800/40 transition-colors duration-150">
                          <td className="border-b border-r border-gray-700/50 px-4 py-3 text-gray-200 capitalize">{gender}</td>
                          <td className="border-b border-r border-gray-700/50 px-4 py-3 text-gray-200">{ageRange}</td>
                          {Object.keys(values).map((metricKey) => (
                            <td
                              key={metricKey}
                              className={`border-b border-r border-gray-700/50 px-4 py-3 ${labelColors[metricKey]}`}
                            >
                              {values[metricKey] ?? "-"}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Page() {
  return (
  <Suspense fallback={
      <div className="flex flex-col h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-gray-500 text-6xl mb-4">🤖</div>
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <MetricsContent />
    </Suspense>
  )
}