
import React, { useEffect } from 'react';
import {
  X,
  AlertTriangle,
} from 'lucide-react';

export default function Modal({
  title,
  children,
  onClose,
  wide = false,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={`modal ${wide ? 'modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-header">
          <h2>{title}</h2>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        {children}
      </section>
    </div>
  );
}

export function ConfirmModal({
  title = 'Delete record?',
  message,
  onCancel,
  onConfirm,
  busy = false,
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
    >
      <div className="confirm-content">
        <span className="confirm-icon">
          <AlertTriangle size={23} />
        </span>

        <p>
          {message || 'This action cannot be undone.'}
        </p>
      </div>

      <footer className="modal-actions">
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>

        <button
          className="btn btn-danger"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </footer>
    </Modal>
  );
}
