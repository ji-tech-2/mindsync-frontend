import styles from './ProfileAvatar.module.css';

export default function ProfileAvatar({
  name,
  size = 'small',
  isHoverable = true,
}) {
  let sizeClass = styles.avatarCircle;

  if (size === 'medium') {
    sizeClass = styles.avatarCircleMedium;
  } else if (size === 'large') {
    sizeClass = styles.avatarCircleLarge;
  }

  const hoverClass = isHoverable ? '' : styles.noHover;
  const combinedClass = `${sizeClass} ${hoverClass}`.trim();

  return (
    <div className={styles.avatar}>
      <div className={combinedClass}>
        {(name || '').trim().charAt(0).toUpperCase()}
      </div>
    </div>
  );
}
