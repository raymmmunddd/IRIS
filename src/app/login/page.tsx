import LoginClient from "./LoginClient";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  return <LoginClient roleFromQuery={searchParams.role} />;
}