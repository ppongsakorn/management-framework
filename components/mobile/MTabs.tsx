"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Segmented control that swaps panels in place, like a native tab strip.
 *  Switching tabs keeps the reader where they are: the strip is sticky, so once it is stuck under the top bar
 *  the page moves to the start of the new panel (strip still in view); above that point the page does not move.
 *  It used to scroll to the very top, which hid the strip behind the header, video and title on every tap.
 *  The position is set after the new panel renders, because the browser's scroll anchoring would otherwise
 *  shift the page by the difference in panel height. */
export function MTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const anchor = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const pending = useRef<{ stuck: boolean; y: number } | null>(null);

  const stickTop = () => (strip.current ? parseFloat(getComputedStyle(strip.current).top) || 0 : 0);

  const select = (id: string) => {
    const a = anchor.current;
    // The anchor marks where the strip would sit if it were not sticky; above the top bar means the strip is stuck.
    if (a) pending.current = { stuck: a.getBoundingClientRect().top <= stickTop() + 1, y: window.scrollY };
    setActive(id);
  };

  useLayoutEffect(() => {
    const p = pending.current, a = anchor.current;
    pending.current = null;
    if (!p || !a) return;
    const top = p.stuck ? window.scrollY + a.getBoundingClientRect().top - stickTop() : p.y;
    window.scrollTo({ top, behavior: "instant" });
  }, [active]);

  return (
    <>
      <div ref={anchor} aria-hidden="true" />
      <div ref={strip} className="m-seg" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <section key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="m-panel">
          {t.content}
        </section>
      ))}
    </>
  );
}
