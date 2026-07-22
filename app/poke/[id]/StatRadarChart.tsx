type StatItem = {
  name: string;
  baseStat: number;
};

const MAX_STAT = 255;
const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 110;
const LABEL_RADIUS = 138;

function polarToCartesian(angleRad: number, radius: number) {
  return {
    x: CENTER + radius * Math.sin(angleRad),
    y: CENTER - radius * Math.cos(angleRad),
  };
}

function polygonPoints(values: number[], maxValue: number) {
  const count = values.length;
  return values
    .map((value, index) => {
      const angle = (Math.PI * 2 * index) / count;
      const ratio = Math.min(value / maxValue, 1);
      const point = polarToCartesian(angle, RADIUS * ratio);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

type StatRadarChartProps = {
  stats: StatItem[];
};

export function StatRadarChart({ stats }: StatRadarChartProps) {
  if (stats.length === 0) return null;

  const count = stats.length;
  const guideLevels = [0.25, 0.5, 0.75, 1];
  const axisPoints = stats.map((_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    return polarToCartesian(angle, RADIUS);
  });
  const dataPoints = polygonPoints(
    stats.map((stat) => stat.baseStat),
    MAX_STAT,
  );

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-auto w-full max-w-sm"
      role="img"
      aria-label="종족값 육각형 차트"
    >
      {guideLevels.map((level) => (
        <polygon
          key={level}
          points={polygonPoints(
            Array.from({ length: count }, () => MAX_STAT * level),
            MAX_STAT,
          )}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      ))}

      {axisPoints.map((point, index) => (
        <line
          key={`axis-${stats[index].name}`}
          x1={CENTER}
          y1={CENTER}
          x2={point.x}
          y2={point.y}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      ))}

      <polygon
        points={dataPoints}
        fill="rgba(0, 102, 204, 0.28)"
        stroke="#0066cc"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {stats.map((stat, index) => {
        const angle = (Math.PI * 2 * index) / count;
        const labelPoint = polarToCartesian(angle, LABEL_RADIUS);
        return (
          <text
            key={stat.name}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1d1d1f"
            fontSize={12}
            fontWeight={600}
          >
            {stat.name}
            <tspan x={labelPoint.x} dy="1.2em" fill="#7a7a7a" fontSize={11} fontWeight={400}>
              {stat.baseStat}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
