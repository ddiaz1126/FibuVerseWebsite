"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface HeaderProps {
  logoSrc: string | StaticImageData;
}

const Header: React.FC<HeaderProps> = ({ logoSrc }) => {
  return (
    <header className="bg-black text-white flex items-center px-8 py-4 shadow-md">
      {/* Logo + Brand */}
      <Link href="/" className="flex items-center space-x-3">
        <Image src={logoSrc} alt="FibuVerse Logo" width={40} height={40} />
        <span className="text-xl font-bold">FibuVerse</span>
      </Link>

      {/* Optional right side nav (if needed in future) */}
      <nav className="ml-auto hidden md:flex space-x-6">
        <a href="/fibu" className="hover:text-gray-400">Fibu</a>
        <a href="/documents" className="hover:text-gray-400">Documents</a>
        <a href="/developerlogin" className="hover:text-gray-400">Developer Portal</a>
        <a href="/trainerlogin" className="hover:text-gray-400">Trainer Portal</a>
      </nav>
    </header>
  );
};

export default Header;
