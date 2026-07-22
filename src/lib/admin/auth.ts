import { supabase } from "@/integrations/supabase/client";

/**
 * Legacy compatibility layer.
 *
 * The old admin code imports functions from this module.
 * These implementations simply delegate to Supabase Auth so
 * existing imports continue to work while the application is
 * migrated to the new authentication architecture.
 */

export async function signInAdmin(
  email: string,
  password: string,
) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOutAdmin() {
  const result = await supabase.auth.signOut();
  return result;
}

export async function isAdminSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return !!session;
}

export async function getAdminSession() {
  return supabase.auth.getSession();
}

export async function getCurrentAdminUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
