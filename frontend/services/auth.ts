import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { TranslationKeys } from '../i18n';

const API_BASE = 'http://localhost:8080/api/v1/auth';
const PLAYER_API = 'http://localhost:8080/api/v1/player';
const CLASSROOM_API = 'http://localhost:8080/api/v1/classrooms';
const TOKEN_KEY = 'jwt_token';
const USERNAME_KEY = 'username';

type ApiErrorPayload = {
  code?: string;
  status?: number;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

type ApiClientError = Error & {
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string>;
};

// For web, fall back to localStorage since SecureStore is not available
async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

function buildErrorMessage(payload: ApiErrorPayload | null, fallback: string): string {
  if (!payload) return fallback;

  const fieldErrors = payload.fieldErrors ? Object.values(payload.fieldErrors).filter(Boolean) : [];
  if (fieldErrors.length > 0) {
    return fieldErrors.join('\n');
  }

  return payload.message || fallback;
}

async function throwApiError(res: Response, fallback: string): Promise<never> {
  let payload: ApiErrorPayload | null = null;
  let textBody = '';

  try {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = await res.json();
    } else {
      textBody = (await res.text()).trim();
    }
  } catch {
    // Ignore parse failures and fall back to the provided message.
  }

  const message = buildErrorMessage(payload, textBody || fallback);
  const error = new Error(message) as ApiClientError;
  error.code = payload?.code;
  error.status = payload?.status ?? res.status;
  error.fieldErrors = payload?.fieldErrors;
  throw error;
}

function localizeValidationMessage(
  rawMessage: string,
  t: (key: TranslationKeys) => string,
): string {
  switch (rawMessage) {
    case 'Email is required':
      return t('error_email_required');
    case 'Must be a valid email address':
      return t('error_email_invalid');
    case 'Username is required':
      return t('error_username_required');
    case 'Username must be between 3 and 30 characters':
      return t('error_username_length');
    case 'Password is required':
      return t('error_password_required');
    case 'Password must be at least 6 characters':
      return t('error_password_length');
    case 'Classroom name is required':
      return t('error_classroom_name_required');
    case 'Name must be between 2 and 50 characters':
      return t('error_classroom_name_length');
    case 'Classroom code is required':
      return t('error_classroom_code_required');
    case 'XP must be at least 1':
      return t('error_xp_min');
    default:
      return rawMessage;
  }
}

export function getLocalizedErrorMessage(
  error: unknown,
  t: (key: TranslationKeys) => string,
  fallbackKey: TranslationKeys,
): string {
  const apiError = error as ApiClientError | undefined;
  const rawMessage = apiError?.message;

  if (!rawMessage || rawMessage === 'Failed to fetch' || rawMessage === 'Network request failed') {
    return t(fallbackKey);
  }

  const fieldErrors = apiError?.fieldErrors ? Object.values(apiError.fieldErrors).filter(Boolean) : [];
  if (fieldErrors.length > 0) {
    return fieldErrors.map((message) => localizeValidationMessage(message, t)).join('\n');
  }

  switch (apiError?.code) {
    case 'INVALID_CREDENTIALS':
      return t('error_invalid_credentials');
    case 'CLASSROOM_NOT_FOUND':
      return t('error_classroom_not_found');
    case 'USER_NOT_FOUND':
      return t('error_user_not_found');
    case 'PERK_REQUIREMENT_NOT_MET':
      return t('error_perk_requirement_not_met');
    case 'UNEXPECTED_SERVER_ERROR':
      return t('error_server');
    case 'DUPLICATE_RESOURCE':
      if (rawMessage === 'Username already taken') return t('error_username_taken');
      if (rawMessage === 'Email already taken') return t('error_email_taken');
      return t('error_duplicate_resource');
    case 'VALIDATION_ERROR':
      return localizeValidationMessage(rawMessage, t);
    default:
      if (rawMessage === 'Username already taken') return t('error_username_taken');
      if (rawMessage === 'Email already taken') return t('error_email_taken');
      if (rawMessage === 'Invalid username or password') return t('error_invalid_credentials');
      if (rawMessage === 'Classroom not found') return t('error_classroom_not_found');
      return rawMessage;
  }
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function getUsername(): Promise<string | null> {
  return getItem(USERNAME_KEY);
}

const XP_KEY = 'player_xp';

export async function getXp(): Promise<number> {
  const val = await getItem(XP_KEY);
  return val ? parseInt(val, 10) : 0;
}

export async function addXp(amount: number): Promise<number> {
  // Update locally first
  const current = await getXp();
  const next = current + amount;
  await setItem(XP_KEY, String(next));

  // Sync to backend
  try {
    const token = await getToken();
    if (token) {
      const res = await fetch(`${PLAYER_API}/xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ xp: amount }),
      });
      if (res.ok) {
        const data = await res.json();
        // Sync local XP with backend truth
        await setItem(XP_KEY, String(data.xp));
        return data.xp;
      }
    }
  } catch {
    // Offline — local XP is still saved
  }
  return next;
}

export interface PlayerStats {
  username: string;
  xp: number;
  level: number;
  rank: number;
  activePerk: string | null;
}

export async function equipPerk(perk: string | null): Promise<PlayerStats | null> {
  try {
    const token = await getToken();
    if (!token) return null;
    const res = await fetch(`${PLAYER_API}/perk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ perk }),
    });
    if (res.ok) return await res.json();
  } catch { /* offline */ }
  return null;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
}

