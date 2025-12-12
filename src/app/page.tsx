import { Canvas } from "@/components/hero/canvas";
import React from "react";
import Posts from "@/util/posts";
import Link from "next/link";

export default function Home() {
  const posts = new Posts().posts;

  return (
    <div className="relative w-full min-h-screen overflow-hidden md:-mt-32">
      {/* <Canvas /> */}

      <div className="w-screen min-h-screen grid grid-cols-1 md:grid-cols-3">
        {/* Hero + Video */}
        <div className="flex flex-col justify-center items-center h-full w-full py-12 order-1 md:order-2">
          <div className="flex flex-col justify-center items-center mb-6 text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mix-blend-difference text-white">
              Clint Wang
            </h1>
            <h2 className="text-xs sm:text-sm md:text-base mt-2 text-zinc-300">
              Graphics • Systems • Mathematics • Art
            </h2>
          </div>

          <div className="border border-black w-11/12 sm:w-3/4 md:w-full aspect-square rounded-lg flex flex-col items-center justify-center">
            <video
              controls={false}
              className="w-11/12 rounded-md"
              autoPlay
              loop
              muted
              playsInline
              name="media"
            >
              <source
                src="http://localhost:3000/assets/bezier_grid_interpolation.webm"
                type="video/webm"
              />
            </video>
          </div>
        </div>

        {/* Posts */}
        <div className="flex flex-col justify-center px-6 py-8 md:px-8 order-2 md:order-1">
          <ul className="space-y-3 sm:space-y-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-black hover:text-zinc-600 text-sm sm:text-base"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column */}
        <div className="hidden md:block md:order-3" />
      </div>

    </div>
  );
}
