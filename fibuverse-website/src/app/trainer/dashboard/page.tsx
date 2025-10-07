"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTrainerAlerts, getTrainerDashboardMetrics } from "@/api/trainer";
import { RunCompositeResponse, runCompositeAgentFormData } from "@/api/developer";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Trainer {
  user_id: number;
  email: string;
  username: string;
  roles: number[];
}

interface DailyMetric {
  date: string; 
  total: number;
}

interface TrainerMetrics {
  total_clients: number;
  total_workouts_today: number;
  workouts_per_client_daily: Record<string, DailyMetric[]>; // client name → array of daily workouts
  calories_per_client_daily: Record<string, DailyMetric[]>; // client name → array of daily calories
}

interface AlertItem {
  id: number | null;
  time: string;
  alert_message: string;
  icon: string;
}

export interface ResearchPaper {
  title: string;
  authors: string[];               
  date: string;                     
  abstract: string;
  doi?: string;
  pmid?: string;
  pdf_link?: string;
}

interface DayAlerts {
  date: string;
  alerts: AlertItem[];
}

function buildLast7DaysPlaceholders(): DayAlerts[] {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // oldest -> newest
    const dateStr = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }); // e.g. "Tuesday, Sep 23"
    return { date: dateStr, alerts: [] };
  });
}

