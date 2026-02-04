export default function ProfileAvatar({ name }) {
  return (
    <div className="profile-avatar">
      <div className="avatar-circle">
        {name.trim().charAt(0).toUpperCase()}
      </div>
    </div>
  );
}
