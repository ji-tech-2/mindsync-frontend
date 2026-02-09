export default function ProfileAvatar({
  name,
  size = 'small',
  isHoverable = true,
}) {
  let sizeClass = 'avatar-circle';

  if (size === 'medium') {
    sizeClass = 'avatar-circle-medium';
  } else if (size === 'large') {
    sizeClass = 'avatar-circle-large';
  }

  const hoverClass = isHoverable ? '' : 'avatar-no-hover';
  const combinedClass = `${sizeClass} ${hoverClass}`.trim();

  return (
    <div className="profile-avatar">
      <div className={combinedClass}>
        {(name || '').trim().charAt(0).toUpperCase()}
      </div>
    </div>
  );
}