export default function TrainerDashboard() {
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [metrics, setMetrics] = useState<TrainerMetrics | null>(null); 

  // initialize with placeholders so UI always has 7 days available
  const [dayAlerts, setDayAlerts] = useState<DayAlerts[]>(() =>
    buildLast7DaysPlaceholders()
  );

  const tabsRef = useRef<HTMLDivElement>(null);

  function scrollTabs(amount: number) {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  }

  const [running, setRunning] = useState<boolean>(false);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [activeTab, setActiveTab] = useState<"workouts" | "calories">("workouts");

  // default selected index -> today (newest, index 6)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6);
  const AGENT_ID = 18;
  const DEFAULT_PROMPT = "Fitness";
  const CACHE_KEY = "trainer_agent_papers";
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

  // Add state for the dropdown
  const [selectedCategory, setSelectedCategory] = useState("Fitness");

  // 1. Trainer setup + alerts + metrics
  useEffect(() => {
    const stored = localStorage.getItem("trainer_user");
    if (!stored) {
      router.push("/trainer/login");
      return;
    }
    setTrainer(JSON.parse(stored));

    // fetch alerts
    getTrainerAlerts()
      .then((data: DayAlerts[]) => {
        const placeholders = buildLast7DaysPlaceholders();
        const merged = placeholders.map((ph) => {
          const match = data.find((d) => d.date === ph.date);
          return match || ph;
        });
        setDayAlerts(merged);
        setSelectedDayIndex(0); // select today
      })
      .catch((err) => {
        console.error("Failed to fetch alerts:", err);
      });

    // fetch metrics
    getTrainerDashboardMetrics()
      .then((data: TrainerMetrics) => {
        console.log("Trainer metrics:", data);
        setMetrics(data);
      })
      .catch((err) => {
        console.error("Failed to fetch metrics:", err);
      });
  }, [router]);

  // 2. Auto-run on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed: { papers: ResearchPaper[]; timestamp: number } = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;

        if (parsed.papers.length > 0 && age < CACHE_TTL) {
          setPapers(parsed.papers);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached papers", e);
      }
    }

    const autoRun = async () => {
      try {
        setRunning(true);

        const formData = new FormData();
        formData.append("id", AGENT_ID.toString());
        formData.append("prompt", DEFAULT_PROMPT);

        const res: RunCompositeResponse = await runCompositeAgentFormData(formData);
        const fetchedPapers = (res.outputs?.final_papers as unknown as ResearchPaper[]) || [];

        setPapers(fetchedPapers);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ papers: fetchedPapers, timestamp: Date.now() })
        );
      } catch (err) {
        console.error("Auto run failed:", err);
      } finally {
        setRunning(false);
      }
    };

    autoRun();
  }, [CACHE_TTL, CACHE_KEY, AGENT_ID, DEFAULT_PROMPT]);


    // Refactor your auto-run function to accept a category
  const runResearchWorkflow = async (category: string) => {
    setRunning(true);
    try {
      const formData = new FormData();
      formData.append("id", AGENT_ID.toString()); // same agent, or could vary by category
      formData.append("prompt", category);

      const res: RunCompositeResponse = await runCompositeAgentFormData(formData);
      const fetchedPapers = (res.outputs?.final_papers as unknown as ResearchPaper[]) || [];
      setPapers(fetchedPapers);

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ papers: fetchedPapers, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("Research workflow failed:", err);
    } finally {
      setRunning(false);
    }
  };

  if (!trainer)
    return <div className="p-8 text-white">Loading trainer info...</div>;

  // lightweight icon rendering using emojis (no external package required)
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case "bell":
        return "🔔";
      case "info":
        return "ℹ️";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  // current day's data (always defined because of placeholders)
  const reversedDayAlerts = dayAlerts.slice().reverse();
  const currentDay = reversedDayAlerts[selectedDayIndex];

  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
  ];

    // pick which dataset to show based on tab
  const currentData =
    metrics &&
    (activeTab === "workouts"
      ? metrics.workouts_per_client_daily
      : metrics.calories_per_client_daily);

  if (!currentData) {
    return <p className="text-gray-400">Loading chart...</p>;
  }

  const labels: string[] = Array.from(
    new Set(
      Object.values(currentData).flatMap((daily: DailyMetric[]) =>
        daily.map((d: DailyMetric) => d.date)
      )
    )
  ).sort();

  const datasets = Object.entries(currentData).map(
    ([client, daily]: [string, DailyMetric[]], idx: number) => ({
      label: client,
      data: daily
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d: DailyMetric) => d.total),
      backgroundColor: colors[idx % colors.length],
    })
  );

  return (
<div className="flex-1 p-8 overflow-auto">
  <div className="flex gap-6 max-w-full mx-auto">
    {/* Main dashboard area */}
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-300">
          Welcome, <strong className="text-white">{trainer.username}</strong>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* reduced gap */}
        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center flex-1"> {/* smaller padding */}
          <h2 className="font-semibold text-base mb-2">Total Clients</h2> {/* smaller font, less margin */}
          <p className="text-3xl font-bold text-blue-500"> {/* smaller number */}
            {metrics ? metrics.total_clients : "Loading..."}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center flex-1">
          <h2 className="font-semibold text-base mb-2">Today&apos;s Client Sessions</h2>
          <p className="text-3xl font-bold text-blue-500">
            {metrics ? metrics.total_workouts_today : "Loading..."}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center flex-1">
          <h2 className="font-semibold text-base mb-2">Nutrition</h2>
          <p className="text-sm">Track and suggest nutrition plans.</p> {/* smaller text */}
        </div>
      </div>


      {/* Graph + Articles side by side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Client Activity Graph */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Client Activity</h2>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("workouts")}
              className={`px-4 py-2 rounded ${
                activeTab === "workouts" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              Workouts
            </button>
            <button
              onClick={() => setActiveTab("calories")}
              className={`px-4 py-2 rounded ${
                activeTab === "calories" ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              Calories
            </button>
          </div>
          <div className="w-full h-[500px] bg-gray-900 p-4 rounded shadow">
            <Bar
              data={{
                labels: labels.length ? labels : [""],
                datasets: datasets.length
                  ? datasets
                  : [
                      {
                        label: "No Data",
                        data: [0],
                        backgroundColor: "rgba(200,200,200,0.3)",
                      },
                    ],
              }}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: { legend: { position: "top" } },
                scales: {
                  x: { title: { display: true, text: "Date" } },
                  y: {
                    title: {
                      display: true,
                      text: activeTab === "workouts" ? "Workouts" : "Calories",
                    },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Research Papers */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">FibuScholar&apos;s Latest Finds</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Topic:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategory(value);
                  runResearchWorkflow(value);
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 text-base"
              >
                <option value="Fitness">Fitness</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Cardio">Cardio</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 overflow-auto min-h-[500px]">
            {running ? (
              <p className="text-gray-400">Searching web for papers…</p>
            ) : papers.length === 0 ? (
              <p className="text-gray-400">No papers found.</p>
            ) : (
              papers.slice(0, 3).map((paper, idx) => (
                <div key={idx} className="bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-white font-bold text-sm">{paper.title}</h3>
                  <p className="text-gray-400 text-xs">
                    {Array.isArray(paper.authors)
                      ? paper.authors.slice(0, 3).join(", ")
                      : String(paper.authors)}
                    {Array.isArray(paper.authors) && paper.authors.length > 3 ? " et al." : ""} • {paper.date}
                  </p>
                  <p className="text-gray-300 text-xs mt-2 line-clamp-3">
                    {paper.abstract || "No abstract available."}
                  </p>
                  <div className="flex gap-3 mt-2 text-blue-400 text-xs">
                    {paper.doi && (
                      <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer">
                        DOI
                      </a>
                    )}
                    {paper.pdf_link && (
                      <a href={paper.pdf_link} target="_blank" rel="noreferrer">
                        PDF
                      </a>
                    )}
                    {paper.pmid && (
                      <a href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`} target="_blank" rel="noreferrer">
                        PubMed
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Alerts sidebar */}
    <div className="w-full md:w-1/4 bg-gray-900 p-4 rounded-lg flex flex-col">
      <h2 className="text-xl font-bold mb-4">Alerts</h2>
      {/* Tabs */}
      <div className="relative mb-2 flex items-center">
        <button
          onClick={() => scrollTabs(-100)}
          className="z-10 bg-gray-700 text-white px-1 py-1 rounded hover:bg-gray-600 mr-1 text-sm"
        >
          ◀
        </button>

        <div
          ref={tabsRef}
          className="flex gap-1 overflow-x-auto scrollbar-hide whitespace-nowrap h-12 items-center flex-1"
          style={{ scrollbarWidth: "none" }}
        >
          {dayAlerts.slice().reverse().map((day, idx) => (
            <button
              key={day.date}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-shrink-0 px-2 py-1 rounded text-sm whitespace-nowrap ${
                idx === selectedDayIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {day.date.split(",")[1]?.trim() || day.date}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollTabs(100)}
          className="z-10 bg-gray-700 text-white px-1 py-1 rounded hover:bg-gray-600 ml-1 text-sm"
        >
          ▶
        </button>
      </div>

      <div className="text-gray-300 text-lg font-semibold mb-2 px-2">
        {currentDay ? currentDay.date : "Select a day"}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {currentDay?.alerts?.length === 0 ? (
          <div className="p-3 rounded border-l-4 border-gray-500 bg-gray-800 text-gray-300 text-sm">
            No alerts for {currentDay?.date}
          </div>
        ) : (
          currentDay?.alerts?.map((alert) => (
            <div
              key={alert.id ?? Math.random()}
              className={`p-3 rounded border-l-4 bg-gray-800 ${
                alert.id ? "border-blue-500" : "border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">{alert.time}</span>
                <span className="text-gray-400 text-sm">{renderIcon(alert.icon)}</span>
              </div>
              <p className="text-gray-300 text-sm">{alert.alert_message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
</div>

  );
}
