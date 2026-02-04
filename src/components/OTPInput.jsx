export default function OTPInput({
  otpValue,
  onOtpChange,
  onSendOTP,
  emailValue,
  loading
}) {
  return (
    <div className="form-group">
      <label htmlFor="otp">OTP Code</label>
      <div className="otp-input-group">
        <input
          type="text"
          name="otp"
          id="otp"
          value={otpValue}
          onChange={onOtpChange}
          placeholder="Enter OTP"
          required
        />
        <button
          type="button"
          className="otp-btn"
          onClick={onSendOTP}
          disabled={loading || !emailValue}
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}
