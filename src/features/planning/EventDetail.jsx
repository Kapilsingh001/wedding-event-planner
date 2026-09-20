import { useEffect, useState } from "react";
import AddExpenseForm from "./AddExpenseForm";

const API_URL = "http://localhost:3001";

export default function EventDetail({ eventId, onBack }) {
  const [event, setEvent] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventRes, expensesRes] = await Promise.all([
        fetch(`${API_URL}/events/${eventId}`),
        fetch(`${API_URL}/expenses?eventId=${eventId}`),
      ]);
      if (!eventRes.ok || !expensesRes.ok) throw new Error("Failed to fetch event details");
      setEvent(await eventRes.json());
      setExpenses(await expensesRes.json());
    } catch (err) {
      setError("Could not load event details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const handleExpenseAdded = (newExpense) => {
    setExpenses((prev) => [...prev, newExpense]);
    setShowExpenseForm(false);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#9f6b7a" }}>Loading...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={styles.page}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <div style={styles.alertError}>{error || "Event not found."}</div>
      </div>
    );
  }

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const remaining = Number(event.budget) - totalSpent;

  return (
    <div style={styles.page}>
      <button onClick={onBack} style={styles.backBtn}>← Back to Events</button>

      <div style={styles.card}>
        <span style={styles.badge}>{event.type}</span>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "26px", fontWeight: "700", color: "#1f1015", margin: "6px 0 4px" }}>
          {event.title}
        </h1>
        <p style={{ color: "#9f6b7a", margin: "2px 0" }}>{formatDate(event.date)}</p>
        <p style={{ color: "#9f6b7a", margin: "2px 0 16px" }}>{event.venue}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", borderTop: "1px solid #fde3ea", paddingTop: "16px" }}>
          <Stat label="Budget" value={formatCurrency(event.budget)} color="#1f1015" />
          <Stat label="Total Spent" value={formatCurrency(totalSpent)} color="#1f1015" />
          <Stat label="Remaining" value={formatCurrency(remaining)} color={remaining < 0 ? "#dc2626" : "#059669"} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "19px", fontWeight: "700", color: "#1f1015" }}>
          Expenses
        </h2>
        <button onClick={() => setShowExpenseForm(true)} style={styles.btnSmall}>+ Add Expense</button>
      </div>

      {expenses.length === 0 ? (
        <p style={{ color: "#9f6b7a" }}>No expenses recorded yet.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fff5f7" }}>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Date</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} style={{ borderTop: "1px solid #fde3ea" }}>
                  <td style={styles.td}>{exp.category}</td>
                  <td style={styles.td}>{formatDate(exp.date)}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: "600" }}>{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showExpenseForm && (
        <AddExpenseForm eventId={event.id} onClose={() => setShowExpenseForm(false)} onAdded={handleExpenseAdded} />
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p style={{ fontSize: "12px", color: "#9f6b7a", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "16px", fontWeight: "700", color }}>{value}</p>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px 24px",
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#fff5f7",
    minHeight: "100vh",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#f43f5e",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
    marginBottom: "16px",
  },
  alertError: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #fde3ea",
    borderRadius: "16px",
    padding: "22px",
    marginBottom: "22px",
    boxShadow: "0 2px 8px rgba(244,63,94,0.06)",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#fce7f3",
    color: "#be185d",
    fontSize: "12px",
    fontWeight: "600",
    padding: "3px 12px",
    borderRadius: "999px",
  },
  btnSmall: {
    backgroundColor: "#f43f5e",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tableWrap: {
    backgroundColor: "#fff",
    border: "1px solid #fde3ea",
    borderRadius: "16px",
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    padding: "11px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#5b3a44",
  },
  td: {
    padding: "11px 16px",
    fontSize: "14px",
    color: "#1f1015",
  },
};