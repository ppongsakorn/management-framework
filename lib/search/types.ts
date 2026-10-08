export type Variant = "v0" | "v1" | "v2" | "v3";

export interface SearchDoc {
  slug: string;
  name: string;
  when: string;
  how: string;
  steps: string[];
  example: string;
  origin: string;
}

export interface SearchHit {
  slug: string;
  score: number;
  /** Short explanation shown under a result, e.g. the situation phrase that matched. */
  why?: string;
}

export const VARIANTS: Record<Variant, { label: string; summary: string }> = {
  v0: { label: "v0 · ข้อความตรงตัว", summary: "ของเดิม: แสดงเฉพาะ framework ที่มีข้อความที่พิมพ์อยู่ตรงตัว ไม่จัดอันดับ" },
  v1: { label: "v1 · ค้นคำแบบมีอันดับ", summary: "ตัดคำไทยด้วย Intl.Segmenter + จัดอันดับ BM25 (MiniSearch) ชื่อและ 'ใช้เมื่อ' มีน้ำหนักมากกว่า" },
  v2: { label: "v2 · + คลังสถานการณ์", summary: "v1 + เทียบกับประโยคที่คนมักพิมพ์ค้น (เตรียมไว้ล่วงหน้า framework ละ 30–40 ประโยค)" },
  v3: { label: "v3 · + ค้นตามความหมาย", summary: "v2 + โมเดล embedding ภาษาไทยในเบราว์เซอร์ (โหลดครั้งแรกราว 35MB) รวมอันดับด้วย RRF" },
};
