export interface UserProfile {
  name: string;
  email: string;
  organization: string;
  clearanceLevel: 'level1' | 'level2' | 'level3';
  passwordHash: string;
  registeredAt: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  levelLabel: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG';
  errors: string[];
}

const STORAGE_USERS_KEY = 'gridguard_registered_operators_v1';
const STORAGE_RESET_TOKENS_KEY = 'gridguard_active_reset_tokens_v1';
const STORAGE_CURRENT_USER_KEY = 'gridguard_authenticated_user_v1';

// Seed default system operators if none exist
const DEFAULT_OPERATORS: UserProfile[] = [
  {
    name: 'Chief Dispatcher Vance',
    email: 'dispatcher.alpha@gridguard.utility',
    organization: 'National Grid Control Alpha',
    clearanceLevel: 'level3',
    passwordHash: 'Omega-7-HighVoltage',
    registeredAt: new Date('2024-01-01').toISOString()
  },
  {
    name: 'Lead Eng. Marcus Chen',
    email: 'field.dispatch@pacificgrid.gov',
    organization: 'Pacific Grid RTO',
    clearanceLevel: 'level2',
    passwordHash: 'GridCrew-2024-Safe',
    registeredAt: new Date('2024-03-15').toISOString()
  }
];

export function getStoredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_OPERATORS));
      return DEFAULT_OPERATORS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_OPERATORS;
  }
}

export function saveUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to persist users to localStorage', e);
  }
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // Validates standard emails and official utility/SCADA domains (.utility, .gov, .org, .com, etc.)
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    errors.push('Minimum 8 characters required');
  } else {
    score++;
  }

  if (/[A-Z]/.test(password)) score++;
  else errors.push('At least one uppercase letter required');

  if (/[0-9]/.test(password)) score++;
  else errors.push('At least one numerical digit required');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  else errors.push('At least one special character required');

  let levelLabel: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG' = 'WEAK';
  if (score === 4) levelLabel = 'STRONG';
  else if (score === 3) levelLabel = 'GOOD';
  else if (score === 2) levelLabel = 'FAIR';

  return {
    isValid: errors.length === 0,
    score,
    levelLabel,
    errors
  };
}

export function loginUser(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
  if (!email || !password) {
    return { success: false, error: 'Operator ID and Security Key are mandatory.' };
  }

  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!foundUser) {
    return { success: false, error: 'Operator ID not recognized in SCADA directory. Please verify email or register.' };
  }

  if (foundUser.passwordHash !== password) {
    return { success: false, error: 'Access Denied: Invalid Security Clearance Key provided.' };
  }

  try {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(foundUser));
  } catch {}

  return { success: true, user: foundUser };
}

export function registerUser(userData: {
  name: string;
  organization: string;
  email: string;
  clearanceLevel: 'level1' | 'level2' | 'level3';
  password: string;
}): { success: boolean; user?: UserProfile; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = userData.email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An operator account is already registered under this utility email.' };
  }

  const newUser: UserProfile = {
    name: userData.name.trim(),
    organization: userData.organization.trim(),
    email: normalizedEmail,
    clearanceLevel: userData.clearanceLevel,
    passwordHash: userData.password,
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  try {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
  } catch {}

  return { success: true, user: newUser };
}

export function getCurrentlyLoggedInUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  } catch {}
}

/**
 * Generates and dispatches a simulated cryptographic password reset token to the given email
 */
export function sendPasswordResetEmail(email: string): {
  success: boolean;
  token?: string;
  expiresInMinutes?: number;
  error?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return {
      success: false,
      error: 'No active operator registered with this email in the SCADA network.'
    };
  }

  // Generate 6-digit random code
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  try {
    const tokens = JSON.parse(localStorage.getItem(STORAGE_RESET_TOKENS_KEY) || '{}');
    tokens[normalizedEmail] = { token, expiresAt };
    localStorage.setItem(STORAGE_RESET_TOKENS_KEY, JSON.stringify(tokens));
  } catch {}

  console.log(`[DISPATCH EMAIL SIMULATOR] Sent recovery code ${token} to ${email}`);

  return {
    success: true,
    token,
    expiresInMinutes: 10
  };
}

export function verifyResetToken(email: string, token: string): { success: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const tokens = JSON.parse(localStorage.getItem(STORAGE_RESET_TOKENS_KEY) || '{}');
    const stored = tokens[normalizedEmail];

    if (!stored) {
      return { success: false, error: 'No active reset token found. Please request a new recovery code.' };
    }

    if (Date.now() > stored.expiresAt) {
      return { success: false, error: 'Verification token has expired (10 min limit exceeded). Please request a new code.' };
    }

    if (stored.token !== token.trim()) {
      return { success: false, error: 'Incorrect 6-digit cryptographic verification code.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Token verification failed. Please try again.' };
  }
}

export function resetPasswordWithToken(
  email: string,
  token: string,
  newPassword: string
): { success: boolean; error?: string } {
  const verifyRes = verifyResetToken(email, token);
  if (!verifyRes.success) return verifyRes;

  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);

  if (userIndex === -1) {
    return { success: false, error: 'User record not found.' };
  }

  users[userIndex].passwordHash = newPassword;
  saveUsers(users);

  // Invalidate token after successful reset
  try {
    const tokens = JSON.parse(localStorage.getItem(STORAGE_RESET_TOKENS_KEY) || '{}');
    delete tokens[normalizedEmail];
    localStorage.setItem(STORAGE_RESET_TOKENS_KEY, JSON.stringify(tokens));
  } catch {}

  return { success: true };
}
