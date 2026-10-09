"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** "WebMCP" pill. Lights up when the browser exposes document.modelContext, i.e. an agent could call this page's tools. */
export function WebMcpBadge({ compact }: { compact?: boolean }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const d = document as Document & { modelContext?: unknown };
    const n = navigator as Navigator & { modelContext?: unknown };
    setActive(!!(d.modelContext ?? n.modelContext));
  }, []);
  return (
    <Link
      href="/architecture#webmcp"
      className={`webmcp-badge${active ? " on" : ""}`}
      title={active ? "เบราว์เซอร์นี้รองรับ WebMCP — AI agent เรียกใช้เครื่องมือของหน้านี้ได้ 5 ตัว" : "หน้านี้ลงทะเบียนเครื่องมือตามร่างมาตรฐาน WebMCP สำหรับ AI agent ในเบราว์เซอร์"}
      aria-label="WebMCP"
    >
      <span className="webmcp-dot" aria-hidden="true" />
      <b>WebMCP</b>
      {!compact && <span>{active ? "active · 5 tools" : "ready"}</span>}
    </Link>
  );
}
