import { envName, isProd } from "@/lib/site";

const LABEL = {
  stg: { name: "STAGING", note: "สภาพแวดล้อมทดสอบก่อนขึ้นจริง ยังไม่ใช่เวอร์ชันที่ใช้งานจริง" },
  dev: { name: "DEVELOPMENT", note: "สภาพแวดล้อมพัฒนา ฟีเจอร์อาจยังไม่เสร็จหรือเปลี่ยนได้ทุกเมื่อ" },
} as const;

/** Banner on the stg and dev previews so nobody mistakes them for production. Renders nothing on prd. */
export function EnvBar() {
  if (isProd) return null;
  const l = LABEL[envName as "stg" | "dev"];
  return (
    <div className={`env-bar env-${envName}`} role="note">
      <b>{l.name}</b>
      <span>{l.note}</span>
    </div>
  );
}
