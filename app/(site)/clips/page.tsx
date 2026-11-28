import type { Metadata } from "next";
import { ClipList } from "@/components/ClipList";
import { seriesAbout, seriesName } from "@/lib/series";

export const metadata: Metadata = {
  title: "คลิป",
  description: "คลิปอธิบาย framework เรียงตามตอนของซีรีส์ร้านอาหาร เรื่องเดียวกันที่ต่อเนื่องทุกตอน",
};

export default function ClipsPage() {
  return (
    <>
      <div className="page-head">
        <h1>คลิป · {seriesName}</h1>
        <p>{seriesAbout}</p>
      </div>
      <ClipList size="desktop" href={(slug) => `/frameworks/${slug}`} />
    </>
  );
}
