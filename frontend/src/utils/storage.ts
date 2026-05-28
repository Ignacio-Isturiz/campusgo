import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const LAST_ROUTE_KEY = 'last_route';
const USER_KEY = 'user_data';
const PHOTO_KEY = 'profile_photo';
const PREF_THEME_KEY = 'pref_theme';
const PREF_COLOR_KEY = 'pref_color';

/**
 * Guarda el token de autenticación de forma segura.
 * En la web utiliza localStorage como fallback.
 */
export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Recupera el token de autenticación.
 */
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Elimina el token de autenticación (Cierre de sesión).
 */
export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Persist last visited route so we can restore navigation on reload.
 */
export async function saveLastRoute(path: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(LAST_ROUTE_KEY, path);
    return;
  }
  await SecureStore.setItemAsync(LAST_ROUTE_KEY, path);
}

export async function getLastRoute(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(LAST_ROUTE_KEY);
  }
  return await SecureStore.getItemAsync(LAST_ROUTE_KEY);
}

/**
 * Guarda la información del usuario.
 */
export async function saveUser(user: any): Promise<void> {
  const data = JSON.stringify(user);
  if (Platform.OS === 'web') {
    localStorage.setItem(USER_KEY, data);
    return;
  }
  await SecureStore.setItemAsync(USER_KEY, data);
}

/**
 * Recupera la información del usuario.
 */
export async function getUser(): Promise<any | null> {
  let data: string | null = null;
  if (Platform.OS === 'web') {
    data = localStorage.getItem(USER_KEY);
  } else {
    data = await SecureStore.getItemAsync(USER_KEY);
  }
  
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * Guarda la URI de la foto de perfil.
 */
export async function savePhoto(uri: string): Promise<void> {
  if (!uri) return;

  if (Platform.OS === 'web') {
    if (uri.startsWith('blob:')) {
      // Convert temporary blob URIs into a stable data URL so the image
      // persists across reloads in web browsers.
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        localStorage.setItem(PHOTO_KEY, dataUrl);
      } catch (error) {
        console.warn('Could not persist blob URI photo as data URL:', error);
      }
      return;
    }

    localStorage.setItem(PHOTO_KEY, uri);
    return;
  }

  if (uri.startsWith('blob:')) {
    // do not persist blob URIs on native because they are temporary
    return;
  }
  await SecureStore.setItemAsync(PHOTO_KEY, uri);
}

export async function savePreferences(theme: 'light' | 'dark'): Promise<void> {
  const data = JSON.stringify({ theme });
  if (Platform.OS === 'web') {
    localStorage.setItem(PREF_THEME_KEY, data);
    // notify listeners
    try { notifyPreferencesChanged(); } catch (e) {}
    return;
  }
  await SecureStore.setItemAsync(PREF_THEME_KEY, data);
  try { await notifyPreferencesChanged(); } catch (e) {}
}

// Simple in-memory listeners to notify UI about preference changes at runtime.
type PrefsListener = (prefs: { theme?: string; instColor?: string } | null) => void;
const prefListeners: PrefsListener[] = [];

export function addPreferencesListener(cb: PrefsListener) {
  prefListeners.push(cb);
  return () => {
    const idx = prefListeners.indexOf(cb);
    if (idx >= 0) prefListeners.splice(idx, 1);
  };
}

async function notifyPreferencesChanged() {
  const prefs = await getPreferences();
  prefListeners.slice().forEach((cb) => {
    try {
      cb(prefs);
    } catch (e) {
      // ignore listener errors
    }
  });
}

export async function getPreferences(): Promise<{ theme?: string; instColor?: string } | null> {
  let data: string | null = null;
  if (Platform.OS === 'web') {
    data = localStorage.getItem(PREF_THEME_KEY);
  } else {
    data = await SecureStore.getItemAsync(PREF_THEME_KEY);
  }
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * Recupera la URI de la foto de perfil.
 */
export async function getPhoto(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(PHOTO_KEY);
  }
  return await SecureStore.getItemAsync(PHOTO_KEY);
}

/**
 * Limpia toda la sesión (Cierre de sesión completo).
 */
export async function clearAll(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PHOTO_KEY);
    localStorage.removeItem(LAST_ROUTE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  await SecureStore.deleteItemAsync(PHOTO_KEY);
  await SecureStore.deleteItemAsync(LAST_ROUTE_KEY);
}

/**
 * Cierra la sesión completa reutilizando la limpieza centralizada.
 */
export async function signOut(): Promise<void> {
  const token = await getToken();

  // Clear local session immediately so logout is fast and navigation can happen.
  await clearAll();

  // Also call backend logout if available, but do not block the UX.
  if (!token) return;

  try {
    const API_URL = (process.env.EXPO_PUBLIC_API_URL as any) || 'https://campusgo-jjzy.onrender.com';
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    // ignore errors
  }
}

// backward-compat alias
// no-op: keep exports as defined above
