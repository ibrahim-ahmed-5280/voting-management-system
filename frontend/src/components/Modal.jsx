import { useEffect } from "react";
import { FaTimes, FaTrashAlt } from "react-icons/fa";

export function Modal({
  open,
  title,
  onClose,
  children,
  maxWidthClass = "max-w-2xl",
  footer
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div
        className={`glass w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-5`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            aria-label="Close modal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/15 text-black transition hover:bg-black/5 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-white/10"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div>{children}</div>

        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Delete",
  cancelText = "Cancel",
  onClose,
  onConfirm,
  loading = false,
  danger = true
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      maxWidthClass="max-w-md"
      footer={
        <>
          <button type="button" className="btn border border-slate-300" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={danger ? "btn bg-red-600 text-white hover:bg-red-700" : "btn-primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {danger && <FaTrashAlt />}
            {loading ? "Processing..." : confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  );
}
