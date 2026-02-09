import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/profile.css';
import ProfileAvatar from '../../components/ProfileAvatar';
import ProfileFieldRow from '../../components/ProfileFieldRow';
import EditModal from '../../components/EditModal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import OTPInput from '../../components/OTPInput';
import apiClient, { TokenManager } from '../../config/api';
import useAuth from '../../hooks/useAuth';
import { getPasswordError } from '../../utils/passwordValidation';
import {
  genderOptions,
  occupationOptions,
  workModeOptions,
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
  fromApiGender,
  fromApiOccupation,
  fromApiWorkMode,
} from '../../utils/fieldMappings';

export default function Profile() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [user, setUser] = useState({
    name: '',
    email: '',
    gender: '',
    occupation: '',
    workRmt: '',
    dob: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({
    value: '',
    password: '',
    otp: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/v0-1/auth-profile');
        if (response.data.success) {
          // Transform API values to display values
          const apiData = response.data.data;
          setUser({
            ...apiData,
            gender: fromApiGender(apiData.gender),
            occupation: fromApiOccupation(apiData.occupation),
            workRmt: fromApiWorkMode(apiData.workRmt),
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to load profile',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const openModal = (field) => {
    setActiveModal(field);
    setFormData({ value: '', password: '', otp: '' });
    setPasswordError('');
    setMessage({ type: '', text: '' });
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({ value: '', password: '', otp: '' });
    setPasswordError('');
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear password error when user types in password field
    if (e.target.name === 'value' && activeModal === 'password') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (activeModal === 'password') {
        // Validate password before submitting
        const error = getPasswordError(formData.value);
        if (error) {
          setPasswordError(error);
          setLoading(false);
          return;
        }

        // Change password with OTP
        const response = await apiClient.post(
          '/v0-1/auth-profile/change-password',
          {
            email: user.email,
            otp: formData.otp,
            newPassword: formData.value,
          }
        );

        if (response.data.success) {
          setMessage({ type: 'success', text: response.data.message });
          setTimeout(() => {
            closeModal();
          }, 1500);
        }
      } else {
        // Update profile (name, gender, occupation, workRmt)
        const updateData = {};

        if (activeModal === 'name') {
          updateData.name = formData.value;
        } else if (activeModal === 'gender') {
          updateData.gender = toApiGender(formData.value);
        } else if (activeModal === 'occupation') {
          updateData.occupation = toApiOccupation(formData.value);
        } else if (activeModal === 'workRmt') {
          updateData.workRmt = toApiWorkMode(formData.value);
        }

        const response = await apiClient.put('/v0-1/auth-profile', updateData);

        if (response.data.success) {
          // Transform API response to display values
          const apiData = response.data.data;
          const updatedUser = {
            ...apiData,
            gender: fromApiGender(apiData.gender),
            occupation: fromApiOccupation(apiData.occupation),
            workRmt: fromApiWorkMode(apiData.workRmt),
          };
          setUser(updatedUser);

          // Update both localStorage and global auth context
          TokenManager.setUserData(apiData);
          updateUser(apiData);

          setMessage({ type: 'success', text: response.data.message });
          setTimeout(() => {
            closeModal();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await apiClient.post('/v0-1/auth-profile/request-otp', {
        email: user.email,
      });

      if (response.data.success) {
        setMessage({ type: 'info', text: response.data.message });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Profile Settings</h1>
        <p>Manage your personal information</p>
      </div>

      {isLoading ? (
        <div className="profile-content">
          <div className="profile-card">
            <p style={{ textAlign: 'center', padding: '2rem' }}>
              Loading profile...
            </p>
          </div>
        </div>
      ) : (
        <div className="profile-content">
          <div className="profile-card">
            <ProfileAvatar name={user.name} size="large" />

            <div className="profile-fields">
              <ProfileFieldRow
                label="Name"
                value={user.name}
                onEdit={() => openModal('name')}
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
                onEdit={() => openModal('gender')}
              />

              <ProfileFieldRow
                label="Occupation"
                value={user.occupation}
                onEdit={() => openModal('occupation')}
              />

              <ProfileFieldRow
                label="Work Mode"
                value={user.workRmt}
                onEdit={() => openModal('workRmt')}
              />

              <ProfileFieldRow
                label="Password"
                value="••••••••"
                onEdit={() => openModal('password')}
                buttonText="Change"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal for Name */}
      <EditModal
        isOpen={activeModal === 'name'}
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
        isOpen={activeModal === 'gender'}
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
          options={genderOptions}
          required
        />
      </EditModal>

      {/* Modal for Occupation */}
      <EditModal
        isOpen={activeModal === 'occupation'}
        onClose={closeModal}
        title="Edit Occupation"
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
      >
        <FormSelect
          label="Occupation"
          name="value"
          value={formData.value}
          onChange={handleInputChange}
          options={occupationOptions}
          required
        />
      </EditModal>

      {/* Modal for Work Mode */}
      <EditModal
        isOpen={activeModal === 'workRmt'}
        onClose={closeModal}
        title="Edit Work Mode"
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
      >
        <FormSelect
          label="Work Mode"
          name="value"
          value={formData.value}
          onChange={handleInputChange}
          options={workModeOptions}
          required
        />
      </EditModal>

      {/* Modal for Password */}
      <EditModal
        isOpen={activeModal === 'password'}
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
        {passwordError && (
          <div
            style={{
              color: '#dc3545',
              fontSize: '0.875rem',
              marginTop: '-0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            {passwordError}
          </div>
        )}
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
