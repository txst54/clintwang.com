"use client";
import { Canvas } from "@/components/hero/canvas";
import React from "react";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <Canvas />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-bold mix-blend-difference text-white">
            Clint Wang
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mix-blend-difference text-white pt-2">
            Graphics • Systems • Mathematics • Art
          </h2>
        </div>
      </div>
    </div>
  );
}
