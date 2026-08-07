import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList, ResponsiveContainer } from "recharts";

// Un solo hue (slot 1 del formula de color del skill de dataviz) — las
// barras comparan magnitud entre opciones de UNA encuesta, no series
// distintas en el tiempo, asi que no hace falta leyenda.
const ACCENT = "#2a78d6";
const GRID = "#e1e0d9";
const AXIS_TEXT = "#52514e";

function renderPercentLabel(fontSize) {
  return function Label(props) {
    const { x, y, width, height, value } = props;
    return (
      <text x={x + width + 8} y={y + height / 2} dy={4} fontSize={fontSize} fontWeight={700} fill="#0b0b0b">
        {value}%
      </text>
    );
  };
}

// compact = mini preview del feed (mas chico, sin ejes) vs. la vista
// completa en el detalle de la encuesta.
export default function ResultsChart({ data, totalVotes, compact = false }) {
  if (!totalVotes) {
    return <p className="muted small">Todavía no hay votos para esta vista.</p>;
  }

  const rowHeight = compact ? 26 : 44;
  const height = Math.max(data.length * rowHeight, compact ? 60 : 80);
  const labelWidth = compact ? 90 : 140;
  const fontSize = compact ? 11 : 13;
  const barSize = compact ? 14 : 24;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 2, right: 40, left: 0, bottom: 2 }}
        barCategoryGap={compact ? 6 : 10}
      >
        <CartesianGrid horizontal={false} stroke={GRID} strokeDasharray="0" />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={labelWidth}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize, fill: AXIS_TEXT }}
        />
        <Bar dataKey="percent" fill={ACCENT} radius={[0, 4, 4, 0]} maxBarSize={barSize}>
          {data.map((entry) => (
            <Cell key={entry.id} />
          ))}
          <LabelList dataKey="percent" content={renderPercentLabel(fontSize)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
