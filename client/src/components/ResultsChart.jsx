import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList, ResponsiveContainer } from "recharts";

// Un solo hue (slot 1 del formula de color del skill de dataviz) — las
// barras comparan magnitud entre opciones de UNA encuesta, no series
// distintas en el tiempo, asi que no hace falta leyenda.
const ACCENT = "#2a78d6";
const GRID = "#e1e0d9";
const AXIS_TEXT = "#52514e";

function renderPercentLabel(props) {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fontSize={13}
      fontWeight={700}
      fill="#0b0b0b"
    >
      {value}%
    </text>
  );
}

export default function ResultsChart({ data, totalVotes }) {
  if (!totalVotes) {
    return <p className="muted">Todavía no hay votos para esta vista.</p>;
  }

  const chartData = data.map((d) => ({ ...d, percentLabel: d.percent }));
  const height = Math.max(chartData.length * 44, 80);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 44, left: 0, bottom: 4 }}
        barCategoryGap={10}
      >
        <CartesianGrid horizontal={false} stroke={GRID} strokeDasharray="0" />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 13, fill: AXIS_TEXT }}
        />
        <Bar dataKey="percent" fill={ACCENT} radius={[0, 4, 4, 0]} maxBarSize={24}>
          {chartData.map((entry) => (
            <Cell key={entry.id} />
          ))}
          <LabelList dataKey="percent" content={renderPercentLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
