import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { NavLink } from "@/components/navlink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clint Wang",
  description: "Graphics | Systems | Mathematics | Art",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <header className="absolute top-0 left-0 w-full py-4 pt-8 z-10 px-4 sm:px-8 lg:px-32">
      <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <NavLink href="/" text="Home" />
        <NavLink href="/about" text="About" right />
      </nav>
    </header>
    <main>{children}</main>
    </body>
    </html>
  );
}
