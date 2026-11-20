import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { buildPlannedVsActual } from "./budgetUtils";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function BudgetBarChart({ plannedBudget, expenses }) {
  const data = buildPlannedVsActual(plannedBudget, expenses);

  if (data.length === 0) {
    return <p style={{ color: "#9f6b7a" }}>Set a planned budget or add expenses to see this chart.</p>;
  }

  return (
    <div style={{ width: "100%", height: "320px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fde3ea" />
          <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#5b3a44" }} />
          <YAxis tick={{ fontSize: 12, fill: "#5b3a44" }} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="planned" name="Planned" fill="#fda4af" radius={[6, 6, 0, 0]} />
          <Bar dataKey="spent" name="Spent" fill="#059669" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.over ? "#dc2626" : "#059669"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}