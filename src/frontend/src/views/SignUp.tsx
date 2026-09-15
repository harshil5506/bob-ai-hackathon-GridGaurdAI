import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PowerStationBackground } from '../components/PowerStationBackground';
import { registerUser, validateEmail, validatePassword } from '../services/authService';
import './Auth.css';
import { Shield, User, Lock, Mail, Building2, ArrowRight, CheckCircle2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [clearanceLevel, setClearanceLevel] = useState<'level1' | 'level2' | 'level3'>('level2');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Real-time password strength evaluation
  const passStrength = useMemo(() => {
    return validatePassword(password);
  }, [password]);

  const handleValidation = () => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 3) {
      errs.name = 'Full name must be at least 3 characters.';
    }

    if (!organization.trim()) {
      errs.organization = 'Utility organization is required.';
    }

    if (!email.trim()) {
      errs.email = 'Official utility email is required.';
    } else if (!validateEmail(email)) {
      errs.email = 'Invalid email syntax (e.g. name@utility.com).';
    }

    if (!password) {
      errs.password = 'Access key is required.';
    } else if (password.length < 8) {
      errs.password = 'Key must be at least 8 characters long.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Keys do not match.';
    }

    if (!agreeTerms) {
      errs.terms = 'Must certify adherence to IEEE-1547 / NERC-CIP protocols.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!handleValidation()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = registerUser({
        name,
        organization,
        email,
        clearanceLevel,
        password
      });

      if (res.success && res.user) {
        setSuccessMsg(`ENROLLMENT SUCCESSFUL // CLEARANCE ${clearanceLevel.toUpperCase()} ISSUED`);
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Enrollment rejected by SCADA registry.');
      }
    }, 700);
  };

  return (
    <div className="auth-page-container">
      {/* Interactive Generating Station Electricity Background */}
      <PowerStationBackground />

      <div className="auth-card" style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-badge">
            <Shield size={13} />
            <span>OPERATOR ENROLLMENT // SCADA ACCESS REGISTRY</span>
          </div>
          <h1 className="auth-title">ENROLL OPERATOR</h1>
          <p className="auth-subtitle">Request Security Clearance for GridGuard AI Control Matrix</p>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="auth-alert auth-alert-success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="auth-alert auth-alert-error">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name & Organization */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                <span>OPERATOR NAME</span>
              </label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  style={fieldErrors.name ? { borderColor: 'var(--accent-red)' } : {}}
                  placeholder="Eng. Alex Vance"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                  }}
                />
              </div>
              {fieldErrors.name && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{fieldErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="org">
                <span>UTILITY / RTO</span>
              </label>
              <div className="input-wrapper">
                <Building2 size={16} className="input-icon" />
                <input
                  id="org"
                  type="text"
                  className="form-input"
                  style={fieldErrors.organization ? { borderColor: 'var(--accent-red)' } : {}}
                  placeholder="Pacific Grid RTO"
                  value={organization}
                  onChange={(e) => {
                    setOrganization(e.target.value);
                    if (fieldErrors.organization) setFieldErrors({ ...fieldErrors, organization: '' });
                  }}
                />
              </div>
              {fieldErrors.organization && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{fieldErrors.organization}</span>
              )}
            </div>
          </div>

          {/* Official Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              <span>UTILITY WORK EMAIL / OPERATOR ID</span>
            </label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="signup-email"
                type="email"
                className="form-input"
                style={fieldErrors.email ? { borderColor: 'var(--accent-red)' } : {}}
                placeholder="alex.vance@pacificgrid.utility"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
              />
            </div>
            {fieldErrors.email && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{fieldErrors.email}</span>
            )}
          </div>

          {/* Clearance Level Selector */}
          <div className="form-group">
            <label className="form-label">ASSIGNED OPERATIONAL CLEARANCE</label>
            <div className="clearance-grid">
              <div
                className={`clearance-option ${clearanceLevel === 'level1' ? 'selected' : ''}`}
                onClick={() => setClearanceLevel('level1')}
              >
                <span className="clearance-title">LVL 1 // MONITOR</span>
                <span className="clearance-desc">Telemetry & IoT Readouts</span>
              </div>

              <div
                className={`clearance-option ${clearanceLevel === 'level2' ? 'selected' : ''}`}
                onClick={() => setClearanceLevel('level2')}
              >
                <span className="clearance-title">LVL 2 // DISPATCH</span>
                <span className="clearance-desc">Crew & Work Orders</span>
              </div>

              <div
                className={`clearance-option ${clearanceLevel === 'level3' ? 'selected' : ''}`}
                onClick={() => setClearanceLevel('level3')}
              >
                <span className="clearance-title">LVL 3 // CHIEF</span>
                <span className="clearance-desc">Full Grid Mitigation</span>
              </div>
            </div>
          </div>

          {/* Password & Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-pass">
                <span>ACCESS KEY</span>
              </label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="signup-pass"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={fieldErrors.password ? { borderColor: 'var(--accent-red)' } : {}}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pass">
                <span>CONFIRM KEY</span>
              </label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="confirm-pass"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={fieldErrors.confirmPassword ? { borderColor: 'var(--accent-red)' } : {}}
                  placeholder="Repeat key"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div style={{ margin: '2px 0 6px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>KEY STRENGTH:</span>
                <span
                  style={{
                    fontWeight: 'bold',
                    color:
                      passStrength.levelLabel === 'STRONG'
                        ? 'var(--accent-green)'
                        : passStrength.levelLabel === 'GOOD'
                        ? 'var(--accent-cyan)'
                        : passStrength.levelLabel === 'FAIR'
                        ? 'var(--accent-orange)'
                        : 'var(--accent-red)'
                  }}
                >
                  {passStrength.levelLabel}
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(passStrength.score / 4) * 100}%`,
                    background:
                      passStrength.score === 4
                        ? 'var(--accent-green)'
                        : passStrength.score === 3
                        ? 'var(--accent-cyan)'
                        : passStrength.score === 2
                        ? 'var(--accent-orange)'
                        : 'var(--accent-red)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Regulatory Agreement */}
          <div className="form-group">
            <label className="checkbox-label" style={{ marginTop: '0.2rem' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: '' });
                }}
              />
              <span style={{ fontSize: '0.78rem' }}>
                I certify adherence to IEEE-1547 and NERC-CIP Grid Reliability protocols.
              </span>
            </label>
            {fieldErrors.terms && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{fieldErrors.terms}</span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            <span>{loading ? 'ENROLLING IN GRID SYSTEM...' : 'INITIALIZE OPERATOR CLEARANCE'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <div>
            ALREADY HOLD CLEARANCE?{' '}
            <Link to="/signin" className="auth-link font-bold">
              LOG IN TO TERMINAL ➔
            </Link>
          </div>
          <div className="compliance-badge">
            GRIDGUARD AI SECURE ENCLAVE • END-TO-END CRYPTOGRAPHICALLY AUDITED
          </div>
        </div>
      </div>
    </div>
  );
};
