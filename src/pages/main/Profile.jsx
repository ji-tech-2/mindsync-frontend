import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/profile.css";
import ProfileAvatar from "../../components/ProfileAvatar";
import ProfileFieldRow from "../../components/ProfileFieldRow";
import EditModal from "../../components/EditModal";
import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import OTPInput from "../../components/OTPInput";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    gender: "Male",
    occupation: "Software Engineer"
  });

  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({
    value: "",
    password: "",
    otp: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const openModal = (field) => {
    setActiveModal(field);
    setFormData({ value: "", password: "", otp: "" });
    setMessage({ type: "", text: "" });
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({ value: "", password: "", otp: "" });
    setMessage({ type: "", text: "" });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Dummy API call simulation
    setTimeout(() => {
      // Simulate success
      if (activeModal === "name") {
        setUser({ ...user, name: formData.value });
        setMessage({ type: "success", text: "Name updated successfully!" });
      } else if (activeModal === "gender") {
        setUser({ ...user, gender: formData.value });
        setMessage({ type: "success", text: "Gender updated successfully!" });
      } else if (activeModal === "occupation") {
        setUser({ ...user, occupation: formData.value });
        setMessage({ type: "success", text: "Occupation updated successfully!" });
      } else if (activeModal === "email") {
        setUser({ ...user, email: formData.value });
        setMessage({ type: "success", text: "Email updated successfully!" });
      } else if (activeModal === "password") {
        setMessage({ type: "success", text: "Password updated successfully!" });
      }

      setLoading(false);
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        closeModal();
      }, 1500);
    }, 1000);
  };

  const sendOTP = () => {
    setLoading(true);
    // Dummy OTP send
    setTimeout(() => {
      setMessage({ type: "info", text: "OTP sent to your email!" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>Profile Settings</h1>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <ProfileAvatar name={user.name} />

          <div className="profile-fields">
            <ProfileFieldRow
              label="Name"
              value={user.name}
              onEdit={() => openModal("name")}
            />

            <div className="field-row">
              <div className="field-info">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
            </div>

            <ProfileFieldRow
              label="Gender"
              value={user.gender}
              onEdit={() => openModal("gender")}
            />

            <ProfileFieldRow
              label="Occupation"
              value={user.occupation}
              onEdit={() => openModal("occupation")}
            />

            <ProfileFieldRow
              label="Password"
              value="••••••••"
              onEdit={() => openModal("password")}
              buttonText="Change"
            />
          </div>
        </div>
      </div>

      {/* Modal for Name */}
      <EditModal
        isOpen={activeModal === "name"}
        onClose={closeModal}
        title="Edit Name"
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
      >
        <FormInput
          label="New Name"
          type="text"
          name="value"
          value={formData.value}
          onChange={handleInputChange}
          placeholder="Enter new name"
          required
        />
      </EditModal>

      {/* Modal for Gender */}
      <EditModal
        isOpen={activeModal === "gender"}
        onClose={closeModal}
        title="Edit Gender"
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
      >
        <FormSelect
          label="Gender"
          name="value"
          value={formData.value}
          onChange={handleInputChange}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" }
          ]}
          required
        />
      </EditModal>

      {/* Modal for Occupation */}
      <EditModal
        isOpen={activeModal === "occupation"}
        onClose={closeModal}
        title="Edit Occupation"
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
      >
        <FormInput
          label="New Occupation"
          type="text"
          name="value"
          value={formData.value}
          onChange={handleInputChange}
          placeholder="Enter new occupation"
          required
        />
      </EditModal>

      {/* Modal for Password */}
      <EditModal
        isOpen={activeModal === "password"}
        onClose={closeModal}
        title="Change Password"
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
      >
        <FormInput
          label="New Password"
          type="password"
          name="value"
          value={formData.value}
          onChange={handleInputChange}
          placeholder="Enter new password"
          required
        />
        <OTPInput
          otpValue={formData.otp}
          onOtpChange={handleInputChange}
          onSendOTP={sendOTP}
          emailValue={user.email}
          loading={loading}
        />
      </EditModal>
    </div>
  );
}