export async function fetchMyStats(): Promise<PlayerStats | null> {
  try {
    const token = await getToken();
    if (!token) return null;
    const res = await fetch(`${PLAYER_API}/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline
  }
  return null;
}

export interface LeaderboardPage {
  entries: LeaderboardEntry[];
  page: number;
  totalPages: number;
  totalUsers: number;
}

export async function fetchLeaderboard(page: number = 0): Promise<LeaderboardPage> {
  const empty: LeaderboardPage = { entries: [], page: 0, totalPages: 0, totalUsers: 0 };
  try {
    const token = await getToken();
    if (!token) return empty;
    const res = await fetch(`${PLAYER_API}/leaderboard?page=${page}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline
  }
  return empty;
}

const STREAK_KEY = 'streak_count';
const LAST_PLAYED_KEY = 'last_played_date';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function getStreak(): Promise<number> {
  const streak = await getItem(STREAK_KEY);
  const lastPlayed = await getItem(LAST_PLAYED_KEY);
  const count = streak ? parseInt(streak, 10) : 0;

  // If last played was before yesterday, streak is broken
  if (!lastPlayed || (lastPlayed !== todayStr() && lastPlayed !== yesterdayStr())) {
    return 0;
  }
  return count;
}

export async function recordGamePlayed(): Promise<number> {
  const today = todayStr();
  const lastPlayed = await getItem(LAST_PLAYED_KEY);
  const currentStreak = await getItem(STREAK_KEY);
  const count = currentStreak ? parseInt(currentStreak, 10) : 0;

  let newStreak: number;
  if (lastPlayed === today) {
    // Already played today — streak stays the same
    newStreak = count;
  } else if (lastPlayed === yesterdayStr()) {
    // Consecutive day — increment
    newStreak = count + 1;
  } else {
    // Streak broken or first time — start at 1
    newStreak = 1;
  }

  await setItem(STREAK_KEY, String(newStreak));
  await setItem(LAST_PLAYED_KEY, today);
  return newStreak;
}

export async function clearSession() {
  await removeItem(TOKEN_KEY);
  await removeItem(USERNAME_KEY);
  await removeItem(XP_KEY);
  await removeItem(STREAK_KEY);
  await removeItem(LAST_PLAYED_KEY);
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    await throwApiError(res, 'Login failed');
  }

  const data = await res.json();
  await setItem(TOKEN_KEY, data.token);
  await setItem(USERNAME_KEY, data.username);
  return data.token;
}

export async function register(email: string, username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok) {
    await throwApiError(res, 'Registration failed');
  }

  const data = await res.json();
  await setItem(TOKEN_KEY, data.token);
  await setItem(USERNAME_KEY, data.username);
  return data.token;
}

// --- Classroom API ---

export interface ClassroomInfo {
  id: number;
  name: string;
  code: string;
  createdBy: string;
  memberCount: number;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function createClassroom(name: string): Promise<ClassroomInfo | null> {
  try {
    const res = await fetch(CLASSROOM_API, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ name }),
    });
    if (res.ok) return await res.json();
    await throwApiError(res, 'Failed to create classroom');
  } catch (error) {
    if (error instanceof Error) throw error;
  }
  return null;
}

export async function joinClassroom(code: string): Promise<ClassroomInfo | null> {
  const res = await fetch(`${CLASSROOM_API}/join`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    await throwApiError(res, 'Failed to join classroom');
  }
  return await res.json();
}

export async function leaveClassroom(id: number): Promise<void> {
  try {
    await fetch(`${CLASSROOM_API}/${id}/leave`, {
      method: 'DELETE',
      headers: await authHeaders(),
    });
  } catch { /* offline */ }
}

export async function fetchMyClassrooms(): Promise<ClassroomInfo[]> {
  try {
    const res = await fetch(CLASSROOM_API, {
      headers: await authHeaders(),
    });
    if (res.ok) return await res.json();
  } catch { /* offline */ }
  return [];
}

export async function fetchClassroomLeaderboard(code: string, page: number = 0): Promise<LeaderboardPage> {
  const empty: LeaderboardPage = { entries: [], page: 0, totalPages: 0, totalUsers: 0 };
  try {
    const res = await fetch(`${CLASSROOM_API}/${code}/leaderboard?page=${page}`, {
      headers: await authHeaders(),
    });
    if (res.ok) return await res.json();
  } catch { /* offline */ }
  return empty;
}
