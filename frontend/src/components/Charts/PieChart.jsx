import {
  PieChart as RPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const colors = ["#2462C7", "#4F8FF0", "#82B1F7", "#A9CBFA"];

export default function PieChart({ data, title = "" }) {
  return (
    <div className="glass h-80 rounded-xl p-4">
      {title ? <h3 className="mb-2 text-sm font-bold text-brand-primary">{title}</h3> : null}
      <div className={title ? "h-[calc(100%-28px)]" : "h-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <RPieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

