import { Platform } from 'react-native';

const DEFAULT_PORT = 8001;

function trimUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.trim().replace(/\/+$/, '');
}

/**
 * URL base del backend.
 * - Si defines `EXPO_PUBLIC_BACKEND_URL` en `.env`, se usa tal cual (imprescindible en móvil físico con la IP del PC).
 * - Si no, en Android se usa 10.0.2.2 (emulador → tu PC); en iOS simulator y web, localhost.
 */
export function getBackendUrl(): string {
  const fromEnv = trimUrl(process.env.EXPO_PUBLIC_BACKEND_URL);
  if (fromEnv) {
    return fromEnv;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }
  return `http://localhost:${DEFAULT_PORT}`;
}
