"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // for active link

interface HeaderProps {
  logoSrc: string | StaticImageData;
}

const Header: React.FC<HeaderProps> = ({ logoSrc }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // detect current page

  const links = [
    { href: "/about", label: "About" },
    { href: "/documents", label: "Documents" },
    { href: "/developerlogin", label: "Developer Portal" },
    { href: "/trainerlogin", label: "Trainer Portal" },
    { href: "/support", label: "Support" }
  ];

  return (
    <header className="bg-black text-white flex items-center px-6 py-4 md:py-6 shadow-md relative z-50">
      {/* Logo + Brand */}
      <Link href="/" className="flex items-center space-x-3"> 
        <Image src={logoSrc} alt="FibuVerse Logo" width={40} height={40} /> 
        <span className="text-xl font-bold">FibuVerse</span> 
      </Link>

      {/* Desktop nav */}
      <nav className="ml-auto hidden md:flex space-x-8 text-lg font-semibold">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`hover:text-gray-400 transition-colors ${
              pathname === link.href ? "text-yellow-400 border-b-2 border-yellow-500 pb-1" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="ml-auto md:hidden p-2 rounded-md hover:bg-gray-800 transition"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-black flex flex-col md:hidden shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-6 py-4 text-white hover:text-yellow-400 transition-colors ${
                pathname === link.href ? "text-yellow-400" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
