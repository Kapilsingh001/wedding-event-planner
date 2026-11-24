import { useEffect } from "react";

// Reusable confirm popup. Replaces window.confirm.
export default function ConfirmDialog({
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) {
  // Escape closes the popup
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="ui-modal-overlay" onMouseDown={onCancel}>
      <div
        className="ui-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: "380px" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2>{title}</h2>
          <button type="button" className="ui-modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <p className="ui-muted" style={{ margin: "0 0 4px" }}>{message}</p>

        <div className="ui-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}