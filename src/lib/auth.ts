export type LoginResult = { success: boolean; message?: string };

export async function fakeLogin(email: string, password: string): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  // Placeholder: replace with real auth API call
  await new Promise((resolve) => setTimeout(resolve, 400));

  return { success: true, message: "Logged in (demo)." };
}
