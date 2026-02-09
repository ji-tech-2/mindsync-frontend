export default function EditModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  loading,
  message,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          {message.text && (
            <div
              className={`message ${message.type}`}
              role={message.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {message.text}
            </div>
          )}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading
              ? 'Updating...'
              : `Update ${title.replace('Edit ', '').replace('Change ', '')}`}
          </button>
        </form>
      </div>
    </div>
  );
}
