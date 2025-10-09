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
  { name: "Sandbox", icon: ArrowsRightLeftIcon, href: "/developer/workflow" },
  { name: "Documentation", icon: BookOpenIcon, href: "/developer/docs" },
  { name: "Settings", icon: CogIcon, href: "/developer/settings" },
  { name: "Help", icon: QuestionMarkCircleIcon, href: "/developer/help" },
];

export default function DeveloperSidebar({ collapsed, onToggle }: DeveloperSidebarProps) {
return (
  <aside
    className={`h-screen bg-gray-900 text-white shadow flex flex-col transition-all duration-300 ease-in-out pl-2 ${
      collapsed ? "w-14" : "w-48"
    }`}
  >
    {/* Top: logo + toggle */}
    <div className="flex items-center justify-between p-2 border-b border-gray-800 relative">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-green-400 flex items-center justify-center font-bold text-gray-900 text-sm">
          D
        </div>
        {!collapsed && <span className="font-semibold text-sm">DevPortal</span>}
      </div>

      <button
        onClick={onToggle}
        className="p-2 rounded hover:bg-gray-800 active:bg-gray-700 flex items-center justify-center z-10"
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="w-4 h-4 text-gray-300" />
      </button>
    </div>

    {/* Nav */}
    <nav className="mt-2 flex-1 overflow-y-auto">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Link
            key={it.name}
            href={it.href}
            className={`flex items-center gap-2 px-2 py-2 hover:bg-gray-800 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Icon className="w-4 h-4 text-gray-300" />
            {!collapsed && <span className="text-xs text-gray-100 font-semibold">{it.name}</span>}
          </Link>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="p-2 border-t border-gray-800 text-center">
      {!collapsed ? (
        <div className="text-[10px] text-gray-400">© {new Date().getFullYear()} DevPortal</div>
      ) : (
        <div className="h-4" />
      )}
    </div>
  </aside>
);

}
