"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTrainerAlerts, getTrainerDashboardMetrics, getTrainerProfile } from "@/api/trainer";
import { RunCompositeResponse, runCompositeAgentFormData } from "@/api/developer";
import { Bell, ChevronLeft, ChevronRight, Calendar, Users, MessageSquare, AlertTriangle, Mail, FileText, ExternalLink } from 'lucide-react';
import { TrainerProfile } from "@/api/trainerTypes"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Image from 'next/image';

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
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile | null>(null);
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
  const [activeTab, ] = useState<"workouts" | "calories">("workouts");

  // default selected index -> today (newest, index 6)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6);
  const AGENT_ID = 18;
  const DEFAULT_PROMPT = "Fitness";
  const CACHE_KEY = "trainer_agent_papers";
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

  // Add state for the dropdown
  const [selectedCategory, setSelectedCategory] = useState("Fitness");
  const [showAlerts, setShowAlerts] = useState(true);
  const [expandedPapers, setExpandedPapers] = useState<Set<number>>(new Set());

  // 1. Trainer setup + alerts + metrics
  useEffect(() => {
    const stored = localStorage.getItem("trainer_user");
    if (!stored) {
      router.push("/trainer/login");
      return;
    }
    setTrainer(JSON.parse(stored));

    // fetch trainer profile
    getTrainerProfile()
      .then((data: TrainerProfile) => {
        console.log("Trainer profile:", data);
        setTrainerProfile(data); // Add this state
      })
      .catch((err) => {
        console.error("Failed to fetch trainer profile:", err);
      });

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

    // pick which dataset to show based on tab
  const currentData =
    metrics &&
    (activeTab === "workouts"
      ? metrics.workouts_per_client_daily
      : metrics.calories_per_client_daily);

  if (!currentData) {
    return <p className="text-gray-400">Loading chart...</p>;
  }

  const togglePaper = (idx: number) => {
    setExpandedPapers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  return (
<div className="flex-1 p-2 md:p-4 overflow-auto">
  <div className="flex flex-col lg:flex-row gap-4 max-w-full">
    {/* Main dashboard area */}
    <div className="flex-1 flex flex-col gap-4 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-9 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Dashboard</h1>
        </div>
        
        {/* <div className="hidden sm:flex items-center gap-3 group">
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent to-yellow-500/50 group-hover:to-yellow-500 transition-all duration-300"></div>
          <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase group-hover:text-yellow-400 transition-colors duration-300">
            FibuVerse
          </span>
          <div className="h-0.5 w-24 bg-gradient-to-l from-transparent to-yellow-500/50 group-hover:to-yellow-500 transition-all duration-300"></div>
        </div> */}
        
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300 font-medium">
              Welcome, <strong className="text-white font-bold">{trainer.username}</strong>
            </div>
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              <div className="relative w-16 h-16 overflow-hidden transition-all duration-500 group-hover:rounded-2xl rounded-full border-2 border-white shadow-lg group-hover:scale-125 group-hover:rotate-12">
                <Image 
                  src={trainerProfile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer.username)}&background=F59E0B&color=fff`}
                  alt={trainer.username}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="40px"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 group-hover:scale-150 transition-transform"></div>
            </div>
          </div>
      </div>
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Clients</p>
                <p className="text-2xl font-bold text-blue-400">
                  {metrics ? metrics.total_clients : "..."}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Active members</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Today&apos;s Sessions</p>
                <p className="text-2xl font-bold text-green-400">
                  {metrics ? metrics.total_workouts_today : "..."}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Completed workouts</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-orange-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">New Messages</p>
                <p className="text-2xl font-bold text-orange-400">0</p>
                <p className="text-[10px] text-gray-500 mt-1">Unread conversations</p>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Pending Client Requests</p>
                <p className="text-2xl font-bold text-purple-400">0</p>
                <p className="text-[10px] text-gray-500 mt-1">Need attention</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* At-Risk Clients - Priority Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-semibold text-red-400">Clients Needing Attention</h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 ml-2">
                  Coming Soon
                </span>
              </div>
              <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1" disabled>
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-8 border-2 border-dashed border-gray-700 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400 mb-1">At-Risk Client Detection</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                This feature will automatically identify clients who need attention based on activity patterns, missed sessions, and engagement metrics.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-[10px] text-gray-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                Work in Progress
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold">Quick Actions</h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                Coming Soon
              </span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              <button className="p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <p className="text-xs font-medium">Bulk Message</p>
                </div>
                <p className="text-[9px] text-gray-400">Send a message to multiple clients</p>
              </button>
              <button className="p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-400" />
                  <p className="text-xs font-medium">Add Client</p>
                </div>
                <p className="text-[9px] text-gray-400">New onboarding</p>
              </button>
              <button className="p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <p className="text-xs font-medium">Check-In Request</p>
                </div>
                <p className="text-[9px] text-gray-400">Request progress updates from clients</p>
              </button>
              <button className="p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <p className="text-xs font-medium">Generate Report</p>
                </div>
                <p className="text-[9px] text-gray-400">Create client progress reports</p>
              </button>
            </div>
          </div>
        </div>

        {/* Graph + Articles side by side */}
        <div className="flex flex-col lg:flex-row gap-3 min-w-0">

        {/* Research Papers */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          {/* Header & Filter */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              FibuScholar&apos;s Latest Finds
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Topic:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategory(value);
                  setExpandedPapers(new Set());
                  runResearchWorkflow(value);
                }}
                className="bg-gray-700/50 text-white px-3 py-1 rounded-lg border border-gray-600 text-xs hover:bg-gray-700 transition-colors"
              >
                <option value="Fitness">Fitness</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Cardio">Cardio</option>
              </select>
            </div>
          </div>

          {/* Papers List */}
          <div className="grid md:grid-cols-3 gap-3">
            {running ? (
              <div className="col-span-3 bg-gray-900/50 rounded-lg p-8 text-center">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-xs">Searching for latest research papers...</p>
              </div>
            ) : papers.length === 0 ? (
              <div className="col-span-3 bg-gray-900/50 rounded-lg p-8 text-center">
                <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-xs">No papers found for this topic.</p>
              </div>
            ) : (
              papers.slice(0, 3).map((paper, idx) => {
                const isExpanded = expandedPapers.has(idx);
                const hasAbstract = paper.abstract && paper.abstract !== "No abstract available.";
                
                return (
                  <div key={idx} className="bg-gray-900/50 rounded-lg p-3 hover:bg-gray-900/70 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[9px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                        {paper.date}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                    
                    <h3 className="text-xs font-medium mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {paper.title}
                    </h3>
                    
                    <p className="text-[9px] text-gray-500 mb-2">
                      {Array.isArray(paper.authors)
                        ? paper.authors.slice(0, 3).join(", ")
                        : String(paper.authors)}
                      {Array.isArray(paper.authors) && paper.authors.length > 3 ? " et al." : ""}
                    </p>
                    
                    {hasAbstract && (
                      <div className="mb-2">
                        <p className={`text-gray-300 text-[10px] ${!isExpanded ? 'line-clamp-2' : ''}`}>
                          {paper.abstract}
                        </p>
                        <button
                          onClick={() => togglePaper(idx)}
                          className="text-[9px] text-purple-400 hover:text-purple-300 mt-1 flex items-center gap-0.5"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                          <ChevronRight className={`w-2.5 h-2.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex gap-2 text-[9px]">
                      {paper.doi && (
                        <a 
                          href={`https://doi.org/${paper.doi}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                        >
                          DOI
                        </a>
                      )}
                      {paper.pdf_link && (
                        <a 
                          href={paper.pdf_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          PDF
                        </a>
                      )}
                      {paper.pmid && (
                        <a 
                          href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                        >
                          PubMed
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Alerts sidebar */}
<>
  {/* Floating Bell Button (shows when collapsed) */}
  {!showAlerts && (
    <button
      onClick={() => setShowAlerts(true)}
      className="fixed top-10 right-4 z-50 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-500/50 transition-all hover:scale-110 animate-pulse"
    >
      <Bell className="w-5 h-5 text-white" />
      {currentDay?.alerts?.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {currentDay.alerts.length}
        </span>
      )}
    </button>
  )}

  {/* Alerts Sidebar with transition */}
  <div
    className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
      showAlerts ? 'w-56 xl:w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden'
    }`}
  >
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-3 flex flex-col min-w-0 h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Activity Feed
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {currentDay?.alerts?.length || 0} alerts
          </span>
          <button
            onClick={() => setShowAlerts(false)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Hide alerts"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative mb-2 flex items-center min-w-0">
        <button
          onClick={() => scrollTabs(-100)}
          className="z-10 bg-gray-700 text-white p-1 rounded hover:bg-gray-600 mr-1 flex-shrink-0 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        <div
          ref={tabsRef}
          className="flex gap-1 overflow-x-auto scrollbar-hide whitespace-nowrap h-9 items-center flex-1 min-w-0"
          style={{ scrollbarWidth: "none" }}
        >
          {dayAlerts.slice().reverse().map((day, idx) => (
            <button
              key={day.date}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                idx === selectedDayIndex
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {day.date.split(",")[1]?.trim() || day.date}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollTabs(100)}
          className="z-10 bg-gray-700 text-white p-1 rounded hover:bg-gray-600 ml-1 flex-shrink-0 transition-colors"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="text-gray-300 text-xs font-medium mb-2 px-1 truncate">
        {currentDay ? currentDay.date : "Select a day"}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
        {currentDay?.alerts?.length === 0 ? (
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700 text-center">
            <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-2" />
            <p className="text-[10px] text-gray-400">No alerts for {currentDay?.date}</p>
          </div>
        ) : (
          currentDay?.alerts?.map((alert) => {
            type AlertColor = 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';

            const getAlertColor = (icon: string): AlertColor => {
              const colorMap: Record<string, AlertColor> = {
                message: 'blue',
                workout: 'green',
                pr: 'yellow',
                streak: 'red',
                metric: 'green',
                program: 'orange',
                anniversary: 'purple'
              };
              return colorMap[icon] || 'blue';
            };

            const colorClasses: Record<AlertColor, string> = {
              blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
              green: 'bg-green-500/10 border-green-500/20 text-green-400',
              yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
              orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
              red: 'bg-red-500/10 border-red-500/20 text-red-400',
              purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            };

            const color = getAlertColor(alert.icon);

            return (
              <div
                key={alert.id ?? Math.random()}
                className={`p-3 rounded-lg border cursor-pointer hover:scale-[1.02] transition-all ${
                  alert.id ? colorClasses[color] : 'bg-gray-900/50 border-gray-700 text-gray-400'
                }`}
              >
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4">
                      {renderIcon(alert.icon)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-medium">{alert.time}</span>
                    </div>
                    <p className="text-[11px] leading-snug break-words">{alert.alert_message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
</>
    </div>
  </div>
);
}