"use client";

import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  HeartIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

return (
  <aside
    className={`h-screen bg-gray-900 text-white shadow-lg flex flex-col transition-all duration-300 ease-in-out ${
      collapsed ? "w-14" : "w-52"
    }`}
  >
  {/* Top: logo + toggle */}
    <div className="flex items-center px-3 py-2 border-b border-gray-800">
      {/* Logo + title */}
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center font-bold text-gray-900 text-xs flex-shrink-0 shadow-md">
          F
        </div>
        {!collapsed && (
          <span className="font-bold text-xs whitespace-nowrap">
            FibuVerse
          </span>
        )}
      </div>

          {/* Toggle button */}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-800 active:scale-95 flex items-center justify-center transition-all duration-200 flex-shrink-0 group"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
            )}
          </button>
      </div>

    {/* Navigation */}
    <nav className="mt-2 flex-1 overflow-y-auto px-2">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = pathname === it.href;
        
        return (
          <Link
            key={it.name}
            href={it.href}
            title={collapsed ? it.name : undefined}
            className={`flex items-center gap-2 px-2 py-2 rounded-md mb-1 transition-all ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "bg-yellow-400/10 text-yellow-400 border-l-2 border-yellow-400"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Icon 
              className={`w-4 h-4 flex-shrink-0 ${
                isActive ? "text-yellow-400" : "text-blue-400"
              }`}
            />
            {!collapsed && (
              <span className="text-xs font-semibold whitespace-nowrap">
                {it.name}
              </span>
            )}
          </Link>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="p-3 border-t border-gray-800 text-center">
      {!collapsed ? (
        <div className="text-[10px] text-gray-400">
          © {new Date().getFullYear()} FibuVerse
        </div>
      ) : (
        <div className="h-4" />
      )}
    </div>
  </aside>
);

}
