import { useEffect } from "react";

// Reusable popup for the whole site. Replaces window.confirm and window.alert.
// For a message with only an OK button, pass cancelLabel={null} and confirmClass="".
export default function ConfirmDialog({
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirmClass = "btn-danger",
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
          {cancelLabel && (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          )}
          <button type="button" className={`btn ${confirmClass}`} onClick={onConfirm} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}