import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PowerStationBackground } from '../components/PowerStationBackground';
import {
  sendPasswordResetEmail,
  verifyResetToken,
  resetPasswordWithToken,
  validateEmail,
  validatePassword
} from '../services/authService';
import './Auth.css';
import {
  ShieldAlert,
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Inbox
} from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dispatchedToken, setDispatchedToken] = useState<string | null>(null);
  const [showEmailBanner, setShowEmailBanner] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown

  // Countdown timer for active token
  useEffect(() => {
    let timer: any;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendToken = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your utility operator email.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Invalid email format. Please enter a valid address (e.g. dispatcher.alpha@gridguard.utility)');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = sendPasswordResetEmail(email);

      if (res.success && res.token) {
        setDispatchedToken(res.token);
        setShowEmailBanner(true);
        setStep(2);
        setTimeLeft(600);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch recovery token.');
      }
    }, 700);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    // Auto-advance focus to next digit
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (dispatchedToken && dispatchedToken.length === 6) {
      setOtp(dispatchedToken.split(''));
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const enteredToken = otp.join('');
    if (enteredToken.length < 6) {
      setErrorMsg('Please input all 6 digits of the cryptographic token sent to your email.');
      return;
    }

    // Verify token validity
    const tokenCheck = verifyResetToken(email, enteredToken);
    if (!tokenCheck.success) {
      setErrorMsg(tokenCheck.error || 'Invalid verification token.');
      return;
    }

    // Validate new password strength
    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      setErrorMsg(passCheck.errors[0] || 'Password does not meet industrial complexity requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New clearance passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = resetPasswordWithToken(email, enteredToken, newPassword);

      if (res.success) {
        setStep(3);
      } else {
        setErrorMsg(res.error || 'Password reset failed.');
      }
    }, 800);
  };

  return (
    <div className="auth-page-container">
      {/* Interactive Generating Station Electricity Background */}
      <PowerStationBackground />

      <div className="auth-card" style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-badge" style={{ borderColor: '#ffaa00', color: '#ffaa00', background: 'rgba(255,170,0,0.1)' }}>
            <ShieldAlert size={13} />
            <span>EMERGENCY RECOVERY // SCADA PROTOCOL</span>
          </div>
          <h1 className="auth-title">RECOVER ACCESS</h1>
          <p className="auth-subtitle">
            {step === 1 && 'Dispatch Cryptographic Recovery Token to Authorized Email'}
            {step === 2 && 'Verify 6-Digit Email Code & Set New Security Key'}
            {step === 3 && 'Security Key Synchronized Successfully'}
          </p>
        </div>

        {/* Error Feedback Message */}
        {errorMsg && (
          <div className="auth-alert auth-alert-error">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Simulated Incoming Email Notification Card */}
        {showEmailBanner && dispatchedToken && step === 2 && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.15) 0%, rgba(0, 100, 255, 0.1) 100%)',
              border: '1px solid var(--accent-cyan)',
              boxShadow: '0 0 20px rgba(0, 243, 255, 0.25)',
              padding: '12px 14px',
              borderRadius: '6px',
              marginBottom: '1rem',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 'bold' }}>
                <Inbox size={15} />
                <span>INCOMING TRANSMISSION // UTILITY MAIL DISPATCH</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-green)', background: 'rgba(0,255,102,0.15)', padding: '2px 6px', border: '1px solid var(--accent-green)', borderRadius: '3px' }}>
                DELIVERED
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              To: <strong style={{ color: '#ffffff' }}>{email}</strong>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Subject: <em>GridGuard AI Security Token: </em>
              <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', letterSpacing: '0.12em' }}>
                {dispatchedToken}
              </strong>
            </div>

            <button
              type="button"
              onClick={handleAutoFillOtp}
              style={{
                marginTop: '8px',
                background: 'rgba(0, 243, 255, 0.2)',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                fontSize: '0.72rem',
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '4px'
              }}
            >
              <Sparkles size={12} />
              <span>AUTO-PASTE VERIFICATION TOKEN ({dispatchedToken})</span>
            </button>
          </div>
        )}

        {/* STEP 1: Enter Operator Email */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleSendToken} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="recovery-email">OPERATOR REGISTERED EMAIL</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="recovery-email"
                  type="email"
                  className="form-input"
                  placeholder="dispatcher.alpha@gridguard.utility"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              ℹ️ A 6-digit cryptographic security code will be sent to your registered mail to authorize an emergency key reset.
            </p>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <Send size={16} />
              <span>{loading ? 'SENDING EMAIL...' : 'DISPATCH RECOVERY EMAIL'}</span>
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-Digit OTP & New Password */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleResetPassword} noValidate>
            <div className="form-group">
              <div className="form-row-between">
                <label className="form-label">ENTER 6-DIGIT EMAIL CODE</label>
                <span style={{ fontSize: '0.75rem', color: timeLeft < 60 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                  TOKEN EXPIRES IN {formatTimer(timeLeft)}
                </span>
              </div>

              <div className="otp-container">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    className="otp-digit"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-key">NEW CLEARANCE KEY</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="new-key"
                  type="password"
                  className="form-input"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-key">CONFIRM NEW KEY</label>
              <div className="input-wrapper">
                <KeyRound size={16} className="input-icon" />
                <input
                  id="confirm-new-key"
                  type="password"
                  className="form-input"
                  placeholder="Repeat new key"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? 'SYNCHRONIZING KEY...' : 'VALIDATE TOKEN & RESET PASSWORD'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* STEP 3: Complete */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1.2rem 0' }}>
            <CheckCircle2 size={56} className="text-green" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
              CLEARANCE KEY RESET SUCCESSFUL
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Your operator account has been updated with your new security key. You can now authenticate and enter the control matrix.
            </p>
            <button
              type="button"
              className="auth-submit-btn"
              style={{ width: '100%' }}
              onClick={() => navigate('/signin')}
            >
              <span>PROCEED TO OPERATOR SIGN IN</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Footer Link */}
        <div className="auth-footer">
          <Link to="/signin" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <ArrowLeft size={14} />
            <span>RETURN TO OPERATOR SIGN IN</span>
          </Link>
          <div className="compliance-badge">
            NERC CIP-005-7 SECURE ELECTRONIC ACCESS VALIDATION
          </div>
        </div>
      </div>
    </div>
  );
};
