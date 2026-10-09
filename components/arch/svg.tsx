/** Tiny SVG kit for the architecture diagrams. Colours are the site's CSS tokens, so they follow light/dark. */

export type Tone = "diag" | "dec" | "plan" | "exec" | "ppl" | "think" | "ink";

const stroke = (t: Tone) => (t === "ink" ? "var(--ink2)" : `var(--${t})`);
const fill = (t: Tone) => (t === "ink" ? "var(--paper)" : `var(--${t}-bg)`);

export function Fig({ id, w = 960, h, title, children }: { id: string; w?: number; h: number; title: string; children: React.ReactNode }) {
  return (
    <figure className="arch-fig">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-labelledby={`${id}-t`} fontFamily="inherit">
        <title id={`${id}-t`}>{title}</title>
        <defs>
          <marker id={`${id}-ah`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="var(--ink2)" />
          </marker>
        </defs>
        {children}
      </svg>
    </figure>
  );
}

export function Box({ x, y, w, h = 48, t, s, tone = "ink", strong }: { x: number; y: number; w: number; h?: number; t: string; s?: string; tone?: Tone; strong?: boolean }) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill={strong ? fill(tone) : "var(--paper)"} stroke={stroke(tone)} strokeWidth={strong ? 1.8 : 1.2} />
      <text x={cx} y={s ? y + h / 2 - 4 : y + h / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={600} fill={tone === "ink" ? "var(--ink)" : stroke(tone)}>
        {t}
      </text>
      {s && (
        <text x={cx} y={y + h / 2 + 13} textAnchor="middle" fontSize={11.5} fill="var(--ink2)">
          {s}
        </text>
      )}
    </g>
  );
}

export function Lane({ x, y, w, h, t, s, tone }: { x: number; y: number; w: number; h: number; t: string; s: string; tone: Tone }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fill(tone)} opacity={0.55} />
      <text x={x + 12} y={y + 22} fontSize={13.5} fontWeight={700} fill={stroke(tone)}>
        {t}
      </text>
      <text x={x + 12} y={y + 40} fontSize={11.5} fill="var(--ink2)">
        {s}
      </text>
    </g>
  );
}

export function Arrow({ id, d, dashed, label, lx, ly }: { id: string; d: string; dashed?: boolean; label?: string; lx?: number; ly?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke="var(--ink2)" strokeWidth={1.5} strokeDasharray={dashed ? "5 4" : undefined} markerEnd={`url(#${id}-ah)`} />
      {label && lx != null && ly != null && (
        <text x={lx} y={ly} textAnchor="middle" fontSize={11.5} fill="var(--ink2)">
          {label}
        </text>
      )}
    </g>
  );
}

export function Note({ x, y, children, anchor = "start" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fontSize={12} fill="var(--ink2)" textAnchor={anchor}>
      {children}
    </text>
  );
}
