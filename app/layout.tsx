import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { frameworks } from "@/lib/data";
import "./globals.css";

const plex = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "เข็มทิศกรอบความคิด — หยิบ Framework ให้ถูกสถานการณ์", template: "%s · เข็มทิศกรอบความคิด" },
  description:
    `เรียนรู้ ${frameworks.length} management framework จัดกลุ่มตามคำถามที่ผู้บริหารกำลังถาม พร้อมขั้นตอนลงมือทำ ตัวอย่าง และแผนภาพสำหรับนำเสนอ`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#15181d" },
  ],
};

/** Shared by the desktop site, app/(site), and the phone app, app/mobile — each brings its own chrome. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={plex.variable}>
      <body>{children}</body>
    </html>
  );
}
