"use client";

import { usePathname } from "next/navigation";

/** Fades each new page in (owner, 2026-11-25: no fast slide on navigation). Keyed on the full path, because a
 *  Next template alone re-mounts only when its first child segment changes (e.g. not /frameworks -> /frameworks/x).
 *  Query changes (?q=) keep the same key, so typing in search does not flash. */
export function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <div key={usePathname()} className="page-fade">
      {children}
    </div>
  );
}
