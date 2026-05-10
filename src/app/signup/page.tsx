"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, User, Mail, Lock, X, CheckCircle2, Circle, Eye, EyeOff, ShieldCheck, ClipboardCheck, Database, UserCheck, ArrowLeft, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRoleLandingPath, saveAuthUser, type AuthUser, type UserRole } from "@/lib/auth";

const EAST_TAPINAC_BARANGAY = "Barangay East Tapinac";

const EAST_TAPINAC_STREETS = [
  "10th Street",
  "14th Street",
  "16th Street",
  "17th Street",
  "18th Street",
  "20th Street",
  "23rd Street",
  "24th Street",
  "6th Street",
  "Acayan Street",
  "Afable Street",
  "Aguinaldo Street",
  "Aim High Avenue",
  "Anonas Street",
  "Apo Rotonda",
  "Ardoin Street",
  "Argonaut Highway",
  "Arthur Street",
  "Baretto Street",
  "Bonifacio Street",
  "Braveheart Road",
  "Brill Street",
  "Burgos Street",
  "Canal Road",
  "Canda Street",
  "Caron Street",
  "Causeway Road",
  "Coll Street",
  "Commitment Street",
  "Dahl Street",
  "Davidson Street",
  "Dela Cruz Drive",
  "Dewey Avenue",
  "E 21st Street",
  "E 8th Street",
  "East 12th Street",
  "East 13th Street",
  "East 16th Street",
  "East 18th Street",
  "East 1st Street",
  "Efficiency Avenue",
  "Elicaño Street",
  "Espiritu Street",
  "Faith Street",
  "Fontaine Street",
  "Gallagher Street",
  "Gatbunton Street",
  "Golden Fortune Street",
  "Gordon Avenue",
  "Graham Street",
  "Hansen Street",
  "Harris Street",
  "Ibarra Street",
  "Indiana Street",
  "Innovative Street",
  "Irving Street",
  "Johnson Street",
  "Johnson Street Extension",
  "Jones Street",
  "Joyful Street",
  "Katipunan Street",
  "Kentucky Street",
  "Kessing Street",
  "Labitan Street",
  "Lake Walkway",
  "Magsaysay Avenue",
  "Magsaysay Bridge",
  "Magsaysay Drive",
  "Maine Street",
  "Mc Kinley Street",
  "Murphy Street",
  "Natividad Street",
  "Norton Street",
  "Ohio Street",
  "Old Hospital Road",
  "Old Walk way",
  "Olongapo - Bugallon Road",
  "Oregon Street",
  "Palm Street",
  "Perimeter Road",
  "Quezon Street",
  "Ramos Street",
  "Raymundo Street",
  "Rizal Avenue",
  "Rizal Highway",
  "Rodriguez Street",
  "Saint Columban Street",
  "Sampson Road",
  "Santa Rita Road",
  "Security Road",
  "Sunset Street",
  "Texas Street",
  "Washington Street",
  "West 20th Place",
  "West 20th Street",
  "West 21st Place",
  "West 21st Street",
  "West 22nd Place",
  "West 22nd Street",
  "West 23rd Street",
] as const;

const normalizeStreetQuery = (value: string) => value.split(",")[0]?.trim() ?? "";

const formatStreetWithBarangay = (value: string) => {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  if (/east tapinac/i.test(cleaned)) return cleaned;
  return `${cleaned}, ${EAST_TAPINAC_BARANGAY}`;
};

const findStreetMatch = (value: string) => {
  const query = normalizeStreetQuery(value).toLowerCase();
  if (!query) return null;
  return EAST_TAPINAC_STREETS.find((streetName) => streetName.toLowerCase() === query) ?? null;
};

const getStreetSuggestions = (value: string) => {
  const query = normalizeStreetQuery(value).toLowerCase();
  const matches = EAST_TAPINAC_STREETS.filter((streetName) =>
    query ? streetName.toLowerCase().includes(query) : true,
  );
  return matches.slice(0, 8);
};

