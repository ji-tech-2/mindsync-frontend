export default function EditModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  loading,
  message,
  children
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Updating..." : `Update ${title.replace('Edit ', '').replace('Change ', '')}`}
          </button>
        </form>
      </div>
    </div>
  );
}
