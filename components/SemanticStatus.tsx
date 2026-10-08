"use client";

import type { SemanticState } from "@/components/useSearch";
import type { LoadProgress } from "@/lib/search/browser";

export function SemanticStatus({ state, progress }: { state: SemanticState; progress: LoadProgress | null }) {
  if (state === "off" || state === "idle") return null;
  if (state === "ready") return <span className="sem ok">ค้นตามความหมาย: พร้อม</span>;
  if (state === "error") return <span className="sem err">ค้นตามความหมายใช้ไม่ได้ในเบราว์เซอร์นี้ — แสดงผลค้นคำแทน</span>;
  const mb = (n: number) => (n / 1e6).toFixed(1);
  return (
    <span className="sem">
      กำลังโหลดโมเดลค้นตามความหมาย (ครั้งแรกครั้งเดียว)
      {progress && progress.total > 0 && ` ${mb(progress.loaded)} / ${mb(progress.total)} MB`} — ระหว่างนี้แสดงผลค้นคำไปก่อน
    </span>
  );
}
