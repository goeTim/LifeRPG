import { ATTRIBUTE_META, ATTRIBUTE_ORDER } from "@/lib/constants";
import { AttributeKey } from "@/types/domain";

type Props = {
  levels: Record<AttributeKey, number>;
};

const size = 340;
const center = size / 2;
const radius = 120;

function pointAt(index: number, total: number, factor: number) {
  const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / total;
  return {
    x: center + Math.cos(angle) * radius * factor,
    y: center + Math.sin(angle) * radius * factor
  };
}

export function AttributeRadarChart({ levels }: Props) {
  const maxLevel = Math.max(...Object.values(levels), 5);
  const polygon = ATTRIBUTE_ORDER.map((key, i) => {
    const norm = levels[key] / maxLevel;
    const p = pointAt(i, ATTRIBUTE_ORDER.length, norm);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <div className="card">
      <h2 className="mb-3 text-lg font-semibold">Attribut-Profil</h2>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[340px]">
        {[0.2, 0.4, 0.6, 0.8, 1].map((ring) => (
          <polygon
            key={ring}
            points={ATTRIBUTE_ORDER.map((_, i) => {
              const p = pointAt(i, ATTRIBUTE_ORDER.length, ring);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="rgba(148,163,184,0.28)"
          />
        ))}

        {ATTRIBUTE_ORDER.map((key, i) => {
          const edge = pointAt(i, ATTRIBUTE_ORDER.length, 1);
          return <line key={key} x1={center} y1={center} x2={edge.x} y2={edge.y} stroke="rgba(148,163,184,0.3)" />;
        })}

        <polygon points={polygon} fill="rgba(139,92,246,0.26)" stroke="rgba(167,139,250,0.9)" strokeWidth="2" />

        {ATTRIBUTE_ORDER.map((key, i) => {
          const labelPoint = pointAt(i, ATTRIBUTE_ORDER.length, 1.15);
          return (
            <text key={key} x={labelPoint.x} y={labelPoint.y} textAnchor="middle" className="fill-slate-200 text-[11px]">
              {ATTRIBUTE_META[key].label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
