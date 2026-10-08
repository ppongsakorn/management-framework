"use client";

import { useEffect, useState } from "react";

/** Example diagram; click to open full screen for presenting. `svg` is repo-owned, pre-rendered markup. */
export function Diagram({ svg, title, group }: { svg: string; title: string; group: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" className="viz" onClick={() => setOpen(true)} aria-label={`ขยายแผนภาพ ${title} เต็มจอ`}>
        <span dangerouslySetInnerHTML={{ __html: svg }} />
      </button>
      <span className="viz-caption">แตะแผนภาพเพื่อขยายเต็มจอสำหรับนำเสนอ</span>
      {open && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={() => setOpen(false)}>
          <div className={`mbox g-${group}`} onClick={(e) => e.stopPropagation()}>
            <div className="mhead">
              <h3>{title}</h3>
              <button type="button" className="mclose" onClick={() => setOpen(false)} aria-label="ปิด" autoFocus>
                ✕
              </button>
            </div>
            <div className="mviz" dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      )}
    </>
  );
}
