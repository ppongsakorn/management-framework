import type { Metadata } from "next";
import { MSearch } from "@/components/mobile/MSearch";
import { frameworks } from "@/lib/data";

export const metadata: Metadata = { title: "ค้นหา" };

export default function MobileSearchPage() {
  return <MSearch frameworks={frameworks} />;
}
