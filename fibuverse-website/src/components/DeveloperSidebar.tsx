"use client";

import Link from "next/link";
import { Bars3Icon, CogIcon, QuestionMarkCircleIcon, CubeIcon, ArrowsRightLeftIcon, BookOpenIcon, HomeIcon } from "@heroicons/react/24/outline";

type DeveloperSidebarProps = {
  collapsed: boolean;
  onToggle?: () => void;
};

const items = [
  { name: "Dashboard", icon: HomeIcon, href: "/developer/dashboard" }, // ✅ added dashboard
  { name: "Agents", icon: CubeIcon, href: "/developer/agents" },
  { name: "Workflow", icon: ArrowsRightLeftIcon, href: "/developer/workflow" },
  { name: "Documentation", icon: BookOpenIcon, href: "/developer/docs" },
  { name: "Settings", icon: CogIcon, href: "/developer/settings" },
  { name: "Help", icon: QuestionMarkCircleIcon, href: "/developer/help" },
];

export default function DeveloperSidebar({ collapsed, onToggle }: DeveloperSidebarProps) {
  return (
    <aside
      className={`h-screen bg-gray-900 text-white shadow flex flex-col transition-all duration-200 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top: logo + toggle */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-green-400 flex items-center justify-center font-bold text-gray-900">
            D
          </div>
          {!collapsed && <span className="font-semibold">DevPortal</span>}
        </div>

        <button
          onClick={onToggle}
          className="p-2 rounded hover:bg-gray-800 active:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 overflow-y-auto">
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
              {!collapsed && <span className="text-sm text-gray-100">{it.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        {!collapsed ? (
          <div className="text-xs text-gray-400">© {new Date().getFullYear()} DevPortal</div>
        ) : (
          <div className="h-6" />
        )}
      </div>
    </aside>
  );
}
