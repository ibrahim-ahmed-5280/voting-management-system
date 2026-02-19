import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function BarChart({ data, xKey = "name", yKey = "value", title = "" }) {
  return (
    <div className="glass h-80 rounded-xl p-4">
      {title ? <h3 className="mb-2 text-sm font-bold text-brand-primary">{title}</h3> : null}
      <div className={title ? "h-[calc(100%-28px)]" : "h-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <RBarChart data={data}>
            <CartesianGrid stroke="#D9E0EA" strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
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
            <Bar dataKey={yKey} fill="#4F8FF0" radius={[6, 6, 0, 0]} />
          </RBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