const formatPhilippinesContact = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");
  const isInternational = trimmed.startsWith("+") || digits.startsWith("63");

  if (isInternational) {
    let rest = digits;
    if (rest.startsWith("63")) {
      rest = rest.slice(2);
    }
    rest = rest.slice(0, 10);
    const part1 = rest.slice(0, 3);
    const part2 = rest.slice(3, 6);
    const part3 = rest.slice(6, 10);
    return `+63${part1 ? ` ${part1}` : ""}${part2 ? ` ${part2}` : ""}${part3 ? ` ${part3}` : ""}`;
  }

  const local = digits.slice(0, 11);
  const part1 = local.slice(0, 4);
  const part2 = local.slice(4, 7);
  const part3 = local.slice(7, 11);
  return `${part1}${part2 ? `-${part2}` : ""}${part3 ? `-${part3}` : ""}`;
};

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [suffixEnabled, setSuffixEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [street, setStreet] = useState("");
  const [contact, setContact] = useState("");
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("")
  const [genderOpen, setGenderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const role: UserRole = "resident";
  const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalScrolledToEnd, setLegalScrolledToEnd] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [streetFocused, setStreetFocused] = useState(false);

  const buildFullName = () => {
    const parts = [firstName, middleName, lastName, suffixEnabled ? suffix : ""]
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.join(" ");
  };

  const requestVerificationCode = async () => {
    const fullName = buildFullName();
    const response = await fetch("/api/auth/signup/request-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, confirmPassword, role, street, contact, gender }),
    });
    const result: { success: boolean; message: string; data?: { devCode?: string } } = await response.json();

    if (!result.success) throw new Error(result.message);

    setDevCode(result.data?.devCode ?? null);
    return result;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const fullName = buildFullName();

    if (!firstName.trim() || !lastName.trim() || !fullName || !email || !password || !confirmPassword || !street || !contact || !gender) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "warning",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
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
      title: "Hello, Resident! 👋",
      body: "Report incidents, track status updates, and stay informed with IRIS. Your community updates are just a click away.",
    },
    official: {
      title: "Welcome, Admin! 👋",
      body: "Verify cases, schedule assignments, and monitor reports efficiently. IRIS keeps your dashboard and community operations organized.",
    },
    bpat: {
      title: "Hello, BPAT Officer! 👋",
      body: "Log mediation updates, manage field cases, and respond to AI-flagged reports. IRIS helps you act quickly and keep every case moving.",
    },
  } as const;

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  const isPasswordValid = checks.length && checks.uppercase && checks.number;

  const streetSuggestions = useMemo(() => getStreetSuggestions(street), [street]);
  const showStreetSuggestions = streetFocused && streetSuggestions.length > 0;
  const streetQuery = normalizeStreetQuery(street).toLowerCase();

  const handleStreetSelect = (streetName: string) => {
    setStreet(formatStreetWithBarangay(streetName));
    setStreetFocused(false);
  };

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
    <div className="min-h-screen lg:h-screen lg:grid lg:grid-cols-[1.1fr_0.9fr] bg-[var(--iris-bg)] text-[var(--iris-text)]">
      <section className="relative hidden lg:flex items-center justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_45%),linear-gradient(135deg,#1E4FA3,#173E82,#0B1A3A)] p-10 xl:p-14">
        <div className="auth-hero-radial absolute inset-0 opacity-40" />
        <div className="auth-hero-linear absolute inset-0 opacity-80" />
        <div className="absolute -left-24 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[var(--secondary)]/20 blur-3xl" />
        <div className="relative z-10 flex h-full w-full max-w-xl flex-col justify-between text-white">
          <div className="space-y-7">
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

      <section className="flex min-h-screen items-center justify-center overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:min-h-0 lg:h-screen lg:px-10 lg:py-6">
        <div className="w-full max-w-md space-y-3">
          <div className="text-sm">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
              <ArrowLeft className="h-4 w-4" />
              Go Back to Homepage
            </Link>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="space-y-2 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
                <UserPlus className="h-5 w-5" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[var(--iris-text)]">Create an account</h2>
              <p className="text-sm text-[var(--iris-text-subtle)]">Access your account to report or monitor incidents.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                  <label htmlFor="firstName" className="sr-only">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    disabled={isLoading}
                  />
                </div>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                  <label htmlFor="lastName" className="sr-only">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                  <label htmlFor="middleName" className="sr-only">Middle name</label>
                  <input
                    id="middleName"
                    type="text"
                    autoComplete="additional-name"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Middle Name"
                    disabled={isLoading}
                  />
                </div>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                  <label htmlFor="suffix" className="sr-only">Suffix</label>
                  <input
                    id="suffix"
                    type="text"
                    autoComplete="honorific-suffix"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 pr-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={suffixEnabled ? suffix : ""}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="Suffix"
                    disabled={isLoading || !suffixEnabled}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSuffixEnabled((prev) => {
                        const next = !prev;
                        if (!next) setSuffix("");
                        return next;
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--iris-text-subtle)] hover:text-[var(--iris-primary)]"
                    aria-label={suffixEnabled ? "Disable suffix" : "Enable suffix"}
                  >
                    {suffixEnabled ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                  <label htmlFor="contact" className="sr-only">Contact</label>
                  <input
                    id="contact"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    value={contact}
                    onChange={(e) => setContact(formatPhilippinesContact(e.target.value))}
                    placeholder="Phone Number"
                    disabled={isLoading}
                  />
                </div>

<div className="relative">
  <UserCheck className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

  <button
    type="button"
    onClick={() => setGenderOpen((prev) => !prev)}
    className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-left text-sm text-[var(--iris-text)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
    disabled={isLoading}
  >
    {gender === "" ? "Select Gender" : gender === "MALE" ? "Male" : "Female"}
  </button>

  {/* dropdown arrow */}
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

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <label htmlFor="street" className="sr-only">Street</label>
                <input
                  id="street"
                  type="text"
                  autoComplete="street-address"
                  aria-autocomplete="list"
                  aria-expanded={showStreetSuggestions}
                  aria-controls="street-suggestions"
                  className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onFocus={() => setStreetFocused(true)}
                  onBlur={(event) => {
                    const match = findStreetMatch(event.currentTarget.value);
                    if (match) {
                      setStreet(formatStreetWithBarangay(match));
                    }
                    setStreetFocused(false);
                  }}
                  placeholder="Street"
                  disabled={isLoading}
                />
                {showStreetSuggestions && (
                  <div
                    id="street-suggestions"
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-auto rounded-2xl border border-[var(--iris-border)] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.15)]"
                  >
                    {streetSuggestions.map((streetName) => (
                      <button
                        key={streetName}
                        type="button"
                        role="option"
                        aria-selected={streetQuery === streetName.toLowerCase()}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleStreetSelect(streetName)}
                        className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[var(--iris-primary-light)]/40 focus:bg-[var(--iris-primary-light)]/50 focus:outline-none"
                      >
                        <span className="text-sm font-semibold text-[var(--iris-text)]">{streetName}</span>
                        <span className="text-xs text-[var(--iris-text-subtle)]">{EAST_TAPINAC_BARANGAY}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <label htmlFor="password" className="sr-only">Password</label>
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 pr-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  disabled={isLoading}
                />
                {confirmPassword.length > 0 && confirmPassword === password ? (
                  <CheckCircle2 className="pointer-events-none absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--iris-text-subtle)] hover:text-[var(--iris-primary)]"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-primary-light)]/15 p-3">
                <div className="space-y-2 text-sm text-[var(--iris-text)]">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-[#D1D5DB] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)] accent-[var(--iris-primary)]"
                      checked={privacyAccepted}
                      onChange={() => handleAgreementToggle("privacy")}
                    />
                    <span>
                      I accept the{" "}
                      <button
                        type="button"
                        onClick={() => openLegalDoc("privacy")}
                        className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
                      >
                        Privacy Policy
                      </button>
                      .
                    </span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-[#D1D5DB] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)] accent-[var(--iris-primary)]"
                      checked={termsAccepted}
                      onChange={() => handleAgreementToggle("terms")}
                    />
                    <span>
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => openLegalDoc("terms")}
                        className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
                      >
                        Terms and Conditions
                      </button>
                      .
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !termsAccepted || !privacyAccepted}
                className="w-full rounded-xl bg-[var(--iris-primary)] py-2.5 text-white font-semibold shadow-[0_12px_30px_rgba(30,79,163,0.3)] transition-all duration-200 hover:bg-[var(--iris-primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" aria-hidden />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--iris-text-subtle)]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
                Sign in.
              </Link>
            </p>
          </div>  
        </div>
      </section>

      {legalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl">
            <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] shadow-2xl ring-1 ring-black/5 transition-all animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[var(--iris-border)] bg-[var(--iris-primary-light)]/40 px-6 py-4">
                <h3 className="text-lg font-semibold text-[var(--iris-text)] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[var(--iris-primary)]" />
                  {legalContent[legalDoc].title}
                </h3>
                <button
                  type="button"
                  onClick={() => setLegalDoc(null)}
                  aria-label="Close dialog"
                  className="rounded-full p-2 text-[var(--iris-text-subtle)] hover:bg-white/70 hover:text-[var(--iris-text)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto px-6 py-6 text-sm text-[var(--iris-text)] custom-scrollbar"
                onScroll={(event) => {
                  const target = event.currentTarget;
                  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 12) {
                    setLegalScrolledToEnd(true);
                  }
                }}
              >
                <div className="mb-6 rounded-2xl border border-[var(--iris-border)] bg-white/70 p-4 text-[var(--iris-primary-strong)]">
                  <p className="font-medium">{legalContent[legalDoc].intro}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {legalContent[legalDoc].body.map((item, index) => {
                    const [heading, ...rest] = item.split(": ");
                    const detail = rest.join(": ");
                    const icons = [ShieldCheck, ClipboardCheck, Database, UserCheck] as const;
                    const Icon = icons[index % icons.length];

                    return (
                      <div key={item} className="group rounded-2xl border border-[var(--iris-border)] bg-white p-4 transition-all hover:border-[var(--iris-primary)]/30 hover:shadow-sm">
                        <div className="mb-2 inline-flex items-center gap-2 text-[var(--iris-primary)]">
                          <div className="rounded-lg bg-[var(--iris-primary-light)] p-1.5 transition-colors group-hover:bg-[var(--iris-primary)] group-hover:text-white">
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--iris-text)] transition-colors group-hover:text-[var(--iris-primary)]">{heading}</p>
                        </div>
                        <p className="text-xs leading-relaxed text-[var(--iris-text-subtle)]">{detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--iris-border)] bg-[var(--iris-primary-light)]/20 px-6 py-4">
                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-[var(--iris-text-subtle)]">
                  <input
                    type="checkbox"
                    checked={legalAccepted}
                    disabled={legalDoc === "terms" && !legalScrolledToEnd}
                    onChange={(e) => setLegalAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D1D5DB] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)] accent-[var(--iris-primary)]"
                  />
                  <span className="font-medium">
                    {legalDoc === "terms" && !legalScrolledToEnd ? "Scroll to the bottom to accept" : "I have read and agree"}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (legalDoc === "terms") setTermsAccepted(true);
                    if (legalDoc === "privacy") setPrivacyAccepted(true);
                    setLegalDoc(null);
                  }}
                  disabled={!legalAccepted || (legalDoc === "terms" && !legalScrolledToEnd)}
                  className="rounded-lg bg-[var(--iris-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--iris-primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="w-full max-w-md rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] p-5 shadow-2xl">
            <div className="space-y-2 text-center">
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
                className="w-full rounded-xl bg-[var(--iris-primary)] py-2.5 font-semibold text-white shadow-[0_12px_30px_rgba(30,79,163,0.3)] transition hover:bg-[var(--iris-primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
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
  );
}