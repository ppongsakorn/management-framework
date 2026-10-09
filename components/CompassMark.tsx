/** The six-colour ring logo, one sector per group in cycle order. */
export function CompassMark({ size = 28 }: { size?: number }) {
  const colors = ["--diag", "--dec", "--plan", "--exec", "--ppl", "--think"];
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      {colors.map((c, i) => {
        const a0 = ((i * 60 - 90) * Math.PI) / 180;
        const a1 = (((i + 1) * 60 - 90) * Math.PI) / 180;
        const p = (a: number, r: number) => `${14 + r * Math.cos(a)} ${14 + r * Math.sin(a)}`;
        return <path key={c} d={`M${p(a0, 13)} A13 13 0 0 1 ${p(a1, 13)} L${p(a1, 7)} A7 7 0 0 0 ${p(a0, 7)} Z`} fill={`var(${c})`} />;
      })}
    </svg>
  );
}
