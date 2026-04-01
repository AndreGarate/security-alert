import axios from 'axios';
import { getBackendUrl } from './config';

export const api = axios.create({
  baseURL: getBackendUrl(),
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
});

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const { data } = await api.get<{ status?: string }>('/api/health', { timeout: 5000 });
    return data?.status === 'healthy';
  } catch {
    return false;
  }
}

export function getAxiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string') {
      return detail.length > 280 ? `${detail.slice(0, 280)}…` : detail;
    }
    if (!error.response && error.message) {
      return 'No hay conexión con el servidor. Comprueba que el backend esté en marcha (puerto 8001) y la URL en .env si usas móvil físico.';
    }
    return error.message;
  }
  return 'Ha ocurrido un error inesperado.';
}
