/**
 * Client-Side Local Database for User Authentication & Persistent Sessions
 * Uses browser localStorage with in-memory fallback for SSR compatibility.
 */

const STORAGE_USERS_KEY = 'graminai_users_db_v1';
const STORAGE_SESSION_KEY = 'graminai_active_session_v1';

// Seed default accounts
const SEED_USERS = [
  {
    id: 'UP-STP-008129',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@graminai.org',
    phone: '9876543210',
    pin: '2026',
    category: 'Scheduled Caste (SC)',
    trade: 'D08 Mustard & Edible Oil Expeller Mill',
    district: 'Sitapur District, UP',
    income: '≤ ₹5,00,000',
    verified: true,
    authProvider: 'phone',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'UP-STP-004312',
    name: 'Sunita Devi',
    email: 'sunita.devi@graminai.org',
    phone: '9876543211',
    pin: '2026',
    category: 'Scheduled Caste (SC)',
    trade: 'D18 Village Tailoring & Garments',
    district: 'Sitapur District, UP',
    income: '≤ ₹5,00,000',
    verified: true,
    authProvider: 'phone',
    createdAt: '2026-01-12T00:00:00.000Z'
  }
];

// In-memory fallback for SSR
let inMemoryUsers = [...SEED_USERS];
let inMemorySession = null;

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getAllUsers() {
  if (!hasLocalStorage()) return inMemoryUsers;
  try {
    const raw = window.localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('userDatabase: Error reading users from localStorage', err);
    return inMemoryUsers;
  }
}

function persistUsers(users) {
  inMemoryUsers = users;
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('userDatabase: Error writing users to localStorage', err);
  }
}

export function getUserByPhone(phone) {
  const users = getAllUsers();
  return users.find(u => u.phone === phone?.trim()) || null;
}

export function getUserByEmail(email) {
  const users = getAllUsers();
  return users.find(u => u.email?.toLowerCase() === email?.toLowerCase()?.trim()) || null;
}

export function authenticateByCredentials(phone, pin) {
  const user = getUserByPhone(phone);
  if (!user) {
    return { success: false, error: 'User not found with this mobile number.' };
  }
  if (user.pin && user.pin !== pin?.trim()) {
    return { success: false, error: 'Incorrect 4-digit PIN.' };
  }
  saveSession(user);
  return { success: true, user };
}

export function authenticateByGoogle(googleProfile = null) {
  const profile = googleProfile || {
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar.sc@gmail.com',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIqK_demo=s96-c'
  };

  const users = getAllUsers();
  let user = getUserByEmail(profile.email);

  if (!user) {
    // Auto-register new Google user with default verified SC status for platform demo
    user = {
      id: `UP-GOOG-${Math.floor(100000 + Math.random() * 900000)}`,
      name: profile.name || 'Google User',
      email: profile.email,
      avatar: profile.avatar || null,
      phone: profile.phone || '9876543210',
      category: 'Scheduled Caste (SC)',
      trade: 'D08 Mustard & Edible Oil Expeller Mill',
      district: 'Sitapur District, UP',
      income: '≤ ₹5,00,000',
      verified: true,
      authProvider: 'google',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    persistUsers(users);
  } else {
    // Update existing user with Google provider flag and avatar
    user.authProvider = 'google';
    if (profile.avatar) user.avatar = profile.avatar;
    persistUsers(users);
  }

  saveSession(user);
  return { success: true, user };
}

export function registerUser({ name, phone, pin, trade, category, email }) {
  const users = getAllUsers();
  
  if (phone && getUserByPhone(phone)) {
    return { success: false, error: 'A user with this mobile number is already registered.' };
  }

  const newUser = {
    id: `UP-REG-${Math.floor(100000 + Math.random() * 900000)}`,
    name: name?.trim() || 'Rural Entrepreneur',
    email: email || `${phone || 'user'}@graminai.org`,
    phone: phone?.trim() || '9876543210',
    pin: pin?.trim() || '2026',
    category: category || 'Scheduled Caste (SC)',
    trade: trade || 'D08 Mustard & Edible Oil Expeller Mill',
    district: 'Sitapur District, UP',
    income: '≤ ₹5,00,000',
    verified: true,
    authProvider: 'local',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  persistUsers(users);
  saveSession(newUser);
  return { success: true, user: newUser };
}

export function getCurrentSession() {
  if (!hasLocalStorage()) return inMemorySession;
  try {
    const raw = window.localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('userDatabase: Error reading session from localStorage', err);
    return inMemorySession;
  }
}

export function saveSession(user) {
  inMemorySession = user;
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('userDatabase: Error writing session to localStorage', err);
  }
}

export function clearSession() {
  inMemorySession = null;
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.warn('userDatabase: Error removing session from localStorage', err);
  }
}
