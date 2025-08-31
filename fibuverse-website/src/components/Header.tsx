"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";

interface HeaderProps {
  logoSrc: string | StaticImageData;
}

const Header: React.FC<HeaderProps> = ({ logoSrc }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-black text-white flex items-center justify-between px-6 py-4">
        {/* Hamburger */}
        <button
          className="p-2 hover:bg-gray-800 rounded-md"
          onClick={() => setMenuOpen(true)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src={logoSrc} alt="FibuVerse Logo" width={40} height={40} />
          <span className="text-xl font-bold">FibuVerse</span>
        </div>

        {/* Right Tabs (hidden on mobile if desired) */}
        <nav className="hidden md:flex space-x-6">
          <a href="/fibu" className="hover:text-gray-400">Fibu</a>
          <a href="#" className="hover:text-gray-400">Documents</a>
          <a href="#" className="hover:text-gray-400">Log in</a>
        </nav>
      </header>

      {/* Sidebar overlay */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          {/* Sidebar */}
          <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 p-6 shadow-lg">
            <button
              className="mb-4 text-black"
              onClick={() => setMenuOpen(false)}
            >
              Close
            </button>
            <nav className="flex flex-col space-y-4 text-black">
              <a href="#">Menu Item 1</a>
              <a href="#">Menu Item 2</a>
              <a href="#">Menu Item 3</a>
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

export default Header;
