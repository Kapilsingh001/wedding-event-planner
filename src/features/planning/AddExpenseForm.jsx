import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../services/api";
import { EXPENSE_CATEGORIES } from "./budgetUtils";
import { expenseSchema } from "./schemas";

export default function AddExpenseForm({ eventId, onClose, onSaved, expense }) {
  const isEdit = Boolean(expense);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: expense ? expense.category : "Catering",
      amount: expense ? expense.amount : "",
      date: expense ? expense.date : "",
    },
  });

  const onSubmit = async (values) => {
    setError("");
    const body = {
      category: values.category,
      amount: values.amount,
      date: values.date,
    };

    try {
      let res;
      if (isEdit) {
        // PATCH: update only these fields (eventId is not sent, so it stays unchanged)
        res = await api.patch(`/expenses/${expense.id}`, body);
      } else {
        res = await api.post("/expenses", { eventId, ...body });
      }
      onSaved(res.data);
    } catch (err) {
      setError(isEdit ? "Could not update expense. Please try again." : "Could not add expense. Please try again.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "21px", fontWeight: "700", color: "#1f1015" }}>
            {isEdit ? "Edit Expense" : "Add Expense"}
          </h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: "15px" }}>
            <label style={styles.label}>Category</label>
            <select style={styles.input} {...register("category")}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p style={styles.fieldError}>{errors.category.message}</p>}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={styles.label}>Amount (₹)</label>
            <input type="number" placeholder="e.g. 25000" min="0" style={styles.input} {...register("amount")} />
            {errors.amount && <p style={styles.fieldError}>{errors.amount.message}</p>}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={styles.label}>Date</label>
            <input type="date" style={styles.input} {...register("date")} />
            {errors.date && <p style={styles.fieldError}>{errors.date.message}</p>}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ ...styles.btnPrimary, opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save" : "Add Expense")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
//-------- Css of this page

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(31,16,21,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "18px",
    padding: "26px",
    width: "100%",
    maxWidth: "400px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#9f6b7a",
  },
  alertError: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "14px",
    fontSize: "14px",
  },
  fieldError: {
    color: "#b91c1c",
    fontSize: "12px",
    margin: "5px 0 0",
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
  btnSecondary: {
    flex: 1,
    padding: "11px",
    borderRadius: "999px",
    border: "1px solid #fde3ea",
    backgroundColor: "#fff",
    color: "#5b3a44",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnPrimary: {
    flex: 1,
    padding: "11px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#f43f5e",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
};