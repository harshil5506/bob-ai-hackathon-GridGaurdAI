import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getCurrentlyLoggedInUser,
  logoutUser,
  loginUser,
  UserProfile,
  validatePassword
} from '../services/authService';
import './Profile.css';
import {
  Shield,
  User,
  Building2,
  Mail,
  Zap,
  Activity,
  Lock,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Key,
  Radio
} from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load current user or default Chief Dispatcher
  useEffect(() => {
    const current = getCurrentlyLoggedInUser();
    if (current) {
      setUser(current);
    } else {
      // Default to Chief Operator if not yet signed in
      const defaultLogin = loginUser('dispatcher.alpha@gridguard.utility', 'Omega-7-HighVoltage');
      if (defaultLogin.user) {
        setUser(defaultLogin.user);
      }
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/signin');
  };

  const handleRoleSwitch = (role: 'chief' | 'field') => {
    const creds =
      role === 'chief'
        ? { email: 'dispatcher.alpha@gridguard.utility', pass: 'Omega-7-HighVoltage' }
        : { email: 'field.dispatch@pacificgrid.gov', pass: 'GridCrew-2024-Safe' };

    const res = loginUser(creds.email, creds.pass);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!user) return;

    if (oldPassword !== user.passwordHash) {
      setPasswordError('Current security key is incorrect.');
      return;
    }

    const val = validatePassword(newPassword);
    if (!val.isValid) {
      setPasswordError(val.errors[0] || 'Key does not meet industrial complexity requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New keys do not match.');
      return;
    }

    // Update in stored users
    user.passwordHash = newPassword;
    try {
      localStorage.setItem('gridguard_authenticated_user_v1', JSON.stringify(user));
      setPasswordSuccess('Security Clearance Key updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordChange(false), 1200);
    } catch {
      setPasswordError('Failed to persist key changes.');
    }
  };

  if (!user) {
    return (
      <div className="profile-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <p className="text-secondary">Loading Operator Profile...</p>
      </div>
    );
  }

  const clearanceLabel =
    user.clearanceLevel === 'level3'
      ? 'LEVEL 3 // CHIEF CONTROLLER'
      : user.clearanceLevel === 'level2'
      ? 'LEVEL 2 // FIELD DISPATCHER'
      : 'LEVEL 1 // TELEMETRY MONITOR';

  return (
    <div className="profile-container">
      {/* 1. Header Identity Card */}
      <div className="profile-header-card">
        <div className="operator-identity">
          <div className="operator-avatar">
            <div className="avatar-pulse"></div>
            <User size={36} />
          </div>
          <div className="operator-details">
            <h2>{user.name}</h2>
            <div className="operator-meta">
              <span>
                <Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {user.organization}
              </span>
              <span>•</span>
              <span>
                <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {user.email}
              </span>
              <span>•</span>
              <span className="text-cyan">
                <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {clearanceLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/" className="btn-profile-action">
            <Zap size={14} />
            <span>DISPATCH CONSOLE</span>
          </Link>
          <button className="btn-profile-action btn-danger" onClick={handleLogout}>
            <LogOut size={14} />
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </div>

      {/* 2. Operational SCADA Telemetry & Performance Stats */}
      <div className="profile-stats-grid">
        <div className="hud-panel stat-panel">
          <div className="stat-header">
            <span>GRID CONTROL STATUS</span>
            <Radio size={14} className="text-green" />
          </div>
          <div className="stat-value text-green">ONLINE</div>
          <div className="stat-desc">Sector 4 // High Voltage Corridor</div>
        </div>

        <div className="hud-panel stat-panel">
          <div className="stat-header">
            <span>DISPATCHED CREW UNITS</span>
            <Activity size={14} className="text-cyan" />
          </div>
          <div className="stat-value text-cyan">24 FLEETS</div>
          <div className="stat-desc">Pre-positioned Strike Teams Active</div>
        </div>

        <div className="hud-panel stat-panel">
          <div className="stat-header">
            <span>AI MITIGATION ACCURACY</span>
            <Zap size={14} className="text-orange" />
          </div>
          <div className="stat-value text-orange">98.4%</div>
          <div className="stat-desc">IBM Bob Watsonx Model Validated</div>
        </div>

        <div className="hud-panel stat-panel">
          <div className="stat-header">
            <span>SCADA PROTOCOL AUDIT</span>
            <Shield size={14} className="text-cyan" />
          </div>
          <div className="stat-value text-primary">NERC-CIP</div>
          <div className="stat-desc">Zero Vulnerabilities Detected</div>
        </div>
      </div>

      {/* 3. Main 2-Column Content: Security & Recent Actions */}
      <div className="profile-body-grid">
        {/* Left Column: Security & Role Controls */}
        <div className="hud-panel">
          <h3 className="profile-section-title">
            <Lock size={18} />
            <span>SECURITY CREDENTIALS & CLEARANCE</span>
          </h3>

          <div className="security-list">
            <div className="security-item">
              <span className="sec-label">
                <Shield size={14} className="text-cyan" /> OPERATIONAL ROLE
              </span>
              <span className="sec-val text-cyan">{clearanceLabel}</span>
            </div>

            <div className="security-item">
              <span className="sec-label">
                <CheckCircle2 size={14} className="text-green" /> 2FA HARDWARE AUTH
              </span>
              <span className="sec-val text-green">ENFORCED (U2F KEY)</span>
            </div>

            <div className="security-item">
              <span className="sec-label">
                <Key size={14} className="text-orange" /> CLEARANCE KEY STATUS
              </span>
              <span className="sec-val text-primary">ACTIVE • ROTATION DUE IN 45 DAYS</span>
            </div>

            <div className="security-item">
              <span className="sec-label">
                <Zap size={14} className="text-cyan" /> TERMINAL ENCRYPTION
              </span>
              <span className="sec-val text-cyan">AES-256-GCM / TLS 1.3</span>
            </div>
          </div>

          {/* Role Switching Simulator for Hackathon Demonstrations */}
          <div style={{ marginTop: '16px', borderTop: '1px dashed rgba(0,243,255,0.2)', paddingTop: '14px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              ⚡ DEMO ROLE SWITCHER (INSTANT CLEARANCE LEVEL TOGGLE):
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-profile-action"
                style={{ flex: 1, fontSize: '0.78rem', padding: '6px' }}
                onClick={() => handleRoleSwitch('chief')}
              >
                CHIEF CONTROLLER (LVL 3)
              </button>
              <button
                type="button"
                className="btn-profile-action"
                style={{ flex: 1, fontSize: '0.78rem', padding: '6px' }}
                onClick={() => handleRoleSwitch('field')}
              >
                FIELD DISPATCHER (LVL 2)
              </button>
            </div>
          </div>

          {/* Change Password Collapsible Section */}
          <div style={{ marginTop: '18px' }}>
            <button
              type="button"
              className="btn-profile-action"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              <Key size={14} />
              <span>{showPasswordChange ? 'CANCEL KEY ROTATION' : 'UPDATE SECURITY CLEARANCE KEY'}</span>
            </button>

            {showPasswordChange && (
              <form onSubmit={handleChangePassword} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {passwordError && (
                  <div className="auth-alert auth-alert-error" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
                    <AlertTriangle size={14} />
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="auth-alert auth-alert-success" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
                    <CheckCircle2 size={14} />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT SECURITY KEY</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NEW CLEARANCE KEY (MIN 8 CHARS)</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONFIRM NEW KEY</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repeat new key"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" style={{ padding: '8px', fontSize: '0.85rem' }}>
                  <span>SAVE & ROTATE KEY</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Dispatch Action Log & Audit History */}
        <div className="hud-panel">
          <h3 className="profile-section-title">
            <History size={18} />
            <span>RECENT OPERATOR AUDIT TRAIL</span>
          </h3>

          <div className="audit-list">
            <div className="audit-item">
              <div className="audit-time">TODAY // 14:12:04 UTC</div>
              <div className="audit-desc">
                Authorized field pre-positioning order for <strong>Crew 03 (Heavy Duty)</strong> to Sector 4 staging ground.
              </div>
            </div>

            <div className="audit-item">
              <div className="audit-time">TODAY // 13:48:20 UTC</div>
              <div className="audit-desc">
                Acknowledged critical thermal alert on <strong>SUB-001 (Northside Substation Alpha)</strong> — 112°C.
              </div>
            </div>

            <div className="audit-item">
              <div className="audit-time">TODAY // 11:30:15 UTC</div>
              <div className="audit-desc">
                Executed predictive storm simulation with hyper-local weather compounding risk model.
              </div>
            </div>

            <div className="audit-item">
              <div className="audit-time">YESTERDAY // 18:05:42 UTC</div>
              <div className="audit-desc">
                Operator credentials authenticated via SCADA Terminal Node 04. Clearance verified.
              </div>
            </div>

            <div className="audit-item">
              <div className="audit-time">YESTERDAY // 09:20:11 UTC</div>
              <div className="audit-desc">
                Generated IEEE-compliant transformer health diagnostic summary for regulatory archival.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              LOGS IMMUTABLY STORED PER NERC-CIP-007
            </span>
            <button
              type="button"
              className="btn-profile-action"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => alert('SCADA Audit Log exported to PDF / CSV.')}
            >
              <FileText size={13} />
              <span>EXPORT AUDIT LOG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
