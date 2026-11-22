import { useEffect, useState } from "react";
import api from "../../services/api";
import AddExpenseForm from "./AddExpenseForm";
import CreateEventForm from "./CreateEventForm";
import BudgetChart from "./BudgetChart";
import BudgetBarChart from "./BudgetBarChart";
import {
  EXPENSE_CATEGORIES,
  buildPlannedVsActual,
  getTotalPlanned,
  getPaymentSummary,
  isPaid,
  isOverdue,
} from "./budgetUtils";

// Turn event.plannedBudget (object, may be missing) into text values for the inputs
const toInputs = (plannedBudget) => {
  const inputs = {};
  EXPENSE_CATEGORIES.forEach((cat) => {
    const value = plannedBudget && plannedBudget[cat];
    inputs[cat] = value ? String(value) : "";
  });
  return inputs;
};

export default function EventDetail({ eventId, onBack }) {
  const [event, setEvent] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showEditEventForm, setShowEditEventForm] = useState(false);
  const [plannedInputs, setPlannedInputs] = useState(toInputs(null));
  const [savingPlan, setSavingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState(null); // { type: "success" | "error", text }

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventRes, expensesRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get("/expenses", { params: { eventId } }),
      ]);
      setEvent(eventRes.data);
      setPlannedInputs(toInputs(eventRes.data.plannedBudget));
      setExpenses(expensesRes.data);
    } catch (err) {
      setError("Could not load event details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  // Used for both add and edit: replace if it exists, otherwise append
  const handleExpenseSaved = (savedExpense) => {
    setExpenses((prev) =>
      prev.some((e) => e.id === savedExpense.id)
        ? prev.map((e) => (e.id === savedExpense.id ? savedExpense : e))
        : [...prev, savedExpense]
    );
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleEventSaved = (savedEvent) => {
    setEvent(savedEvent);
    setShowEditEventForm(false);
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Delete this event and all its expenses?")) return;
    setActionError("");
    try {
      await api.delete(`/events/${event.id}`, { params: { _dependent: "expenses" } });
      onBack();
    } catch (err) {
      setActionError("Could not delete the event. Please try again.");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    setActionError("");
    try {
      await api.delete(`/expenses/${expenseId}`);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err) {
      setActionError("Could not delete the expense. Please try again.");
    }
  };

  // PATCH only the payment fields, then replace that expense in state
  const handleMarkPaid = async (expenseId) => {
    setActionError("");
    try {
      const res = await api.patch(`/expenses/${expenseId}`, { paid: true, dueDate: "" });
      setExpenses((prev) => prev.map((e) => (e.id === expenseId ? res.data : e)));
    } catch (err) {
      setActionError("Could not mark the payment as paid. Please try again.");
    }
  };

  const handlePlanChange = (category, value) => {
    setPlanMessage(null);
    setPlannedInputs((prev) => ({ ...prev, [category]: value }));
  };

  const handleSavePlan = async () => {
    setPlanMessage(null);

    // Build the plannedBudget object: every category gets a number (empty = 0)
    const plannedBudget = {};
    for (const cat of EXPENSE_CATEGORIES) {
      const text = plannedInputs[cat];
      const num = Number(text);
      if (text !== "" && (Number.isNaN(num) || num < 0)) {
        setPlanMessage({ type: "error", text: `Enter a valid amount for ${cat}.` });
        return;
      }
      plannedBudget[cat] = text === "" ? 0 : num;
    }

    setSavingPlan(true);
    try {
      // PATCH: update only plannedBudget, other event fields stay unchanged
      const res = await api.patch(`/events/${event.id}`, { plannedBudget });
      setEvent(res.data);
      setPlanMessage({ type: "success", text: "Plan saved." });
    } catch (err) {
      setPlanMessage({ type: "error", text: "Could not save the plan. Please try again." });
    } finally {
      setSavingPlan(false);
    }
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

  // Live total while the user types in the plan inputs
  const totalPlanned = getTotalPlanned(plannedInputs);
  const planTooHigh = totalPlanned > Number(event.budget);

  // Saved plan vs real expenses
  const comparison = buildPlannedVsActual(event.plannedBudget, expenses);
  const overBudget = comparison.filter((row) => row.over);

  // Payment tracking
  const today = new Date().toLocaleDateString("en-CA");
  const payment = getPaymentSummary(expenses, today);

  const renderStatus = (exp) => {
    if (isPaid(exp)) {
      return <span className="ui-badge" style={styles.badgePaid}>Paid</span>;
    }
    const dueText = exp.dueDate ? `due ${formatDate(exp.dueDate)}` : "no due date";
    if (isOverdue(exp, today)) {
      return <span className="ui-badge" style={styles.badgeOverdue}>Overdue, {dueText}</span>;
    }
    return <span className="ui-badge" style={styles.badgePending}>Pending, {dueText}</span>;
  };

  return (
    <div style={styles.page}>
      <button onClick={onBack} style={styles.backBtn}>← Back to Events</button>

      {actionError && <div style={{ ...styles.alertError, marginBottom: "16px" }}>{actionError}</div>}

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div>
            <span style={styles.badge}>{event.type}</span>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "26px", fontWeight: "700", color: "#1f1015", margin: "6px 0 4px" }}>
              {event.title}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setShowEditEventForm(true)} style={styles.btnOutline}>Edit</button>
            <button onClick={handleDeleteEvent} style={styles.btnDanger}>Delete</button>
          </div>
        </div>
        <p style={{ color: "#9f6b7a", margin: "2px 0" }}>{formatDate(event.date)}</p>
        <p style={{ color: "#9f6b7a", margin: "2px 0 16px" }}>{event.venue}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", borderTop: "1px solid #fde3ea", paddingTop: "16px" }}>
          <Stat label="Budget" value={formatCurrency(event.budget)} color="#1f1015" />
          <Stat label="Total Spent" value={formatCurrency(totalSpent)} color="#1f1015" />
          <Stat label="Remaining" value={formatCurrency(remaining)} color={remaining < 0 ? "#dc2626" : "#059669"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", borderTop: "1px solid #fde3ea", paddingTop: "16px", marginTop: "16px" }}>
          <Stat label="Paid" value={formatCurrency(payment.paidTotal)} color="#059669" />
          <Stat label="Pending" value={formatCurrency(payment.pendingTotal)} color="#b45309" />
          <div>
            {payment.overdueCount > 0 && (
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#dc2626", margin: 0 }}>
                {payment.overdueCount} {payment.overdueCount === 1 ? "payment" : "payments"} overdue
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Planned Budget by Category</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat}>
              <label style={styles.label}>{cat} (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={plannedInputs[cat]}
                onChange={(e) => handlePlanChange(cat, e.target.value)}
                style={styles.input}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", gap: "12px", flexWrap: "wrap" }}>
          <p style={{ fontSize: "14px", color: "#5b3a44", margin: 0 }}>
            Total planned: <strong>{formatCurrency(totalPlanned)}</strong> of {formatCurrency(event.budget)}
          </p>
          <button onClick={handleSavePlan} disabled={savingPlan} style={{ ...styles.btnSmall, opacity: savingPlan ? 0.7 : 1 }}>
            {savingPlan ? "Saving..." : "Save Plan"}
          </button>
        </div>

        {planTooHigh && (
          <div style={{ ...styles.alertWarning, marginTop: "12px" }}>
            Warning: your planned total is {formatCurrency(totalPlanned - Number(event.budget))} more than the event budget.
          </div>
        )}
        {planMessage && (
          <div style={{ ...(planMessage.type === "success" ? styles.alertSuccess : styles.alertError), marginTop: "12px" }}>
            {planMessage.text}
          </div>
        )}
      </div>

      {expenses.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Spending by Category</h2>
          <BudgetChart expenses={expenses} />
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Planned vs Actual</h2>
        <BudgetBarChart plannedBudget={event.plannedBudget} expenses={expenses} />

        {overBudget.length > 0 && (
          <div style={{ marginTop: "14px" }}>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#b91c1c", margin: "0 0 6px" }}>Over budget:</p>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#b91c1c" }}>
              {overBudget.map((row) => (
                <li key={row.category}>
                  {row.category}: spent {formatCurrency(row.spent)} of {formatCurrency(row.planned)} planned
                  ({formatCurrency(row.spent - row.planned)} over)
                </li>
              ))}
            </ul>
          </div>
        )}
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
        <div style={{ ...styles.tableWrap, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fff5f7" }}>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} style={{ borderTop: "1px solid #fde3ea" }}>
                  <td style={styles.td}>{exp.category}</td>
                  <td style={styles.td}>{formatDate(exp.date)}</td>
                  <td style={styles.td}>{renderStatus(exp)}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: "600" }}>{formatCurrency(exp.amount)}</td>
                  <td style={{ ...styles.td, textAlign: "right", whiteSpace: "nowrap" }}>
                    {!isPaid(exp) && (
                      <button onClick={() => handleMarkPaid(exp.id)} style={styles.btnTinyPaid}>Mark paid</button>
                    )}
                    <button onClick={() => setEditingExpense(exp)} style={styles.btnTinyOutline}>Edit</button>
                    <button onClick={() => handleDeleteExpense(exp.id)} style={styles.btnTinyDanger}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showExpenseForm || editingExpense) && (
        <AddExpenseForm
          key={editingExpense ? editingExpense.id : "new"}
          eventId={event.id}
          expense={editingExpense}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          onSaved={handleExpenseSaved}
        />
      )}

      {showEditEventForm && (
        <CreateEventForm
          event={event}
          onClose={() => setShowEditEventForm(false)}
          onSaved={handleEventSaved}
        />
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
  sectionTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "19px",
    fontWeight: "700",
    color: "#1f1015",
    marginBottom: "12px",
  },
  alertError: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
  },
  alertWarning: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
  },
  alertSuccess: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#5b3a44",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #fde3ea",
    fontSize: "14px",
    boxSizing: "border-box",
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
  badgePaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    whiteSpace: "nowrap",
  },
  badgePending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    whiteSpace: "nowrap",
  },
  badgeOverdue: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    whiteSpace: "nowrap",
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
  btnOutline: {
    backgroundColor: "#fff",
    color: "#f43f5e",
    border: "1px solid #f43f5e",
    borderRadius: "999px",
    padding: "8px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnDanger: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "999px",
    padding: "8px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnTinyOutline: {
    backgroundColor: "#fff",
    color: "#f43f5e",
    border: "1px solid #f43f5e",
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    marginRight: "6px",
  },
  btnTinyPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    marginRight: "6px",
  },
  btnTinyDanger: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "12px",
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