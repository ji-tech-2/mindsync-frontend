import { useState, useEffect } from 'react';
import {
  TextField,
  Dropdown,
  Button,
  Message,
  PasswordField,
  Card,
} from '@/components';
import PageLayout from '@/layouts/PageLayout';
import PasswordChangeModal from '../components/PasswordChangeModal';
import {
  getProfile as getProfileService,
  updateProfile as updateProfileService,
  changePassword as changePasswordService,
} from '@/services';
import { TokenManager } from '@/utils/tokenManager';
import { useAuth } from '@/features/auth';
import { validateNameField } from '@/features/auth/utils/signUpValidators';
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
} from '@/utils/fieldMappings';
import styles from './Profile.module.css';

export default function Profile() {
  const { updateUser } = useAuth();
  const [originalUser, setOriginalUser] = useState({
    name: '',
    email: '',
    gender: '',
    occupation: '',
    workRmt: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    occupation: '',
    workRmt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [blurredFields, setBlurredFields] = useState({});

  // Check if any fields have changed (excluding password and email)
  const hasChanges =
    formData.name !== originalUser.name ||
    formData.gender !== originalUser.gender ||
    formData.occupation !== originalUser.occupation ||
    formData.workRmt !== originalUser.workRmt;

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileService();
        if (data.success) {
          // Transform API values to display values
          const apiData = data.data;
          const userData = {
            name: apiData.name,
            email: apiData.email,
            gender: fromApiGender(apiData.gender),
            occupation: fromApiOccupation(apiData.occupation),
            workRmt: fromApiWorkMode(apiData.workRmt),
          };
          setOriginalUser(userData);
          setFormData(userData);
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

  const handleFieldChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
    // Clear message when user makes changes
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
    // If field is already blurred, validate immediately
    if (blurredFields[fieldName] && fieldName === 'name') {
      const error = validateNameField(value);
      setErrors({ ...errors, name: error || '' });
    }
  };

  const handleNameBlur = () => {
    setBlurredFields({ ...blurredFields, name: true });
    const error = validateNameField(formData.name);
    setErrors({ ...errors, name: error || '' });
  };

  const handleSave = async () => {
    // Validate name before saving
    const nameError = validateNameField(formData.name);
    if (nameError) {
      setErrors({ ...errors, name: nameError });
      setBlurredFields({ ...blurredFields, name: true });
      setMessage({
        type: 'error',
        text: 'Please fix the errors before saving',
      });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Build update data with API-formatted values
      const updateData = {
        name: formData.name,
        gender: toApiGender(formData.gender),
        occupation: toApiOccupation(formData.occupation),
        workRmt: toApiWorkMode(formData.workRmt),
      };

      const response = await updateProfileService(updateData);

      if (response.success) {
        // Transform API response to display values
        const apiData = response.data;
        const updatedUser = {
          name: apiData.name,
          email: apiData.email,
          gender: fromApiGender(apiData.gender),
          occupation: fromApiOccupation(apiData.occupation),
          workRmt: fromApiWorkMode(apiData.workRmt),
        };
        setOriginalUser(updatedUser);
        setFormData(updatedUser);

        // Update both localStorage and global auth context
        TokenManager.setUserData(apiData);
        updateUser(apiData);

        setMessage({ type: 'success', text: 'Profile updated successfully' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async ({ oldPassword, newPassword }) => {
    setIsChangingPassword(true);

    try {
      const changeData = await changePasswordService(oldPassword, newPassword);

      if (changeData.success) {
        setMessage({
          type: 'success',
          text: 'Password changed successfully',
        });
        setIsPasswordModalOpen(false);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Get the dropdown value object for a field
  const getDropdownValue = (options, value) => {
    return options.find((opt) => opt.value === value) || null;
  };

  return (
    <PageLayout title="Settings">
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      ) : (
        <Card className={styles.profileCard}>
          {/* Left Section - Content Grid */}
          <div className={styles.contentSection}>
            {/* Profile Section Row */}
            <div className={styles.sectionTitle}>
              <h2>Profile</h2>
              <p>Set your account profile</p>
            </div>
            <div className={styles.fieldGroup}>
              <TextField
                label="Email"
                value={formData.email}
                disabled
                fullWidth
                variant="surface"
              />

              <div className={styles.passwordField}>
                <PasswordField
                  label="Password"
                  value="••••••••"
                  disabled
                  fullWidth
                  variant="surface"
                />
                <Button
                  variant="filled"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className={styles.changePasswordButton}
                >
                  Change
                </Button>
              </div>

              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={handleNameBlur}
                error={blurredFields.name && !!errors.name}
                fullWidth
                variant="surface"
              />
              {blurredFields.name && errors.name && (
                <Message type="error">{errors.name}</Message>
              )}

              <Dropdown
                label="Gender"
                options={genderOptions}
                value={getDropdownValue(genderOptions, formData.gender)}
                onChange={(option) => handleFieldChange('gender', option.value)}
                fullWidth
                variant="surface"
              />
            </div>

            {/* Your Work Section Row */}
            <div className={styles.sectionTitle}>
              <h2>Your Work</h2>
              <p>Set your work information</p>
            </div>
            <div className={styles.fieldGroup}>
              <Dropdown
                label="Occupation"
                options={occupationOptions}
                value={getDropdownValue(occupationOptions, formData.occupation)}
                onChange={(option) =>
                  handleFieldChange('occupation', option.value)
                }
                fullWidth
                variant="surface"
              />

              <Dropdown
                label="Work Remote"
                options={workModeOptions}
                value={getDropdownValue(workModeOptions, formData.workRmt)}
                onChange={(option) =>
                  handleFieldChange('workRmt', option.value)
                }
                fullWidth
                variant="surface"
              />

              {hasChanges && (
                <div className={styles.saveButtonContainer}>
                  <Button
                    variant="filled"
                    onClick={handleSave}
                    disabled={isSaving}
                    fullWidth
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}

              {message.text && (
                <div className={styles.messageContainer}>
                  <Message type={message.type}>{message.text}</Message>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Avatar */}
          <div className={styles.avatarColumn}>
            <div className={styles.avatar}>
              {(formData.name || '').trim().charAt(0).toUpperCase()}
            </div>
          </div>
        </Card>
      )}

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
        loading={isChangingPassword}
      />
    </PageLayout>
  );
}
