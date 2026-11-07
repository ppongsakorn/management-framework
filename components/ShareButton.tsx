"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { basePath } from "@/lib/site";

type Props = {
  slug: string;
  title: string;
  /** One line shown with the link in the share sheet. */
  text: string;
  /** "share" opens the phone's share sheet (copies the link where there is none), "copy" copies, "icon" is the compact top-bar share button. */
  kind: "share" | "copy" | "icon";
};

/** The desktop page is the canonical address: phones are sent on to the app view by lib/mobile.ts, desktops stay. */
function pageUrl(slug: string) {
  return `${location.origin}${basePath}/frameworks/${slug}/`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure contexts: select a hidden field and copy it.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  }
}

const ICON = {
  share: "M12 3 7.5 7.5l1.4 1.4L11 6.8V15h2V6.8l2.1 2.1 1.4-1.4L12 3zM5 11v9h14v-9h-3v2h1v5H7v-5h1v-2H5z",
  link: "M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-1.5 1.5-1.4-1.4 1.5-1.5a1 1 0 0 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 1 1-4.2-4.2l1.5-1.5 1.4 1.4-1.5 1.5a1 1 0 0 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0z",
};

export function ShareButton({ slug, title, text, kind }: Props) {
  const [canShare, setCanShare] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
    setMounted(true);
    return () => clearTimeout(timer.current);
  }, []);

  function say(m: string) {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 2200);
  }

  async function copy() {
    say((await copyText(pageUrl(slug))) ? "คัดลอกลิงก์แล้ว" : "คัดลอกไม่สำเร็จ ลองกดแชร์แทน");
  }

  async function share() {
    if (!canShare) return copy();
    try {
      await navigator.share({ title, text, url: pageUrl(slug) });
    } catch (e) {
      // The visitor closing the sheet is not an error.
      if ((e as DOMException).name !== "AbortError") await copy();
    }
  }

  // A share button on a device with no share sheet would only duplicate the copy button, so it steps aside.
  if (kind === "share" && !canShare) return null;
  const copying = kind === "copy";
  const sharing = !copying && canShare;
  const label = sharing ? "แชร์" : "คัดลอกลิงก์";
  const icon = sharing ? ICON.share : ICON.link;
  return (
    <>
      <button
        type="button"
        className={`share-btn share-${kind}`}
        onClick={sharing ? share : copy}
        aria-label={kind === "icon" ? `${label} ${title}` : undefined}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d={icon} fill="currentColor" />
        </svg>
        {kind !== "icon" && <span>{label}</span>}
      </button>
      {/* Portalled out of the top bar: its blur filter would otherwise pin a fixed toast to the bar. */}
      {mounted &&
        createPortal(
          <span className={msg ? "share-toast show" : "share-toast"} role="status" aria-live="polite">
            {msg}
          </span>,
          document.body,
        )}
    </>
  );
}
