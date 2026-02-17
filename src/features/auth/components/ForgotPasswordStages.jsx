import { TextField, Button, Message, FormSection } from '@/components';
import PasswordField from './PasswordField';
import BackButton from './BackButton';

export function EmailStage({
  form,
  errors,
  blurredFields,
  loading,
  emailRef,
  handleChange,
  handleBlur,
  sendOTP,
}) {
  return (
    <>
      <FormSection ref={emailRef}>
        <TextField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          error={blurredFields.email && !!errors.email}
          fullWidth
        />
        {blurredFields.email && errors.email && (
          <Message type="error" message={errors.email} />
        )}
      </FormSection>

      <Button
        type="button"
        variant="filled"
        fullWidth
        onClick={() => sendOTP()}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </Button>
    </>
  );
}

export function OTPStage({
  form,
  errors,
  blurredFields,
  loading,
  otpRef,
  handleChange,
  handleBlur,
  sendOTP,
  handlePreviousStage,
  handleNextStage,
}) {
  return (
    <>
      <FormSection ref={otpRef}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-md)',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: 1, marginTop: 'var(--border-md)' }}>
            <TextField
              label="OTP"
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              onBlur={() => handleBlur('otp')}
              error={blurredFields.otp && !!errors.otp}
              fullWidth
            />
          </div>
          <Button
            type="button"
            variant="outlined"
            onClick={() => sendOTP(true)}
            disabled={loading}
          >
            Resend OTP
          </Button>
        </div>
        {blurredFields.otp && errors.otp && (
          <Message type="error" message={errors.otp} />
        )}
      </FormSection>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <BackButton onClick={handlePreviousStage} />
        <Button
          type="button"
          variant="filled"
          fullWidth
          onClick={handleNextStage}
          disabled={loading}
        >
          Next
        </Button>
      </div>
    </>
  );
}

export function PasswordStage({
  form,
  errors,
  blurredFields,
  loading,
  passwordRef,
  handleChange,
  handleBlur,
  handlePreviousStage,
  handleSubmit,
}) {
  return (
    <>
      <FormSection ref={passwordRef}>
        <PasswordField
          label="New Password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          onBlur={() => handleBlur('newPassword')}
          error={blurredFields.newPassword && !!errors.newPassword}
          fullWidth
        />
        {blurredFields.newPassword && errors.newPassword && (
          <Message type="error" message={errors.newPassword} />
        )}
      </FormSection>

      <FormSection>
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleBlur('confirmPassword')}
          error={blurredFields.confirmPassword && !!errors.confirmPassword}
          fullWidth
        />
        {blurredFields.confirmPassword && errors.confirmPassword && (
          <Message type="error" message={errors.confirmPassword} />
        )}
      </FormSection>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <BackButton onClick={handlePreviousStage} />
        <Button
          type="submit"
          variant="filled"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </div>
    </>
  );
}
