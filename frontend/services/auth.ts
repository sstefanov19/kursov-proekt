import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE = 'http://localhost:8080/api/v1/auth';
const TOKEN_KEY = 'jwt_token';

// For web, fall back to localStorage since SecureStore is not available
async function setToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || 'Login failed');
  }

  const data = await res.json();
  const token = data.token;
  await setToken(token);
  return token;
}

export async function register(email: string, username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || 'Registration failed');
  }

  const data = await res.json();
  const token = data.token;
  await setToken(token);
  return token;
}
