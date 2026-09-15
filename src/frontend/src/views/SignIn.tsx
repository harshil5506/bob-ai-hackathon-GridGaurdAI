import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PowerStationBackground } from '../components/PowerStationBackground';
import { loginUser, validateEmail } from '../services/authService';
import './Auth.css';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleValidateFields = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Operator ID or Email is required.';
    } else if (!validateEmail(email)) {
      errors.email = 'Invalid email syntax. Example: name@utility.com';
    }

    if (!password) {
      errors.password = 'Clearance key is required.';
    } else if (password.length < 6) {
      errors.password = 'Key must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!handleValidateFields()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = loginUser(email, password);

      if (res.success && res.user) {
        setSuccessMsg(`ACCESS GRANTED // WELCOME ${res.user.name.toUpperCase()}`);
        setTimeout(() => {
          navigate('/profile');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 600);
  };

  const handleDemoFill = (role: 'chief' | 'field') => {
    setErrorMsg('');
    setFieldErrors({});
    if (role === 'chief') {
      setEmail('dispatcher.alpha@gridguard.utility');
      setPassword('Omega-7-HighVoltage');
    } else {
      setEmail('field.dispatch@pacificgrid.gov');
      setPassword('GridCrew-2024-Safe');
    }
  };

  return (
    <div className="auth-page-container">
      {/* Interactive Generating Station Electricity Background */}
      <PowerStationBackground />

      <div className="auth-card">
        {/* Card Header */}
        <div className="auth-header">
          <div className="auth-badge">
            <Shield size={13} />
            <span>SCADA TERMINAL CLEARANCE // LEVEL 3</span>
          </div>
          <h1 className="auth-title">GRIDGUARD AI</h1>
          <p className="auth-subtitle">Power Outage Prediction & Equipment Failure Advisor</p>
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

        {/* Authentication Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Operator ID / Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <span>OPERATOR ID / UTILITY EMAIL</span>
              {fieldErrors.email && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>{fieldErrors.email}</span>
              )}
            </label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-input"
                style={fieldErrors.email ? { borderColor: 'var(--accent-red)' } : {}}
                placeholder="dispatcher.alpha@gridguard.utility"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="password">SECURITY CLEARANCE KEY</label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.75rem' }}>
                FORGOT KEY?
              </Link>
            </div>
            {fieldErrors.password && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.72rem', marginBottom: '2px' }}>
                {fieldErrors.password}
              </span>
            )}
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={fieldErrors.password ? { borderColor: 'var(--accent-red)' } : {}}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="form-row-between">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>REMEMBER DISPATCH TERMINAL</span>
            </label>
            <span className="text-cyan" style={{ fontSize: '0.75rem' }}>⚡ 500kV FEED ACTIVE</span>
          </div>

          {/* Submit Button */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            <span>{loading ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE OPERATOR'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* 1-Click Quick Demo Login */}
        <div className="demo-access-box">
          <div className="demo-title">
            <Zap size={13} className="text-cyan" />
            <span>PRE-LOADED DEMO CREDENTIALS:</span>
          </div>
          <div className="demo-btns">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoFill('chief')}
            >
              CHIEF CONTROLLER
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoFill('field')}
            >
              FIELD DISPATCHER
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <div>
            NEW GRID ENGINEER?{' '}
            <Link to="/signup" className="auth-link font-bold">
              REQUEST OPERATOR CLEARANCE ➔
            </Link>
          </div>
          <div className="compliance-badge">
            IEEE-1547 / NERC-CIP CYBER PROTOCOL • IBM BOB & WATSONX AI SECURED
          </div>
        </div>
      </div>
    </div>
  );
};
