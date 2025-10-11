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
import { usePathname } from 'next/navigation';

type TrainerNavbarProps = {
  onMenuToggle?: () => void;
};

export const trainerNavItems = [
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

export default function TrainerNavbar({ onMenuToggle }: TrainerNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        {/* Left: Logo */}
        <div className="hidden sm:flex items-center gap-3 group">
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent to-yellow-500/50 group-hover:to-yellow-500 transition-all duration-300"></div>
          <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase group-hover:text-yellow-400 transition-colors duration-300">
            FibuVerse
          </span>
          <div className="h-0.5 w-24 bg-gradient-to-l from-transparent to-yellow-500/50 group-hover:to-yellow-500 transition-all duration-300"></div>
        </div>

        {/* Center: Navigation Links (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1">
          {trainerNavItems.map((it) => {
            const Icon = it.icon;
            const isActive = pathname === it.href;
            
            return (
              <Link
                key={it.name}
                href={it.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  isActive
                    ? "bg-yellow-400/10 text-yellow-400 border-b-2 border-yellow-400"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-yellow-400" : "text-blue-400"
                  }`}
                />
                <span className="text-xs font-semibold">{it.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-800 active:scale-95 transition-all group"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
        </button>
      </div>
    </nav>
  );
}