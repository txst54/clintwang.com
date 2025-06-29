"use client";
import { usePathname } from "next/navigation";
import React from "react";

export function NavLink({ href, text, right }: { href: string; text: string; right?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <div className={`w-min flex flex-col ${right ? "items-end" : "items-start"}`}>
      <a
        href={href}
        className={`
          flex uppercase transition-colors duration-300
          ${active ? "text-black" : "text-zinc-700"}
          hover:text-black text-sm sm:text-base py-2
        `}
      >
        {text}
      </a>
      {active ? (
        <span className="mt-0 sm:mt-4 h-0 sm:h-0.5 w-full bg-black" />
      ) : null}
    </div>
  );
}
