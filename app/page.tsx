import Link from "next/link";
import { frameworks, frameworksIn, groups, routerPrompts, type GroupId } from "@/lib/data";
import { aiEnabled, basePath } from "@/lib/site";

// Six equal ring sectors, clockwise from 12 o'clock, in cycle order.
const SECTORS: { id: GroupId; d: string; label: [number, number]; text: string }[] = [
  { id: "diag", d: "M200 200 L200 30 A170 170 0 0 1 347.2 115 Z", label: [270, 92], text: "วิเคราะห์" },
  { id: "dec", d: "M200 200 L347.2 115 A170 170 0 0 1 347.2 285 Z", label: [326, 206], text: "ตัดสินใจ" },
  { id: "plan", d: "M200 200 L347.2 285 A170 170 0 0 1 200 370 Z", label: [268, 322], text: "วางแผน" },
  { id: "exec", d: "M200 200 L200 370 A170 170 0 0 1 52.8 285 Z", label: [132, 322], text: "ลงมือทำ" },
  { id: "ppl", d: "M200 200 L52.8 285 A170 170 0 0 1 52.8 115 Z", label: [74, 206], text: "บริหารคน" },
  { id: "think", d: "M200 200 L52.8 115 A170 170 0 0 1 200 30 Z", label: [130, 92], text: "คิดให้ชัด" },
];

function Compass() {
  return (
    <svg className="compass" viewBox="0 0 400 400" role="img" aria-label="วงจรบริหาร 6 ขั้น — แตะเพื่อไปกลุ่มนั้น">
      <defs>
        <clipPath id="ring">
          <path
            clipRule="evenodd"
            d="M200 200 m-170 0 a170 170 0 1 0 340 0 a170 170 0 1 0 -340 0 Z M200 200 m-96 0 a96 96 0 1 1 192 0 a96 96 0 1 1 -192 0 Z"
          />
        </clipPath>
      </defs>
      <g clipPath="url(#ring)">
        {SECTORS.map((s) => (
          <a key={s.id} href={`${basePath}/frameworks/#${s.id}`}>
            <path className="sec" d={s.d} fill={`var(--${s.id})`} />
          </a>
        ))}
      </g>
      <circle cx="200" cy="200" r="96" fill="var(--paper)" stroke="var(--line)" />
      <text x="200" y="192" textAnchor="middle" fontSize="15" fill="var(--ink)">
        อยู่ขั้นไหน
      </text>
      <text x="200" y="214" textAnchor="middle" fontSize="13" fill="var(--ink2)" fontWeight="400">
        แตะเพื่อไปกลุ่มนั้น
      </text>
      <g fontSize="14" fill="#fff">
        {SECTORS.map((s) => (
          <text key={s.id} x={s.label[0]} y={s.label[1]} textAnchor="middle">
            {s.text}
          </text>
        ))}
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>
            เข็มทิศกรอบความคิด
            <br />
            หยิบ Framework ให้ถูกสถานการณ์
          </h1>
          <p>
            ปัญหาของคนที่รู้จักโมเดลเยอะไม่ใช่ &quot;ไม่รู้&quot; แต่คือ &quot;ไม่รู้ว่าตอนนี้ควรใช้ตัวไหน&quot; ที่นี่รวม{" "}
            {frameworks.length} กรอบความคิดด้านการบริหารที่ใช้กันแพร่หลาย เรียงตามวงจรงานของผู้บริหาร
          </p>
          <p>
            ทุกตัวมีขั้นตอนลงมือทำ ตัวอย่างสถานการณ์ และแผนภาพสำหรับนำเสนอ
            {aiEnabled && " พร้อมที่ปรึกษา AI ที่ช่วยปรับให้เข้ากับงานของคุณ"}
          </p>
          <div className="actions">
            {aiEnabled && (
              <Link href="/advisor" className="btn primary">
                เล่าปัญหาให้ที่ปรึกษา AI ฟัง →
              </Link>
            )}
            <Link href="/frameworks" className={aiEnabled ? "btn" : "btn primary"}>
              ดู Framework ทั้งหมด{aiEnabled ? "" : " →"}
            </Link>
          </div>
        </div>
        <Compass />
      </section>

      <section className="panel router">
        <h2>ตอนนี้คุณกำลังพูดประโยคไหน?</h2>
        <ul>
          {groups.map((g) => (
            <li key={g.id} className={`g-${g.id}`}>
              <Link href={`/frameworks#${g.id}`}>
                <span className="dot" />
                <span>
                  <b>&quot;{routerPrompts[g.id].sentence}&quot;</b>
                  <small>→ {g.title}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="section-title">6 กลุ่ม ตามวงจรงานผู้บริหาร</h2>
      <p className="muted" style={{ margin: "0 0 16px" }}>
        5 กลุ่มแรกเรียงเป็นวงจร แล้ววนกลับ กลุ่มที่ 6 เป็นเลนส์ที่วางทับทุกขั้น
      </p>
      <div className="group-grid">
        {groups.map((g) => (
          <Link key={g.id} href={`/frameworks#${g.id}`} className={`group-tile g-${g.id}`}>
            <h3>{g.title}</h3>
            <p>{g.question}</p>
            <div className="chips">
              {frameworksIn(g.id).map((f) => (
                <span key={f.slug} className="chip">
                  {f.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {aiEnabled && (
      <section className="panel ai-band">
        <div>
          <h2>ไม่แน่ใจว่าจะเริ่มจากตัวไหน?</h2>
          <p>
            เล่าสถานการณ์ให้ที่ปรึกษา AI ฟัง — จะวินิจฉัยว่าคุณอยู่ขั้นไหน แนะนำ framework ที่เหมาะ พร้อมขั้นตอนและตัวอย่างที่ปรับเข้ากับทีมของคุณ
          </p>
        </div>
        <Link href="/advisor" className="btn primary">
          เริ่มปรึกษา →
        </Link>
      </section>
      )}

      <section className="panel legend">
        <h2>ทำไมถึงจัดกลุ่มแบบนี้</h2>
        <ul>
          <li>
            จัดตาม <b>คำถามที่ผู้บริหารกำลังถาม</b> ไม่ใช่ตามชื่อผู้คิดค้นหรือสาขาวิชา เพราะตอนเจอปัญหาจริงคุณจำได้แค่ว่า &quot;ติดตรงไหน&quot;
          </li>
          <li>5 กลุ่มแรกเรียงเป็นวงจร วิเคราะห์ → ตัดสินใจ → วางแผน → ทำ → คน แล้ววนกลับ กลุ่มที่ 6 เป็นเลนส์ที่วางทับทุกขั้น</li>
          <li>
            สีไล่จากร้อนไปเย็น ตามระดับ &quot;ความเสี่ยงที่ความรู้สึกจะแทรก&quot;: แดง (ปัญหาไม่ชัด) → เหลือง (ทางแยก) → น้ำเงิน (พิมพ์เขียว) →
            เขียว (เดินได้) ม่วงและเขียวครามแยกออกมาเพราะเป็นมิติคนละแกน
          </li>
          <li>แต่ละการ์ดอ่านจบใน 10 วินาที: ใช้เมื่อไหร่ → ทำยังไง 1 บรรทัด — เปิดหน้ารายละเอียดเมื่อจะลงมือทำจริง จะได้แผนภาพ ขั้นตอน 5 ข้อ และตัวอย่าง</li>
        </ul>
      </section>
    </>
  );
}
