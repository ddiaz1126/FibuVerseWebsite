"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  logoSrc: string | StaticImageData;
}

const Header: React.FC<HeaderProps> = ({ logoSrc }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/developerlogin", label: "Developer Portal" },
    { href: "/trainerlogin", label: "Trainer Portal" },
  ];

return (
  <header className="bg-black text-white flex items-center px-4 py-2 shadow-md relative z-50">
    {/* Logo + Brand */}
    <Link href="/" className="flex items-center space-x-1">
      <Image src={logoSrc} alt="FibuVerse Logo" width={24} height={24} />
      <span className="text-sm font-medium">FibuVerse</span>
    </Link>

    {/* Desktop nav */}
    <nav className="ml-auto hidden md:flex space-x-4 text-xs font-medium">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`hover:text-gray-400 transition-colors ${
            pathname === link.href ? "text-yellow-400 border-b-2 border-yellow-500 pb-0.5" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>

    {/* Mobile hamburger */}
    <button
      className="ml-auto md:hidden p-1.5 rounded-md hover:bg-gray-800 transition"
      onClick={() => setMenuOpen(!menuOpen)}
      aria-label="Toggle Menu"
    >
      <svg
        className="w-5 h-5"
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
            className={`px-4 py-2 text-xs hover:text-yellow-400 transition-colors ${
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
}

export default Header;