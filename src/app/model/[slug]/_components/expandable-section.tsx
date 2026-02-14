"use client";

import { useState } from "react";

type ExpandableSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function ExpandableSection({ title, children }: ExpandableSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 py-1 text-sm font-medium text-muted transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
        {title}
      </button>
      <div
        className="grid transition-all duration-200"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div className="pb-2 pt-1" role="region">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
