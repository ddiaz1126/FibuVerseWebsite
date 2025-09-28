"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendHealthMetricsData, sendBodyMeasurementData, sendBodyFatData } from "@/api/trainer";

export default function Page({ metricsData }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = Number(searchParams.get("clientId")) || 1;

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
    }
  };

  const handleSubmit = async () => {
    const payloads: { func: Function; data: any }[] = [
      { func: sendHealthMetricsData, data: healthMetrics },
      { func: sendBodyMeasurementData, data: bodyMeasurements },
      { func: sendBodyFatData, data: skinfolds },
    ];

    const clientPayload = { client_id: clientId };

    try {
      for (const { func, data } of payloads) {
        const hasData = Object.values(data).some(
          (val) => val !== null && val !== undefined && val !== ""
        );
        if (!hasData) continue;

        await func({ ...clientPayload, ...data });
      }

      alert("Metrics sent successfully!");

      // ✅ Go back to clients list
      router.push("/trainer/clients");
    } catch (err) {
      console.error(err);
      alert("Failed to send some metrics.");
    }
  };

  // -------------------- Resting HR Gauge --------------------
  const restingHRRanges = [
    { label: "Bradycardia", min: 0, max: 59, color: "bg-red-500/30" },
    { label: "Normal", min: 60, max: 100, color: "bg-green-500/30" },
    { label: "Tachycardia", min: 101, max: 180, color: "bg-red-500/30" },
  ];

  const calculateMarkerPosition = () => {
    const hr = Number(healthMetrics.resting_hr);
    if (!hr) return 0;
    const min = 0;
    const max = 180;
    const pct = ((hr - min) / (max - min)) * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  const renderHealthMetric = (field: string) => {
  if (field === "resting_hr") {
    return (
      <div key={field} className="flex items-center gap-4 w-full">
        {/* Input: 50% width */}
        <div className="flex flex-col w-1/2">
          <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
          <input
            type="number"
            step="any"
            value={healthMetrics.resting_hr}
            onChange={(e) => handleChange("health", field, e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Gauge: 50% width */}
        <div className="flex flex-col w-1/2">
          {/* Current value */}
          <div className="mt-1 text-white text-sm">
            Current Resting HR: {healthMetrics.resting_hr || "-"} bpm
          </div>
          <div className="relative h-4 w-full rounded bg-gray-700">
            {restingHRRanges.map((range) => {
              const left = (range.min / 180) * 100;
              const width = ((range.max - range.min) / 180) * 100;
              return (
                <div
                  key={range.label}
                  className={`${range.color} absolute top-0 h-4`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}
            {/* Marker */}
            <div
              className="absolute top-0 h-4 w-0.5 bg-white"
              style={{ left: `${calculateMarkerPosition()}%` }}
            />
          </div>

          {/* Range labels under the gauge */}
          <div className="relative w-full mt-1 h-4">
            {restingHRRanges.map((range) => {
              const left = (range.min / 180) * 100;
              return (
                <span
                  key={range.label}
                  className="absolute text-xs text-white -top-0"
                  style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                >
                  {range.min}
                </span>
              );
            })}
            <span className="absolute text-xs text-white -top-0 right-0">180</span>
          </div>
        </div>
      </div>
    );
  }
    if (field === "max_hr") {
      const maxHRRanges = [
        { label: "Low", min: 0, max: 139, color: "bg-red-500/30" },
        { label: "Normal", min: 140, max: 190, color: "bg-green-500/30" },
        { label: "High", min: 191, max: 220, color: "bg-red-500/30" },
      ];

      const calculateMaxHRPosition = () => {
        const hr = Number(healthMetrics.max_hr);
        if (!hr) return 0;
        const min = 0;
        const max = 220;
        const pct = ((hr - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input: 50% width */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={healthMetrics.max_hr}
              onChange={(e) => handleChange("health", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge: 50% width */}
          <div className="flex flex-col w-1/2">
            {/* Current value */}
            <div className="mt-1 text-white text-sm">
              Current Max HR: {healthMetrics.max_hr || "-"} bpm
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {maxHRRanges.map((range) => {
                const left = (range.min / 220) * 100;
                const width = ((range.max - range.min) / 220) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              {/* Marker */}
              <div
                className="absolute top-0 h-4 w-0.5 bg-white"
                style={{ left: `${calculateMaxHRPosition()}%` }}
              />
            </div>

            {/* Range labels under the gauge */}
            <div className="relative w-full mt-1 h-4">
              {maxHRRanges.map((range) => {
                const left = (range.min / 220) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              {/* Max value label */}
              <span className="absolute text-xs text-white -top-0 right-0">220</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "vo2max") {
      const vo2Ranges = [
        { label: "Poor", min: 0, max: 34, color: "bg-red-500/30" },
        { label: "Average", min: 35, max: 44, color: "bg-yellow-500/30" },
        { label: "Good", min: 45, max: 54, color: "bg-green-500/30" },
        { label: "Excellent", min: 55, max: 70, color: "bg-blue-500/30" },
      ];

      const calculateVO2Position = () => {
        const value = Number(healthMetrics.vo2max);
        if (!value) return 0;
        const min = 0;
        const max = 70;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={healthMetrics.vo2max}
              onChange={(e) => handleChange("health", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge */}
          <div className="flex flex-col w-1/2">
            {/* Current value */}
            <div className="mt-1 text-white text-sm">
              Current VO₂ Max: {healthMetrics.vo2max || "-"} mL/kg/min
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {vo2Ranges.map((range) => {
                const left = (range.min / 70) * 100;
                const width = ((range.max - range.min) / 70) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              {/* Marker */}
              <div
                className="absolute top-0 h-4 w-0.5 bg-white"
                style={{ left: `${calculateVO2Position()}%` }}
              />
            </div>

            {/* Range labels under the gauge */}
            <div className="relative w-full mt-1 h-4">
              {vo2Ranges.map((range) => {
                const left = (range.min / 70) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              {/* Max value label */}
              <span className="absolute text-xs text-white -top-0 right-0">70</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "hrv_ms") {
      const hrvRanges = [
        { label: "Low", min: 0, max: 50, color: "bg-red-500/30" },
        { label: "Normal", min: 51, max: 100, color: "bg-green-500/30" },
        { label: "High", min: 101, max: 200, color: "bg-blue-500/30" },
      ];

      const calculateHRVPosition = () => {
        const value = Number(healthMetrics.hrv_ms);
        if (!value) return 0;
        const min = 0;
        const max = 200;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={healthMetrics.hrv_ms}
              onChange={(e) => handleChange("health", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge */}
          <div className="flex flex-col w-1/2">
            {/* Current value */}
            <div className="mt-1 text-white text-sm">
              Current HRV: {healthMetrics.hrv_ms || "-"} ms
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {hrvRanges.map((range) => {
                const left = (range.min / 200) * 100;
                const width = ((range.max - range.min) / 200) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              {/* Marker */}
              <div
                className="absolute top-0 h-4 w-0.5 bg-white"
                style={{ left: `${calculateHRVPosition()}%` }}
              />
            </div>

            {/* Range labels under the gauge */}
            <div className="relative w-full mt-1 h-4">
              {hrvRanges.map((range) => {
                const left = (range.min / 200) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              {/* Max value label */}
              <span className="absolute text-xs text-white -top-0 right-0">200</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "systolic_bp") {
      const sysRanges = [
        { label: "Low", min: 0, max: 90, color: "bg-red-500/30" },
        { label: "Normal", min: 91, max: 120, color: "bg-green-500/30" },
        { label: "Elevated", min: 121, max: 129, color: "bg-yellow-500/30" },
        { label: "High", min: 130, max: 180, color: "bg-red-500/30" },
      ];

      const calculateSysPosition = () => {
        const value = Number(healthMetrics.systolic_bp);
        if (!value) return 0;
        const min = 0;
        const max = 180;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={healthMetrics.systolic_bp}
              onChange={(e) => handleChange("health", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current Systolic BP: {healthMetrics.systolic_bp || "-"} mmHg
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {sysRanges.map((range) => {
                const left = (range.min / 180) * 100;
                const width = ((range.max - range.min) / 180) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              {/* Marker */}
              <div
                className="absolute top-0 h-4 w-0.5 bg-white"
                style={{ left: `${calculateSysPosition()}%` }}
              />
            </div>

            {/* Range labels under the gauge */}
            <div className="relative w-full mt-1 h-4">
              {sysRanges.map((range) => {
                const left = (range.min / 180) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              {/* Max value label */}
              <span className="absolute text-xs text-white -top-0 right-0">180</span>
            </div>
          </div>
        </div>
      );
    }

    if (field === "diastolic_bp") {
      const diaRanges = [
        { label: "Low", min: 0, max: 60, color: "bg-red-500/30" },
        { label: "Normal", min: 61, max: 80, color: "bg-green-500/30" },
        { label: "High", min: 81, max: 90, color: "bg-yellow-500/30" },
        { label: "Hypertension", min: 91, max: 120, color: "bg-red-500/30" },
      ];

      const calculateDiaPosition = () => {
        const value = Number(healthMetrics.diastolic_bp);
        if (!value) return 0;
        const min = 0;
        const max = 120;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={healthMetrics.diastolic_bp}
              onChange={(e) => handleChange("health", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current Diastolic BP: {healthMetrics.diastolic_bp || "-"} mmHg
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {diaRanges.map((range) => {
                const left = (range.min / 120) * 100;
                const width = ((range.max - range.min) / 120) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}

              {/* Marker */}
              <div
                className="absolute top-0 h-4 w-0.5 bg-white"
                style={{ left: `${calculateDiaPosition()}%` }}
              />
            </div>

            {/* Range labels under the gauge */}
            <div className="relative w-full mt-1 h-4">
              {diaRanges.map((range) => {
                const left = (range.min / 120) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              {/* Max value label */}
              <span className="absolute text-xs text-white -top-0 right-0">120</span>
            </div>
          </div>
        </div>
      );
    }    
    // Other health metrics
    return (
      <div key={field} className="flex flex-col">
        <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
        <input
          type="number"
          step="any"
          value={healthMetrics[field as keyof typeof healthMetrics]}
          onChange={(e) => handleChange("health", field, e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>
    );
  };
  // 1️⃣ Create a render function for body metrics
  const renderBodyMetric = (field: string) => {
    if (field === "weight_kg") {
      const weightRanges = [
        { label: "Underweight", min: 0, max: 60, color: "bg-blue-500/30" },
        { label: "Normal", min: 61, max: 80, color: "bg-green-500/30" },
        { label: "Overweight", min: 81, max: 100, color: "bg-yellow-500/30" },
        { label: "Obese", min: 101, max: 150, color: "bg-red-500/30" },
      ];

      const calculateWeightPosition = () => {
        const value = Number(bodyMeasurements.weight_kg);
        if (!value) return 0;
        const min = 0;
        const max = 150;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={bodyMeasurements.weight_kg}
              onChange={(e) => handleChange("body", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dot-on-line gauge with ranges */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current Weight: {bodyMeasurements.weight_kg || "-"} kg
            </div>

            <div className="relative h-4 w-full rounded bg-gray-700">
              {/* Ranges */}
              {weightRanges.map((range) => {
                const left = (range.min / 150) * 100;
                const width = ((range.max - range.min) / 150) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}

              {/* Dot */}
              <div
                className="absolute top-0.5 h-3 w-3 bg-white rounded-full -translate-x-1/2"
                style={{ left: `${calculateWeightPosition()}%` }}
              />
            </div>

            {/* Range labels above the gauge */}
            <div className="relative w-full mt-1 h-4">
              {weightRanges.map((range) => {
                const left = (range.min / 150) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              {/* Max value label */}
              <span className="absolute text-xs text-white -top-0 right-0">150</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "height_cm") {
      const heightRanges = [
        { label: "Short", min: 140, max: 160, color: "bg-blue-500/30" },
        { label: "Average", min: 161, max: 180, color: "bg-green-500/30" },
        { label: "Tall", min: 181, max: 210, color: "bg-yellow-500/30" },
      ];

      const calculateHeightPosition = () => {
        const value = Number(bodyMeasurements.height_cm);
        if (!value) return 0;
        const min = 140;
        const max = 210;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={bodyMeasurements.height_cm}
              onChange={(e) => handleChange("body", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dot-on-line gauge with ranges */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current Height: {bodyMeasurements.height_cm || "-"} cm
            </div>

            <div className="relative h-4 w-full rounded bg-gray-700">
              {/* Ranges */}
              {heightRanges.map((range) => {
                const left = ((range.min - 140) / (210 - 140)) * 100;
                const width = ((range.max - range.min) / (210 - 140)) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}

              {/* Dot */}
              <div
                className="absolute top-0.5 h-3 w-3 bg-white rounded-full -translate-x-1/2"
                style={{ left: `${calculateHeightPosition()}%` }}
              />
            </div>

            {/* Range labels above the gauge */}
            <div className="relative w-full mt-1 h-4">
              {heightRanges.map((range) => {
                const left = ((range.min - 140) / (210 - 140)) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              {/* Max value label */}
              <span className="absolute text-xs text-white -top-0 right-0">210</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "bmi") {
      const bmiRanges = [
        { label: "Underweight", min: 0, max: 18.5, color: "bg-blue-500/30" },
        { label: "Normal", min: 18.6, max: 24.9, color: "bg-green-500/30" },
        { label: "Overweight", min: 25, max: 29.9, color: "bg-yellow-500/30" },
        { label: "Obese", min: 30, max: 50, color: "bg-red-500/30" },
      ];

      const calculateBMIPosition = () => {
        const value = Number(bodyMeasurements.bmi);
        if (!value) return 0;
        const min = 0;
        const max = 50;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={bodyMeasurements.bmi}
              onChange={(e) => handleChange("body", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dot-on-line gauge with ranges */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current BMI: {bodyMeasurements.bmi || "-"}
            </div>

            <div className="relative h-4 w-full rounded bg-gray-700">
              {/* Ranges */}
              {bmiRanges.map((range) => {
                const left = (range.min / 50) * 100;
                const width = ((range.max - range.min) / 50) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}

              {/* Dot */}
              <div
                className="absolute top-0.5 h-3 w-3 bg-white rounded-full -translate-x-1/2"
                style={{ left: `${calculateBMIPosition()}%` }}
              />
            </div>

            {/* Range labels above the gauge */}
            <div className="relative w-full mt-1 h-4">
              {bmiRanges.map((range) => {
                const left = (range.min / 50) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              {/* Max value label */}
              <span className="absolute text-xs text-white -top-0 right-0">50</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "waist_cm") {
      const waistRanges = [
        { label: "Low", min: 0, max: 70, color: "bg-blue-500/30" },
        { label: "Normal", min: 71, max: 94, color: "bg-green-500/30" },
        { label: "High", min: 95, max: 110, color: "bg-yellow-500/30" },
        { label: "Very High", min: 111, max: 150, color: "bg-red-500/30" },
      ];

      const calculateWaistPosition = () => {
        const value = Number(bodyMeasurements.waist_cm);
        if (!value) return 0;
        const min = 0;
        const max = 150;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={bodyMeasurements.waist_cm}
              onChange={(e) => handleChange("body", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current Waist: {bodyMeasurements.waist_cm || "-"} cm
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {waistRanges.map((range) => {
                const left = (range.min / 150) * 100;
                const width = ((range.max - range.min) / 150) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              {/* Dot */}
              <div
                className="absolute top-0.5 h-3 w-3 bg-white rounded-full -translate-x-1/2"
                style={{ left: `${calculateWaistPosition()}%` }}
              />
            </div>

            {/* Labels */}
            <div className="relative w-full mt-1 h-4">
              {waistRanges.map((range) => {
                const left = (range.min / 150) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              <span className="absolute text-xs text-white -top-0 right-0">150</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "hip_cm") {
      const hipRanges = [
        { label: "Low", min: 0, max: 80, color: "bg-blue-500/30" },
        { label: "Normal", min: 81, max: 100, color: "bg-green-500/30" },
        { label: "High", min: 101, max: 120, color: "bg-yellow-500/30" },
        { label: "Very High", min: 121, max: 150, color: "bg-red-500/30" },
      ];

      const calculateHipPosition = () => {
        const value = Number(bodyMeasurements.hip_cm);
        if (!value) return 0;
        const min = 0;
        const max = 150;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={bodyMeasurements.hip_cm}
              onChange={(e) => handleChange("body", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current Hip: {bodyMeasurements.hip_cm || "-"} cm
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {hipRanges.map((range) => {
                const left = (range.min / 150) * 100;
                const width = ((range.max - range.min) / 150) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              {/* Dot */}
              <div
                className="absolute top-0.5 h-3 w-3 bg-white rounded-full -translate-x-1/2"
                style={{ left: `${calculateHipPosition()}%` }}
              />
            </div>

            {/* Labels */}
            <div className="relative w-full mt-1 h-4">
              {hipRanges.map((range) => {
                const left = (range.min / 150) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              <span className="absolute text-xs text-white -top-0 right-0">150</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "waist_to_height_ratio") {
      const whrRanges = [
        { label: "Low", min: 0, max: 0.42, color: "bg-blue-500/30" },
        { label: "Healthy", min: 0.43, max: 0.50, color: "bg-green-500/30" },
        { label: "High", min: 0.51, max: 0.57, color: "bg-yellow-500/30" },
        { label: "Very High", min: 0.58, max: 1, color: "bg-red-500/30" },
      ];

      const calculateWHRPosition = () => {
        const value = Number(bodyMeasurements.waist_to_height_ratio);
        if (!value) return 0;
        const min = 0;
        const max = 1;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={bodyMeasurements.waist_to_height_ratio}
              onChange={(e) => handleChange("body", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current WHR: {bodyMeasurements.waist_to_height_ratio || "-"}
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {whrRanges.map((range) => {
                const left = (range.min / 1) * 100;
                const width = ((range.max - range.min) / 1) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              {/* Dot */}
              <div
                className="absolute top-0.5 h-3 w-3 bg-white rounded-full -translate-x-1/2"
                style={{ left: `${calculateWHRPosition()}%` }}
              />
            </div>

            {/* Labels */}
            <div className="relative w-full mt-1 h-4">
              {whrRanges.map((range) => {
                const left = (range.min / 1) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min.toFixed(2)}
                  </span>
                );
              })}
              <span className="absolute text-xs text-white -top-0 right-0">1</span>
            </div>
          </div>
        </div>
      );
    }
    if (field === "body_fat_percentage") {
      const bfRanges = [
        { label: "Low", min: 0, max: 10, color: "bg-blue-500/30" },
        { label: "Healthy", min: 11, max: 20, color: "bg-green-500/30" },
        { label: "Overfat", min: 21, max: 30, color: "bg-yellow-500/30" },
        { label: "Obese", min: 31, max: 50, color: "bg-red-500/30" },
      ];

      const calculateBFPosition = () => {
        const value = Number(bodyMeasurements.body_fat_percentage);
        if (!value) return 0;
        const min = 0;
        const max = 50;
        const pct = ((value - min) / (max - min)) * 100;
        return Math.min(Math.max(pct, 0), 100);
      };

      return (
        <div key={field} className="flex items-center gap-4 w-full">
          {/* Input */}
          <div className="flex flex-col w-1/2">
            <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="number"
              step="any"
              value={bodyMeasurements.body_fat_percentage}
              onChange={(e) => handleChange("body", field, e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gauge */}
          <div className="flex flex-col w-1/2">
            <div className="mt-1 text-white text-sm">
              Current Body Fat: {bodyMeasurements.body_fat_percentage || "-"} %
            </div>
            <div className="relative h-4 w-full rounded bg-gray-700">
              {bfRanges.map((range) => {
                const left = (range.min / 50) * 100;
                const width = ((range.max - range.min) / 50) * 100;
                return (
                  <div
                    key={range.label}
                    className={`${range.color} absolute top-0 h-4`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              {/* Dot */}
              <div
                className="absolute top-0.5 h-3 w-3 bg-white rounded-full -translate-x-1/2"
                style={{ left: `${calculateBFPosition()}%` }}
              />
            </div>

            {/* Labels */}
            <div className="relative w-full mt-1 h-4">
              {bfRanges.map((range) => {
                const left = (range.min / 50) * 100;
                return (
                  <span
                    key={range.label}
                    className="absolute text-xs text-white -top-0"
                    style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                  >
                    {range.min}
                  </span>
                );
              })}
              <span className="absolute text-xs text-white -top-0 right-0">50</span>
            </div>
          </div>
        </div>
      );
    }

    // fallback for other body fields
    return (
      <div key={field} className="flex flex-col">
        <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
        <input
          type="number"
          step="any"
          value={bodyMeasurements[field as keyof typeof bodyMeasurements]}
          onChange={(e) => handleChange("body", field, e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>
    );
  };
    const renderSkinfold = (field: string) => {
    // Example ranges in mm, adjust as needed
    const skinfoldRanges = [
      { label: "Low", min: 0, max: 5, color: "bg-blue-500/30" },
      { label: "Normal", min: 6, max: 15, color: "bg-green-500/30" },
      { label: "High", min: 16, max: 25, color: "bg-yellow-500/30" },
      { label: "Very High", min: 26, max: 50, color: "bg-red-500/30" },
    ];

    const calculateSkinfoldPosition = () => {
      const value = Number(skinfolds[field as keyof typeof skinfolds]);
      if (!value) return 0;
      const min = 0;
      const max = 50; // adjust max if needed
      const pct = ((value - min) / (max - min)) * 100;
      return Math.min(Math.max(pct, 0), 100);
    };

    return (
  <div key={field} className="flex items-center gap-4 w-full">
    {/* Label + Input */}
    <div className="flex flex-col w-1/2">
      <label className="mb-1">{field.replace(/_/g, " ").toUpperCase()}</label>
      <input
        type="number"
        step="any"
        value={skinfolds[field as keyof typeof skinfolds]}
        onChange={(e) => handleChange("skinfold", field, e.target.value)}
        className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
      />
    </div>

    {/* Horizontal range bar */}
    <div className="flex flex-col w-1/2">
      <div className="mt-1 text-white text-sm">
        {field.replace(/_/g, " ").toUpperCase()}: {skinfolds[field as keyof typeof skinfolds] || "-"} mm
      </div>
      <div className="relative h-4 w-full rounded bg-gray-700">
        {[
          { label: "Low", min: 0, max: 5, color: "bg-blue-500/30" },
          { label: "Normal", min: 6, max: 15, color: "bg-green-500/30" },
          { label: "High", min: 16, max: 30, color: "bg-red-500/30" },
        ].map((range) => {
          const left = (range.min / 30) * 100;
          const width = ((range.max - range.min) / 30) * 100;
          return (
            <div
              key={range.label}
              className={`${range.color} absolute top-0 h-4`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}

        {/* Marker */}
        <div
          className="absolute top-0 h-4 w-0.5 bg-white"
          style={{
            left: `${(Number(skinfolds[field as keyof typeof skinfolds]) / 30) * 100}%`,
          }}
        />
      </div>

      {/* Labels for each range */}
      <div className="relative w-full mt-1 h-4">
        {[0, 5, 15, 30].map((val) => (
          <span
            key={val}
            className="absolute text-xs text-white -top-0"
            style={{ left: `${(val / 30) * 100}%`, transform: "translateX(-50%)" }}
          >
            {val}
          </span>
        ))}
      </div>
    </div>
  </div>

    );
  };



  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Metrics for Client {clientId}</h1>

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
