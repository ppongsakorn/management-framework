import type { Metadata } from "next";
import { MTabBar } from "@/components/mobile/MTabBar";
import { WebMcp } from "@/components/WebMcp";
import useCases from "@/data/use-cases.json";
import { frameworks, type UseCase } from "@/lib/data";
import { fullSiteChoiceScript } from "@/lib/mobile";
import "./mobile.css";

// The desktop pages are the canonical copies; keep the app view out of search results.
export const metadata: Metadata = { robots: { index: false, follow: true } };

/** Phone app shell: screens scroll between a top app bar and a fixed bottom tab bar. */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-app">
      <script dangerouslySetInnerHTML={{ __html: fullSiteChoiceScript() }} />
      <WebMcp frameworks={frameworks} useCases={useCases as Record<string, UseCase[]>} />
      {children}
      <MTabBar />
    </div>
  );
}
