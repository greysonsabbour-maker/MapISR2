import { STORAGE_KEYS } from '@/config/constants';

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to storage [${key}]:`, err);
  }
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(key);
}

export { STORAGE_KEYS };
