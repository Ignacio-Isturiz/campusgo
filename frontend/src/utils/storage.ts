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
  // Only persist remote HTTP(S) URLs. Do not persist blob: URLs (temporary).
  if (!uri) return;
  if (uri.startsWith('blob:')) {
    // do not persist blob URIs as they are temporary
    return;
  }
  if (Platform.OS === 'web') {
    localStorage.setItem(PHOTO_KEY, uri);
    return;
  }
  await SecureStore.setItemAsync(PHOTO_KEY, uri);
}

export async function savePreferences(theme: 'light' | 'dark', instColor: string): Promise<void> {
  const data = JSON.stringify({ theme, instColor });
  if (Platform.OS === 'web') {
    localStorage.setItem(PREF_THEME_KEY, data);
    return;
  }
  await SecureStore.setItemAsync(PREF_THEME_KEY, data);
}

export async function getPreferences(): Promise<{ theme: string; instColor: string } | null> {
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
  // Also call backend logout if available (best-effort)
  try {
    const token = await getToken();
    if (token) {
      const API_URL = (process.env.EXPO_PUBLIC_API_URL as any) || 'http://localhost:5000';
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (e) {
    // ignore errors
  }

  await clearAll();
}

// backward-compat alias
// no-op: keep exports as defined above
