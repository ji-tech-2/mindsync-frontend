export default function ProfileFieldRow({
  label,
  value,
  onEdit,
  buttonText = 'Edit',
}) {
  return (
    <div className="field-row">
      <div className="field-info">
        <label>{label}</label>
        <p>{value}</p>
      </div>
      <button className="edit-btn" onClick={onEdit}>
        {buttonText}
      </button>
    </div>
  );
}
