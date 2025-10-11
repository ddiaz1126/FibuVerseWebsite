"use client";

import Link from "next/link";
import { Bars3Icon, CogIcon, QuestionMarkCircleIcon, CubeIcon, ArrowsRightLeftIcon, BookOpenIcon, HomeIcon } from "@heroicons/react/24/outline";
import { usePathname } from 'next/navigation';

type DeveloperNavbarProps = {
  onMenuToggle?: () => void;
};

const items = [
  { name: "Dashboard", icon: HomeIcon, href: "/developer/dashboard" },
  { name: "Agents", icon: CubeIcon, href: "/developer/agents" },
  { name: "Sandbox", icon: ArrowsRightLeftIcon, href: "/developer/workflow" },
  { name: "Documentation", icon: BookOpenIcon, href: "/developer/docs" },
  { name: "Settings", icon: CogIcon, href: "/developer/settings" },
  { name: "Help", icon: QuestionMarkCircleIcon, href: "/developer/help" },
];

export default function DeveloperNavbar({ onMenuToggle }: DeveloperNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center font-bold text-gray-900 text-sm shadow-md">
            F
          </div>
          <span className="font-bold text-sm">FibuVerse</span>
        </div>

        {/* Center: Navigation Links (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1">
          {items.map((it) => {
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