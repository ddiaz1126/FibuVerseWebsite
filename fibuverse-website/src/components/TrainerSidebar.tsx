"use client";

import Link from "next/link";
import {
  Bars3Icon,
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  HeartIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

type TrainerSidebarProps = {
  collapsed: boolean;
  onToggle?: () => void;
};

const items = [
  { name: "Dashboard", icon: HomeIcon, href: "/trainer/dashboard" },
  { name: "Messages", icon: ClipboardIcon, href: "/trainer/messages" },
  { name: "Clients", icon: UserGroupIcon, href: "/trainer/clients" },
  { name: "Calendar", icon: CalendarIcon, href: "/trainer/calendar" },
  { name: "Workouts / Programs", icon: ClipboardIcon, href: "/trainer/programs" },
  { name: "Cardio Plans", icon: HeartIcon, href: "/trainer/cardio" },
  { name: "Nutrition Plans", icon: FireIcon, href: "/trainer/nutrition" },
  { name: "Settings", icon: CogIcon, href: "/trainer/settings" },
  { name: "Help", icon: QuestionMarkCircleIcon, href: "/trainer/help" },
];

export default function TrainerSidebar({ collapsed, onToggle }: TrainerSidebarProps) {
  return (
  <aside
    className={`h-screen bg-gray-900 text-white shadow flex flex-col transition-all duration-200 ease-in-out ${
      collapsed ? "w-16" : "w-64"
    }`}
  >
    {/* Top: logo + toggle */}
    <div className="flex items-center justify-between p-3 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-gray-900">
          F
        </div>
        {!collapsed && <span className="font-semibold text-lg">FibuVerse</span>}
      </div>

      <button
        onClick={onToggle}
        className="p-3 rounded hover:bg-gray-800 active:bg-gray-700"
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="w-5 h-5 text-gray-300" />
      </button>
    </div>

    {/* Nav */}
    <nav className="mt-4 flex-1 flex flex-col overflow-y-auto">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Link
            key={it.name}
            href={it.href}
            className={`flex items-center gap-4 px-3 py-3 hover:bg-gray-800 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Icon className="w-5 h-5 text-gray-300" />
            {!collapsed && <span className="text-base text-gray-100">{it.name}</span>}
          </Link>
        );
      })}
      {/* This empty div stretches nav if content is short */}
      <div className="flex-1"></div>
    </nav>

    {/* Footer */}
    <div className="p-3 border-t border-gray-800">
      {!collapsed ? (
        <div className="text-xs text-gray-400">© {new Date().getFullYear()} FibuVerse</div>
      ) : (
        <div className="h-6" />
      )}
    </div>
  </aside>

  );
}
