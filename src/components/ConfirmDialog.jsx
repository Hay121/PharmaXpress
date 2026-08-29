// ═══════════════════════════════════════════
// ConfirmDialog — 1-step confirmation
// ═══════════════════════════════════════════
import React, { useEffect, useRef } from 'react';
import { useStore } from '../store.js';

export function ConfirmDialog() {
  const dialog = useStore(s => s.confirmDialog);
  const setConfirmDialog = useStore(s => s.setConfirmDialog);
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        dialog?.onConfirm?.();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setConfirmDialog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog]);

  if (!dialog) return null;

  return (
    <div className="confirm-overlay" onClick={() => setConfirmDialog(null)}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-dialog__title">{dialog.title}</div>
        <div className="confirm-dialog__message" style={{ whiteSpace: 'pre-line' }}>{dialog.message}</div>
        <div className="confirm-dialog__actions">
          {!dialog.hideCancel && (
            <button className="btn btn--ghost" onClick={() => setConfirmDialog(null)}>
              Batal <span className="btn__kbd">Esc</span>
            </button>
          )}
          <button
            ref={confirmRef}
            className={`btn ${dialog.confirmVariant === 'danger' ? 'btn--danger' : 'btn--primary'}`}
            onClick={dialog.onConfirm}
          >
            {dialog.confirmLabel || 'Konfirmasi'} <span className="btn__kbd">Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
