/**
 * TEMPORARY mock admin session.
 * Replace with Supabase auth + user_roles check when authentication lands.
 */
const KEY = "nesthunt_admin_session_v1";
const DEMO_PIN = "nesthunt-admin";

export function isAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function signInAdmin(pin: string): boolean {
  if (pin.trim() !== DEMO_PIN) return false;
  window.localStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event("nesthunt-admin-change"));
  return true;
}

export function signOutAdmin() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("nesthunt-admin-change"));
}

export const ADMIN_DEMO_PIN = DEMO_PIN;
