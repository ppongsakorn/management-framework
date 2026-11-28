import type { Metadata } from "next";
import { ClipList } from "@/components/ClipList";
import { MTop } from "@/components/mobile/MTop";
import { seriesAbout, seriesName } from "@/lib/series";

export const metadata: Metadata = { title: "คลิป" };

export default function MobileClips() {
  return (
    <>
      <MTop title={`คลิป · ${seriesName}`} />
      <main className="m-screen">
        <p className="m-lead">{seriesAbout}</p>
        <ClipList size="mobile" href={(slug) => `/mobile/f/${slug}/`} />
      </main>
    </>
  );
}
