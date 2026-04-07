export type LoginResult = { success: boolean; message?: string };

export type UserRole = "resident" | "official" | "bpat";

export interface AuthUser {
  email: string;
  id: string;
  createdAt: string;
  role: UserRole;
}

const STORAGE_KEY = "auth_user";

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const user = localStorage.getItem(STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthUser();
}

export function getRoleLandingPath(role: UserRole): string {
  if (role === "resident") return "/resident";
  if (role === "bpat") return "/bpat-officers";
  return "/dashboard";
}

export function isRoleAuthorized(allowedRoles: UserRole[]): boolean {
  const user = getAuthUser();
  return !!user && allowedRoles.includes(user.role);
}

export function login(email: string, password: string, role: UserRole = "official"): boolean {
  if (!email || !password) return false;

  try {
    const user: AuthUser = {
      email,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      role,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return true;
  } catch {
    return false;
  }
}

export function signup(
  email: string,
  password: string,
  confirmPassword: string,
  role: UserRole = "resident"
): boolean {
  if (!email || !password || !confirmPassword) return false;
  if (password !== confirmPassword) return false;
  if (password.length < 6) return false;

  try {
    const user: AuthUser = {
      email,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      role,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return true;
  } catch {
    return false;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function fakeLogin(email: string, password: string): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  // Placeholder: replace with real auth API call
  await new Promise((resolve) => setTimeout(resolve, 400));

  return { success: true, message: "Logged in (demo)." };
}
