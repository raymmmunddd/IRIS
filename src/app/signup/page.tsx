"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, User, Mail, Lock, X, CheckCircle2, Eye, EyeOff, ShieldCheck, ClipboardCheck, Database, UserCheck, ArrowLeft, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRoleLandingPath, saveAuthUser, type AuthUser, type UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const EAST_TAPINAC_BARANGAY = "Barangay East Tapinac" as const;

export const EAST_TAPINAC_STREETS: StreetRecord[] = [
  // Purok 1
  { name: "Gallagher Street", purok: 1, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Hansen Street", purok: 1, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Irving Street", purok: 1, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 2
  { name: "Labrador Street", purok: 2, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Rizal Street", purok: 2, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Fontaine Extension", purok: 2, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 3
  { name: "Hospital Road", purok: 3, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Dela Cruz Drive", purok: 3, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Fontaine Bridge", purok: 3, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 4
  { name: "Apelado Street", purok: 4, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 14th Street", purok: 4, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Fontaine Extension", purok: 4, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 5
  { name: "East 14th Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 13th Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY },
  { name: "11th Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Veterano Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Bacon Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 9th Street", purok: 5, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Rizal Avenue", purok: 5, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 6
  { name: "Donor Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Llanos Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 12th Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Fendler Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 14th Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 13th Street", purok: 6, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 7
  { name: "Fendler Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Gallagher Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Hansen Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Irving Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 14th Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 12th Street", purok: 7, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 8
  { name: "Bacon Street", purok: 8, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Fendler Street", purok: 8, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 9th Street", purok: 8, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Magsaysay Drive", purok: 8, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Rizal Avenue", purok: 8, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 9
  { name: "Fendler Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Gallagher Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Hansen Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Irving Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 12th Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 10th Street", purok: 9, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 10
  { name: "Fendler Street", purok: 10, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 10th Street", purok: 10, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 8th Street", purok: 10, barangay: EAST_TAPINAC_BARANGAY },
  { name: "East 6th Street", purok: 10, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Magsaysay Drive", purok: 10, barangay: EAST_TAPINAC_BARANGAY },

  // Purok 11
  { name: "5th Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY },
  { name: "3rd Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Alba Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Fendler Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Lindayag Street", purok: 11, barangay: EAST_TAPINAC_BARANGAY },
  { name: "Rizal Extension", purok: 11, barangay: EAST_TAPINAC_BARANGAY },
];

type StreetRecord = {
  name: string;
  purok: number;
  barangay: string;
};

const groupedByPurok = EAST_TAPINAC_STREETS.reduce((acc, street) => {
  (acc[street.purok] ??= []).push(street);
  return acc;
}, {} as Record<number, StreetRecord[]>);


const SUFFIX_OPTIONS = ["Jr.", "Sr.", "II", "III", "IV", "V"] as const;

const normalizeStreetQuery = (value: string) =>
  value.split(",")[0]?.trim().toLowerCase() ?? "";

const findStreetMatch = (value: string) => {
  const query = normalizeStreetQuery(value);

  if (!query) return null;

  return EAST_TAPINAC_STREETS.find(
    (street) => street.name.toLowerCase() === query
  ) ?? null;
};

const getStreetSuggestions = (value: string) => {
  const query = normalizeStreetQuery(value);
  const seen = new Set<string>();

  return EAST_TAPINAC_STREETS
    .filter((street) =>
      query ? street.name.toLowerCase().includes(query) : true
    )
    .filter((street) => {
      if (seen.has(street.name)) return false;
      seen.add(street.name);
      return true;
    })
    .slice(0, 8)
    .map((s) => s.name);
};

const formatPhilippinesContact = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed.startsWith("+") ? "+63" : "";
  if (digits === "63") return "+63";

  let rest = digits;
  if (rest.startsWith("63")) {
    rest = rest.slice(2);
  } else if (rest.startsWith("0")) {
    rest = rest.slice(1);
  }

  rest = rest.slice(0, 10);
  const part1 = rest.slice(0, 3);
  const part2 = rest.slice(3, 6);
  const part3 = rest.slice(6, 10);
  return `+63${part1 ? ` ${part1}` : ""}${part2 ? ` ${part2}` : ""}${part3 ? ` ${part3}` : ""}`;
};

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");

  const [suffix, setSuffix] = useState("");
  const [suffixOpen, setSuffixOpen] = useState(false);

  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("")
  const [genderOpen, setGenderOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState<(GeoPoint & { address: string; street: string; purok: number }) | null>(null);
  const [contact, setContact] = useState("");
  
  const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalScrolledToEnd, setLegalScrolledToEnd] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [devCode, setDevCode] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const role: UserRole = "resident";

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordScore =
    Number(checks.length) +
    Number(checks.uppercase) +
    Number(checks.lowercase) +
    Number(checks.number) +
    Number(checks.special);

  const strength = {
    score:
      passwordScore <= 1
        ? 1
        : passwordScore <= 3
        ? 2
        : passwordScore === 4
        ? 3
        : 4,

    label:
      passwordScore <= 1
        ? "Weak"
        : passwordScore <= 3
        ? "Fair"
        : passwordScore === 4
        ? "Strong"
        : "Very Strong",
  };

  const [step, setStep] = useState(1);

  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const buildFullName = () => {
    const parts = [firstName, middleName, lastName, suffix]
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.join(" ");
  };

  const [isLocating, setIsLocating] = useState(false);

  const captureLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const response = await fetch("/api/location/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });

          const result = await response.json();

          if (!result.success) throw new Error(result.message);

          setLocation(result.data);
        } catch (err) {
          toast({
            title: "Location failed",
            description:
              err instanceof Error ? err.message : "Unable to resolve location.",
            variant: "destructive",
          });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast({
          title: "Permission denied",
          description: err.message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const requestVerificationCode = async () => {
    const fullName = buildFullName();
    const response = await fetch("/api/auth/signup/request-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, role, street, contact, gender }),
    });
    const result: { success: boolean; message: string; data?: { devCode?: string } } = await response.json();

    if (!result.success) throw new Error(result.message);

    setDevCode(result.data?.devCode ?? null);
    return result;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const fullName = buildFullName();

    const normalizedContact = contact.trim();
    if (!firstName.trim() || !lastName.trim() || !fullName || !email || !password || !street || !normalizedContact || normalizedContact === "+63" || !gender) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "warning",
      });
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "Agreement required",
        description: "Please accept the Privacy Policy and Terms before creating an account.",
        variant: "warning",
      });
      openLegalDoc(!termsAccepted ? "terms" : "privacy");
      return;
    }

    setIsLoading(true);

    try {
      await requestVerificationCode();
      setIsLoading(false);
      setVerificationOpen(true);
      toast({
        title: "Verification sent",
        description: "Check your email for the 6-digit verification code.",
        variant: "success",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Unable to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({ title: "Invalid code", description: "Enter the 6-digit verification code.", variant: "warning" });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const result: { success: boolean; message: string; data: AuthUser | null } = await response.json();

      if (!result.success || !result.data) throw new Error(result.message);

      saveAuthUser(result.data);
      toast({
        title: "Account verified",
        description: "Your IRIS account is ready.",
        variant: "success",
      });
      router.push(getRoleLandingPath(result.data.role));
    } catch (error) {
      setIsVerifying(false);
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid or expired code.",
        variant: "destructive",
      });
    }
  };

  const handleResendCode = async () => {
    try {
      await requestVerificationCode();
      setVerificationCode("");
      toast({
        title: "Code resent",
        description: "A new verification code was sent to your email.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Resend failed",
        description: error instanceof Error ? error.message : "Unable to resend the code.",
        variant: "destructive",
      });
    }
  };

  const roleCopy = {
    resident: {
      title: "Join Us!",
      body: "Report incidents, track status updates, and stay informed with IRIS. Your community updates are just a click away.",
    }
  } as const;

  const isPasswordValid =
    checks.length &&
    checks.uppercase &&
    checks.lowercase &&
    checks.number &&
    checks.special;

  const openLegalDoc = (doc: "terms" | "privacy") => {
    setLegalAccepted(false);
    setLegalScrolledToEnd(doc === "privacy");
    setLegalDoc(doc);
  };

  const handleAgreementToggle = (doc: "terms" | "privacy") => {
    if (doc === "terms") {
      if (termsAccepted) {
        setTermsAccepted(false);
        return;
      }
      openLegalDoc("terms");
      return;
    }

    if (privacyAccepted) {
      setPrivacyAccepted(false);
      return;
    }

    openLegalDoc("privacy");
  };

  const legalContent = {
    terms: {
      title: "Terms of Service",
      intro:
        "These Terms govern your use of IRIS (Incident Report and Information System) for community reporting and case tracking.",
      body: [
        "Account Responsibility: Keep your credentials secure and notify administrators of unauthorized use.",
        "Acceptable Use: Provide truthful reports and avoid impersonation, harassment, or abusive content.",
        "Role-Based Access: Use only the features permitted to your assigned role and do not attempt to bypass access controls.",
        "Evidence & Content: Upload only relevant materials you have the right to share for case handling.",
        "Service Availability: IRIS may undergo updates, maintenance, or temporary outages to improve security and reliability.",
        "Enforcement: Accounts may be reviewed, suspended, or removed for violations of these Terms.",
      ],
    },
    privacy: {
      title: "Privacy Policy",
      intro:
        "IRIS protects your personal and case data by limiting collection to what is required for operations, safety, and legal compliance.",
      body: [
        "Data We Collect: Name, email, contact, street, gender, role, and account credentials (stored securely).",
        "Case Information: Incident reports, evidence uploads, messages, and case updates needed for barangay workflows.",
        "How We Use Data: Verification, case management, notifications, analytics, and service improvement.",
        "Access & Sharing: Data is shared only with authorized barangay staff and officers for official purposes.",
        "Retention: Account and case data may be retained for audits, legal compliance, and public safety needs.",
        "Your Rights: You can request corrections or updates to your profile through the barangay administrator.",
      ],
    },
  } as const;

  return (
  <>
  {/* MAIN LAYOUT */}
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] bg-[var(--iris-bg)] text-[var(--iris-text)] auth-page-enter">

    {/* LEFT HERO */}
      <section
          className="auth-hero-enter relative hidden lg:flex items-center justify-center overflow-hidden p-8 xl:p-10"
          style={{
            background: `
              radial-gradient(
                120% 120% at 0% 0%,
                rgba(255,255,255,0.10) 0%,
                rgba(255,255,255,0) 60%
              ),
              radial-gradient(
                120% 120% at 100% 100%,
                rgba(59,130,246,0.12) 0%,
                rgba(59,130,246,0) 65%
              ),
              linear-gradient(
                135deg,
                var(--sidebar-bg) 0%,
                var(--primary-hover) 35%,
                var(--primary-hover) 55%,
                rgba(15, 23, 42, 0.95) 100%
              )
            `,
          }}
        >
      <div className="auth-hero-radial absolute inset-0 opacity-40" />
        <div className="auth-hero-linear absolute inset-0 opacity-80" />
        <div className="absolute -left-24 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="relative z-10 flex h-full w-full max-w-2xl flex-col justify-between text-white">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
            {/* Barangay Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/EastTapinac.png"
                alt="Barangay East Tapinac"
                className="h-14 w-14"
              />

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  IRIS Access
                </p>
                <p className="text-sm font-semibold text-white">
                  Barangay East Tapinac
                </p>
              </div>
            </div>

          </div>
            <div className="space-y-4">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
                Create account
              </p>
              <h1 className="text-3xl xl:text-4xl leading-tight font-semibold">{roleCopy[role].title}</h1>
              <p className="text-base xl:text-lg text-white/80 leading-relaxed">{roleCopy[role].body}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.14em] text-white/70">Trusted access</p>
                <p className="mt-2 text-sm font-semibold text-white">Role-based verification</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.14em] text-white/70">Protected data</p>
                <p className="mt-2 text-sm font-semibold text-white">Secure incident handling</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Protected by role permissions</span>
            <span>© 2026 IRIS</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
        <div
          className="
            w-full max-w-md
            overflow-hidden
            rounded-3xl
            border border-[var(--iris-border)]
            bg-[var(--iris-surface)]/96
            shadow-[0_24px_70px_rgba(15,23,42,0.14)]
            backdrop-blur-xl
          "
        >

          <div className="px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--iris-border)]">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Go back to Homepage
              </Link>
            </div>

            <div className="space-y-2 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
                <UserPlus className="h-5 w-5" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[var(--iris-text)]">Create an account</h2>
              <p className="text-sm text-[var(--iris-text-subtle)]">Access your account to report or monitor incidents.</p>
            </div>

            {/* PROGRESS STEP */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                {[
                  { number: 1, title: "Personal" },
                  { number: 2, title: "Contact" },
                  { number: 3, title: "Address" },
                  { number: 4, title: "Security" },
                ].map((item, index) => {
                  const active = step === item.number;
                  const completed = step > item.number;

                  return (
                    <div
                      key={item.number}
                      className="relative flex flex-1 items-center"
                    >
                      {/* CONNECTOR */}
                      {index < 3 && (
                        <div className="absolute left-1/2 top-4 h-[2px] w-full -translate-y-1/2 bg-[var(--iris-border)]">
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              completed
                                ? "bg-[var(--iris-primary)]"
                                : "bg-transparent"
                            )}
                          />
                        </div>
                      )}

                      {/* STEP */}
                      <div className="relative z-10 flex w-full flex-col items-center">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300",
                            completed
                              ? "border-[var(--iris-primary)] bg-[var(--iris-primary)] text-white"
                              : active
                              ? "border-[var(--iris-primary)] bg-[var(--iris-primary-light)] text-[var(--iris-primary)]"
                              : "border-[var(--iris-border)] bg-white text-[var(--iris-text-subtle)]"
                          )}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            item.number
                          )}
                        </div>

                        <span
                          className={cn(
                            "mt-1 text-[11px] font-medium",
                            active || completed
                              ? "text-[var(--iris-text)]"
                              : "text-[var(--iris-text-subtle)]"
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          <form
            className="mt-5 space-y-4"
            onSubmit={handleSubmit}
          >
            {/* STEP 1 — PERSONAL INFO */}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">

                {/* FIRST NAME */}
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                  <label htmlFor="firstName" className="sr-only">
                    First name
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    disabled={isLoading}
                  />
                </div>

                {/* LAST NAME */}
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                  <label htmlFor="lastName" className="sr-only">
                    Last name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    disabled={isLoading}
                  />
                </div>

                {/* MIDDLE NAME */}
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                  <label htmlFor="middleName" className="sr-only">
                    Middle name
                  </label>

                  <input
                    id="middleName"
                    type="text"
                    autoComplete="additional-name"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Middle Name"
                    disabled={isLoading}
                  />
                </div>

                {/* SUFFIX */}
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                  <button
                    type="button"
                    onClick={() => setSuffixOpen((prev) => !prev)}
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-left text-sm text-[var(--iris-text)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    disabled={isLoading}
                  >
                    {suffix || "No suffix"}
                  </button>

                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </svg>

                  {suffixOpen && (
                    <div
                      role="listbox"
                      className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[var(--iris-border)] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.15)]"
                    >
                      <button
                        type="button"
                        role="option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSuffix("");
                          setSuffixOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-[var(--iris-text)] transition hover:bg-[var(--iris-primary-light)]/40"
                      >
                        No suffix
                      </button>

                      {SUFFIX_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSuffix(option);
                            setSuffixOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-[var(--iris-text)] transition hover:bg-[var(--iris-primary-light)]/40"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* GENDER */}
                <div className="relative sm:col-span-2">
                  <UserCheck className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                  <button
                    type="button"
                    onClick={() => setGenderOpen((prev) => !prev)}
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-left text-sm text-[var(--iris-text)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    disabled={isLoading}
                  >
                    {gender === ""
                      ? "Select Gender"
                      : gender === "MALE"
                      ? "Male"
                      : "Female"}
                  </button>

                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </svg>

                  {genderOpen && (
                    <div
                      role="listbox"
                      className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[var(--iris-border)] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.15)]"
                    >
                      <button
                        type="button"
                        role="option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setGender("MALE");
                          setGenderOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-[var(--iris-text)] transition hover:bg-[var(--iris-primary-light)]/40"
                      >
                        Male
                      </button>

                      <button
                        type="button"
                        role="option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setGender("FEMALE");
                          setGenderOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-[var(--iris-text)] transition hover:bg-[var(--iris-primary-light)]/40"
                      >
                        Female
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 — CONTACT INFO */}
            {step === 2 && (
              <div className="space-y-4">

                {/* EMAIL */}
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    disabled={isLoading}
                  />
                </div>

                {/* CONTACT */}
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                  <label htmlFor="contact" className="sr-only">
                    Contact
                  </label>

                  <input
                    id="contact"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={contact}
                    onChange={(e) =>
                      setContact(formatPhilippinesContact(e.target.value))
                    }
                    onFocus={() => {
                      if (!contact.trim()) setContact("+63");
                    }}
                    onBlur={() => {
                      if (contact.trim() === "+63") setContact("");
                    }}
                    placeholder="Phone Number"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* STEP 3 — ADDRESS */}
            {step === 3 && (
              <div className="space-y-4">

                <div className="rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-[var(--iris-primary-light)] p-2 text-[var(--iris-primary)]">
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[var(--iris-text)]">
                          Street & Purok
                        </p>

                        <p className="text-xs leading-relaxed text-[var(--iris-text-subtle)]">
                          {location
                            ? `${location.street} • Purok ${location.purok}`
                            : "Use your location to detect your street and purok"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={captureLocation}
                      disabled={isLoading || isLocating}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--iris-border)] bg-white px-4 text-sm font-semibold text-[var(--iris-primary)] transition hover:bg-[var(--iris-primary-light)]/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MapPin className="h-4 w-4" />
                      {isLocating
                        ? "Detecting..."
                        : location
                        ? "Update location"
                        : "Detect location"}
                    </button>

                  </div>
                </div>

              </div>
            )}

            {/* STEP 4 — SECURITY */}
            {step === 4 && (
              <div className="space-y-4">

                {/* PASSWORD */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 pr-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      disabled={isLoading}
                    />

                    {password.length > 0 && isPasswordValid ? (
                      <CheckCircle2 className="pointer-events-none absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--iris-text-subtle)] hover:text-[var(--iris-primary)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {password.length > 0 && (
                    <div className="rounded-2xl border border-[var(--iris-border)] bg-white/95 p-3 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--iris-text)]">
                          Password Strength
                        </span>

                        <span
                          className={cn(
                            "text-xs font-bold",
                            strength.score <= 2 && "text-red-500",
                            strength.score === 3 && "text-amber-500",
                            strength.score >= 4 && "text-emerald-600"
                          )}
                        >
                          {strength.label}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-all duration-300",
                              strength.score >= level
                                ? strength.score <= 2
                                  ? "bg-red-500"
                                  : strength.score === 3
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                                : "bg-[var(--iris-border)]"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AGREEMENT CARD */}
                <div className="rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-primary-light)]/25 p-4">
                  <label className="flex items-start gap-3 text-sm text-[var(--iris-text)]">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-[var(--iris-border)] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)] accent-[var(--iris-primary)]"
                      checked={termsAccepted && privacyAccepted}
                      onChange={() => {
                        if (termsAccepted && privacyAccepted) {
                          setTermsAccepted(false);
                          setPrivacyAccepted(false);
                          return;
                        }

                        openLegalDoc("terms");
                      }}
                    />

                    <span className="leading-relaxed">
                      I accept the{" "}
                      <button
                        type="button"
                        onClick={() => openLegalDoc("privacy")}
                        className="font-semibold text-[var(--iris-primary)] transition-colors hover:text-[var(--iris-primary-strong)]"
                      >
                        Privacy Policy
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => openLegalDoc("terms")}
                        className="font-semibold text-[var(--iris-primary)] transition-colors hover:text-[var(--iris-primary-strong)]"
                      >
                        Terms and Conditions
                      </button>
                      .
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP BUTTONS */}
            <div className="flex items-center gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="
                    flex-1 rounded-xl
                    border border-[var(--iris-border)]
                    bg-white
                    py-2.5 font-semibold
                    text-[var(--iris-text)]
                    transition hover:bg-[var(--iris-primary-light)]/20
                  "
                >
                  Back
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="
                    flex-1 rounded-xl
                    bg-[var(--iris-primary)]
                    py-2.5 font-semibold text-white
                    shadow-[0_12px_30px_rgba(30,79,163,0.28)]
                    transition-all duration-200
                    hover:-translate-y-[1px]
                    hover:bg-[var(--iris-primary-strong)]
                  "
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !termsAccepted || !privacyAccepted}
                  className="
                    flex-1 rounded-xl
                    bg-[var(--iris-primary)]
                    py-2.5 font-semibold text-white
                    shadow-[0_12px_30px_rgba(30,79,163,0.28)]
                    transition-all duration-200
                    hover:-translate-y-[1px]
                    hover:bg-[var(--iris-primary-strong)]

                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >
                  {isLoading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              )}
            </div>
          </form>

            <p className="mt-4 text-center text-sm text-[var(--iris-text-subtle)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="auth-link-underline inline font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iris-primary)] focus-visible:ring-offset-2"
              >
                Sign in.
              </Link>
            </p>
          </div>  
        </div>
      </section>

      {legalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl">
            <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-[var(--iris-border)] bg-[var(--iris-surface)] shadow-[0_30px_80px_rgba(15,23,42,0.18)] ring-1 ring-black/5 animate-in zoom-in-95 duration-200">

              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-[var(--iris-border)] bg-[var(--legal-surface)] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)]">
                    <ShieldCheck className="h-5 w-5 text-[var(--iris-primary)]" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[var(--iris-text)]">
                      {legalContent[legalDoc].title}
                    </h3>
                    <p className="text-xs text-[var(--iris-text-subtle)]">
                      IRIS Legal Documentation
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLegalDoc(null)}
                  aria-label="Close dialog"
                  className="rounded-full p-2 text-[var(--iris-text-subtle)] transition-all hover:bg-[var(--legal-surface-hover)] hover:text-[var(--iris-text)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* BODY */}
              <div
                className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-[var(--iris-surface)]"
                onScroll={(event) => {
                  const target = event.currentTarget;
                  if (
                    target.scrollTop + target.clientHeight >=
                    target.scrollHeight - 12
                  ) {
                    setLegalScrolledToEnd(true);
                  }
                }}
              >

                {/* INTRO (UNCHANGED TEXT, SOLID BACKGROUND) */}
                <div className="mb-6 rounded-2xl border border-[var(--iris-border)] bg-white p-5">
                  <p className="text-sm leading-relaxed font-medium text-[var(--iris-primary-strong)]">
                    {legalContent[legalDoc].intro}
                  </p>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {legalContent[legalDoc].body.map((item, index) => {
                    const [heading, ...rest] = item.split(": ");
                    const detail = rest.join(": ");

                    const icons = [
                      ShieldCheck,
                      ClipboardCheck,
                      Database,
                      UserCheck,
                    ] as const;

                    const Icon = icons[index % icons.length];

                    return (
                      <div
                        key={item}
                        className="group rounded-2xl border border-[var(--iris-border)] bg-white p-4 transition-all hover:border-[var(--iris-primary)]/30 hover:shadow-md"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <div className="rounded-xl bg-[var(--iris-primary-light)] p-2 transition-all group-hover:bg-[var(--iris-primary)]">
                            <Icon className="h-4 w-4 text-[var(--iris-primary)] group-hover:text-white" />
                          </div>

                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--iris-text)] group-hover:text-[var(--iris-primary)] transition-colors">
                            {heading}
                          </p>
                        </div>

                        <p className="text-xs leading-relaxed text-[var(--iris-text-subtle)]">
                          {detail}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between gap-4 border-t border-[var(--iris-border)] bg-[var(--legal-surface)] px-6 py-4">

                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-[var(--iris-text-subtle)]">
                  <input
                    type="checkbox"
                    checked={legalAccepted}
                    disabled={legalDoc === "terms" && !legalScrolledToEnd}
                    onChange={(e) => setLegalAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--iris-border)] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)] accent-[var(--iris-primary)]"
                  />

                  <span className="font-medium">
                    {legalDoc === "terms" && !legalScrolledToEnd
                      ? "Scroll to the bottom to accept"
                      : "I have read and agree"}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (legalDoc === "terms") {
                      setTermsAccepted(true);
                      setPrivacyAccepted(true);
                    }

                    if (legalDoc === "privacy") {
                      setPrivacyAccepted(true);
                    }

                    setLegalDoc(null);
                  }}
                  disabled={
                    !legalAccepted ||
                    (legalDoc === "terms" && !legalScrolledToEnd)
                  }
                  className="rounded-xl bg-[var(--iris-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.10)] transition-all hover:bg-[var(--iris-primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {legalDoc === "terms" ? "Accept Terms" : "Continue"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {verificationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="space-y-3 text-center pb-2">
              <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--iris-text)]">Verify your email</h3>
              <p className="text-sm text-[var(--iris-text-subtle)]">Enter the 6-digit code sent to {email}.</p>
              {devCode && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                  Dev code: {devCode}
                </p>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <input
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-4 py-3 text-center text-2xl font-bold tracking-[0.45em] text-[var(--iris-text)] focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)]"
              />

              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full rounded-xl bg-[var(--iris-primary)] py-2.5 font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition hover:bg-[var(--iris-primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isVerifying ? "Verifying..." : "Verify Account"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isVerifying}
                  className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)] disabled:opacity-50"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationOpen(false)}
                  disabled={isVerifying}
                  className="font-semibold text-[var(--iris-text-subtle)] hover:text-[var(--iris-text)] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
}