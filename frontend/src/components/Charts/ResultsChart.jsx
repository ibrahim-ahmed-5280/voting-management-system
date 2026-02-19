import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function ResultsChart({ candidates, title = "" }) {
  const chartData = candidates.map((c) => ({ name: c.name, votes: c.votes }));
  return (
    <div className="glass h-96 rounded-xl p-4">
      {title ? <h3 className="mb-2 text-sm font-bold text-brand-primary">{title}</h3> : null}
      <div className={title ? "h-[calc(100%-28px)]" : "h-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#2462C7", fontSize: 12 }}
              axisLine={{ stroke: "#BFD0EE" }}
              tickLine={{ stroke: "#BFD0EE" }}
            />
            <YAxis
              tick={{ fill: "#2462C7", fontSize: 12 }}
              axisLine={{ stroke: "#BFD0EE" }}
              tickLine={{ stroke: "#BFD0EE" }}
            />
            <Tooltip />
            <Bar dataKey="votes" fill="#2462C7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

