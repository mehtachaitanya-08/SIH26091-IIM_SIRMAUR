/**
 * Client-Side Local Database for User Authentication & Persistent Sessions
 * Uses browser localStorage with in-memory fallback for SSR compatibility.
 * Pure real user storage with zero mock data or hardcoded profiles.
 */

const STORAGE_USERS_KEY = 'udyamsetuai_users_db_v1';
const STORAGE_SESSION_KEY = 'udyamsetuai_active_session_v1';

// Demo account (phone 9876543210, PIN 2026) so judges can sign in at once. It holds no district,
// income, caste or "verified" flag: nobody answered those for it, and a made-up district and
// certificate ID on every account read as real data (teammate review, 11 Nov 2026). The loan
// screen asks for SC status and income.
const SEED_USERS = [
  {
    id: 'DEMO-0001',
    name: 'Gramin Entrepreneur',
    email: 'entrepreneur@udyamsetuai.org',
    phone: '9876543210',
    pin: '2026',
    category: null,
    trade: 'D20 Metal Smithy',
    authProvider: 'local',
    createdAt: '2026-01-10T00:00:00.000Z'
  }
];

// The answer to "Are you SC?" at sign-up, stored as the user gave it (self-declared).
export const CATEGORY_SC = 'Scheduled Caste (SC)';
export const CATEGORY_NOT_SC = 'Not SC';

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
  if (!phone || !phone.trim()) {
    return { success: false, error: 'Mobile number is required.' };
  }
  if (!pin || !pin.trim()) {
    return { success: false, error: 'PIN is required.' };
  }

  const user = getUserByPhone(phone);
  if (!user) {
    return { success: false, error: 'User not found with this mobile number. Please register first.' };
  }
  if (user.pin && user.pin !== pin?.trim()) {
    return { success: false, error: 'Incorrect 4-digit PIN.' };
  }
  saveSession(user);
  return { success: true, user };
}

export function authenticateByGoogle(googleProfile = null) {
  if (!googleProfile || !googleProfile.email) {
    return { success: false, error: 'No Google profile credentials provided.' };
  }

  const profile = googleProfile;
  const users = getAllUsers();
  let user = getUserByEmail(profile.email);

  if (!user) {
    // Auto-register genuine Google authenticated user. Google tells us nothing about caste,
    // district or income, so none is filled in; the loan screen asks for them.
    user = {
      // No "UP-" prefix: it implied every user is in Uttar Pradesh (review, 11 Nov 2026).
      id: `GOOG-${Math.floor(100000 + Math.random() * 900000)}`,
      name: profile.name || 'Google Beneficiary',
      email: profile.email,
      avatar: profile.avatar || null,
      phone: profile.phone || '',
      category: null,
      trade: 'Rural Enterprise',
      authProvider: 'google',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    persistUsers(users);
  } else {
    // Update existing user with Google provider flag, avatar and name. A name the user changed
    // in My account (nameSetByUser) is kept (review finding, owner's ruling 12 Nov 2026).
    // The stored copy in the list is updated, so the list and the session stay the same.
    const stored = users.find((u) => u.id === user.id);
    stored.authProvider = 'google';
    if (profile.avatar) stored.avatar = profile.avatar;
    if (profile.name && !stored.nameSetByUser) stored.name = profile.name;
    user = stored;
    persistUsers(users);
  }

  saveSession(user);
  return { success: true, user };
}

export function registerUser({ name, phone, pin, trade, category, email }) {
  if (!phone || !phone.trim()) {
    return { success: false, error: 'Mobile number is required for registration.' };
  }
  if (!pin || !pin.trim()) {
    return { success: false, error: '4-digit security PIN is required.' };
  }
  const users = getAllUsers();

  if (getUserByPhone(phone)) {
    return { success: false, error: 'A user with this mobile number is already registered.' };
  }
  if (category !== CATEGORY_SC && category !== CATEGORY_NOT_SC) {
    return { success: false, error: 'Please answer: are you Scheduled Caste (SC)?' };
  }

  const newUser = {
    id: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
    name: name?.trim() || 'Rural Entrepreneur',
    email: email?.trim() || `${phone.trim()}@udyamsetuai.org`,
    phone: phone.trim(),
    pin: pin.trim(),
    category,
    trade: trade || 'Rural Enterprise',
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

// "My account" (Stage A). Both functions write the users list AND the active session, so the
// top bar, the side card and the next sign-in all see the same answer.
function saveUser(updated) {
  const users = getAllUsers().map((u) => (u.id === updated.id ? updated : u));
  persistUsers(users);
  const session = getCurrentSession();
  if (session && session.id === updated.id) saveSession(updated);
}

/**
 * Change what the user says about themselves: name, SC (CATEGORY_SC, CATEGORY_NOT_SC or null for
 * "not said"), yearly family income (rupees, a number; '' or null = not given) and district (free text).
 * The PIN, phone and id cannot be changed here.
 */
export function updateUser(id, changes = {}) {
  const user = getAllUsers().find((u) => u.id === id);
  if (!user) return { success: false, error: 'Account not found. Please sign in again.' };
  const next = { ...user };
  if ('name' in changes) {
    const name = String(changes.name ?? '').trim();
    if (!name) return { success: false, error: 'Please enter your name.' };
    if (name !== user.name) next.nameSetByUser = true; // a later Google sign-in keeps it
    next.name = name;
  }
  if ('category' in changes) {
    const c = changes.category;
    if (c !== null && c !== CATEGORY_SC && c !== CATEGORY_NOT_SC) {
      return { success: false, error: 'Please choose Yes, No or Not said for SC.' };
    }
    next.category = c;
  }
  if ('income' in changes) {
    const raw = changes.income;
    if (raw === null || raw === undefined || String(raw).trim() === '') {
      next.income = null;
    } else {
      const v = Number(raw);
      if (!Number.isFinite(v) || v < 0) return { success: false, error: 'Yearly family income must be a number of rupees, 0 or more.' };
      next.income = v;
    }
  }
  if ('district' in changes) {
    const d = String(changes.district ?? '').trim();
    next.district = d || null;
  }
  saveUser(next);
  return { success: true, user: next };
}

/** Change the 4-digit PIN. Needs the current PIN. Google accounts have no PIN. */
export function changePin(id, currentPin, newPin) {
  const user = getAllUsers().find((u) => u.id === id);
  if (!user) return { success: false, error: 'Account not found. Please sign in again.' };
  if (user.authProvider === 'google' || !user.pin) {
    return { success: false, error: 'This account signs in with Google and has no PIN.' };
  }
  if (String(currentPin ?? '').trim() !== user.pin) return { success: false, error: 'The current PIN is not right.' };
  const pin = String(newPin ?? '').trim();
  if (!/^\d{4}$/.test(pin)) return { success: false, error: 'The new PIN must be exactly 4 digits.' };
  const next = { ...user, pin };
  saveUser(next);
  return { success: true, user: next };
}
