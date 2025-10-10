import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Courier New", "monospace"],
});

export const metadata: Metadata = {
  title: "Welcome to FibuVerse!",
  description: "An ecosystem of fitness-tech tools to inspire growth, discovery, and transformation.",
  openGraph: {
    title: "Welcome to FibuVerse!",
    description: "An ecosystem of fitness-tech tools to inspire growth, discovery, and transformation.",
    url: "https://www.fibuverse.com",
    siteName: "FibuVerse",
    images: [
      {
        url: "https://www.fibuverse.com/images/logo.png",
        width: 1200,
        height: 630,
        alt: "FibuVerse - Fitness Tech Ecosystem",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome to FibuVerse!",
    description: "An ecosystem of fitness-tech tools to inspire growth, discovery, and transformation.",
    images: ["https://www.fibuverse.com/images/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}