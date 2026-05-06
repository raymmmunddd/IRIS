"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  RotateCw,
  Save,
  Shield,
  User,
} from "lucide-react";
import { ResidentNav } from "@/components/ResidentNav";
import { getAuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ResidentProfile {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  photoUrl: string;
}

const PROFILE_KEY = "iris_resident_profile";
const SECURITY_KEY = "iris_resident_security";

function loadProfile(email: string): ResidentProfile {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored
      ? JSON.parse(stored)
      : { fullName: "", email, phone: "", street: "", photoUrl: "" };
  } catch {
    return { fullName: "", email, phone: "", street: "", photoUrl: "" };
  }
}

function saveProfile(profile: ResidentProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function loadSecurity() {
  try {
    const stored = localStorage.getItem(SECURITY_KEY);
    return stored
      ? JSON.parse(stored)
      : { passwordLastUpdated: "Never", twoFactorEnabled: false };
  } catch {
    return { passwordLastUpdated: "Never", twoFactorEnabled: false };
  }
}

function saveSecurity(data: object) {
  localStorage.setItem(SECURITY_KEY, JSON.stringify(data));
}

function formatPasswordAge(value: string): string {
  if (!value || value === "Never") return "No password update recorded";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "No password update recorded";
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Updated just now";
  if (diffMin < 60) return `Updated ${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Updated ${diffH}h ago`;
  return `Updated on ${date.toLocaleDateString()}`;
}

type TabId = "profile" | "security";

export default function ResidentAccountPage() {
  const { toast } = useToast();
  const user = getAuthUser();
  const userEmail = user?.email ?? "";
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<TabId>("profile");
  const [profile, setProfile] = useState<ResidentProfile>({
    fullName: "",
    email: userEmail,
    phone: "",
    street: "",
    photoUrl: "",
  });

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Security
  const initialSecurity = loadSecurity();
  const [lastUpdated, setLastUpdated] = useState(initialSecurity.passwordLastUpdated);
  const [twoFactor, setTwoFactor] = useState(initialSecurity.twoFactorEnabled);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    if (!userEmail) return;
    Promise.resolve().then(() => setProfile(loadProfile(userEmail)));
    fetch(`/api/resident/profile?email=${encodeURIComponent(userEmail)}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success && result.data) {
          setProfile((current) => ({ ...result.data, photoUrl: current.photoUrl }));
        }
      })
      .catch(() => undefined);
  }, [userEmail]);

  useEffect(() => {
    if (!codeSent || cooldown <= 0) return;
    const t = setInterval(() => setCooldown((v) => (v <= 1 ? (clearInterval(t), 0) : v - 1)), 1000);
    return () => clearInterval(t);
  }, [codeSent, cooldown]);

  const updateField = (field: keyof ResidentProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    saveProfile(profile);
    fetch("/api/resident/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }).catch(() => undefined);
    toast({ title: "Profile saved", description: "Your information has been updated." });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfile((prev) => ({ ...prev, photoUrl: result }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePasswordSave = () => {
    setPwMessage("");
    setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) {
      setPwMessage("Please fill in all password fields.");
      return;
    }
    if (newPw.length < 8) {
      setPwMessage("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwMessage("Passwords do not match.");
      return;
    }
    const now = new Date().toISOString();
    const sec = { passwordLastUpdated: now, twoFactorEnabled: twoFactor };
    saveSecurity(sec);
    setLastUpdated(now);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwSuccess(true);
    setPwMessage("Password updated successfully.");
  };

  const handleToggle2FA = () => {
    const next = !twoFactor;
    setTwoFactor(next);
    saveSecurity({ passwordLastUpdated: lastUpdated, twoFactorEnabled: next });
    toast({
      title: next ? "2FA Enabled" : "2FA Disabled",
      description: next ? "Two-factor authentication is now active." : "Two-factor authentication has been turned off.",
    });
  };

  const sendCode = () => {
    if (!newEmail.includes("@")) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setCodeSent(true);
    setCooldown(30);
    toast({ title: "Code sent", description: `Demo code: ${code}` });
  };

  const confirmEmail = () => {
    if (emailCode !== generatedCode) {
      toast({ title: "Invalid code", description: "The code does not match.", variant: "destructive" });
      return;
    }
    setProfile((prev) => ({ ...prev, email: newEmail }));
    setShowEmailForm(false);
    setNewEmail("");
    setEmailCode("");
    setCodeSent(false);
    toast({ title: "Email updated", description: "Your email address has been changed." });
  };

  const initials = profile.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "R";

  const passwordAgeLabel = formatPasswordAge(lastUpdated);
  const passwordHealthy = lastUpdated !== "Never";

  const TABS: Array<{ id: TabId; label: string; icon: typeof User }> = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-gradient-to-br from-[var(--primary)] via-[var(--primary-hover)] to-[#123472] px-4 pb-5 pt-4 text-white shadow-sm">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/resident"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/75">IRIS Resident</p>
              <h1 className="mt-1 text-xl font-bold">My Account</h1>
            </div>
            {/* Avatar */}
            <button
              onClick={() => fileRef.current?.click()}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-bold backdrop-blur ring-2 ring-white/30 hover:ring-white/60 transition overflow-hidden"
            >
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 pb-24 pt-4">
        {/* Tab switcher */}
        <div className="mb-4 flex rounded-xl border border-border bg-card p-1 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
                tab === id
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === "profile" && (
          <div className="space-y-4">
            {/* Avatar section */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div
                  className="relative flex h-16 w-16 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--primary)]/15 text-xl font-bold text-[var(--primary)] overflow-hidden ring-2 ring-[var(--primary)]/20"
                  onClick={() => fileRef.current?.click()}
                >
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile.fullName || "Resident User"}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    Change photo
                  </button>
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Personal Information
              </p>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Full Name</span>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    value={profile.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Contact Number</span>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Street</span>
                <input
                  value={profile.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  placeholder="Street name"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                />
              </label>

              <button
                onClick={handleSaveProfile}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
              >
                <Save className="h-4 w-4" />
                Save Profile
              </button>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Email Address
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 text-sm text-foreground truncate">{profile.email}</span>
                <button
                  onClick={() => setShowEmailForm((v) => !v)}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline flex-shrink-0"
                >
                  Change
                </button>
              </div>

              {showEmailForm && (
                <div className="space-y-2 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-3">
                  <input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    type="email"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                  />
                  {codeSent && (
                    <input
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="6-digit verification code"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                  )}
                  <div className="flex gap-2">
                    {!codeSent ? (
                      <button
                        onClick={sendCode}
                        disabled={!newEmail.includes("@")}
                        className="flex-1 rounded-lg bg-[var(--primary)] py-2 text-xs font-semibold text-white disabled:opacity-50 transition hover:bg-[var(--primary-hover)]"
                      >
                        Send Code
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={sendCode}
                          disabled={cooldown > 0}
                          className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50 transition hover:bg-muted"
                        >
                          <RotateCw className="h-3 w-3" />
                          {cooldown > 0 ? `${cooldown}s` : "Resend"}
                        </button>
                        <button
                          onClick={confirmEmail}
                          disabled={emailCode.length < 6}
                          className="flex-1 rounded-lg bg-[var(--primary)] py-2 text-xs font-semibold text-white disabled:opacity-50 transition hover:bg-[var(--primary-hover)]"
                        >
                          Confirm
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sign out */}
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Link>
          </div>
        )}

        {/* ── Security Tab ── */}
        {tab === "security" && (
          <div className="space-y-4">
            {/* Password change */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-bold text-foreground">Change Password</p>
              </div>

              {[
                { label: "Current Password", value: currentPw, setter: setCurrentPw },
                { label: "New Password", value: newPw, setter: setNewPw },
                { label: "Confirm New Password", value: confirmPw, setter: setConfirmPw },
              ].map(({ label, value, setter }) => (
                <label key={label} className="block space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                    <input
                      type={showPw ? "text" : "password"}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    <button onClick={() => setShowPw((v) => !v)} className="text-muted-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
              ))}

              <div className="rounded-lg border border-border bg-background/70 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                  {passwordAgeLabel}
                </p>
              </div>

              {pwMessage && (
                <p className={`text-xs font-medium ${pwSuccess ? "text-emerald-600" : "text-red-600"}`}>
                  {pwMessage}
                </p>
              )}

              <button
                onClick={handlePasswordSave}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
              >
                <Save className="h-4 w-4" />
                Update Password
              </button>
            </div>

            {/* Security snapshot */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-bold text-foreground">Security Snapshot</p>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">
                    {twoFactor ? "Active and configured" : "Not configured"}
                  </p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    twoFactor
                      ? "border border-border text-muted-foreground hover:bg-muted"
                      : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                  }`}
                >
                  {twoFactor ? "Disable" : "Enable"}
                </button>
              </div>

              {/* Password health */}
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
                {passwordHealthy ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    Password:{" "}
                    <span className={passwordHealthy ? "text-emerald-600" : "text-amber-600"}>
                      {passwordHealthy ? "Healthy" : "Needs rotation"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {passwordHealthy
                      ? "Updated recently. Keep rotating regularly."
                      : "Password age exceeds 30 days. Update it soon."}
                  </p>
                </div>
              </div>

              {/* Session */}
              <div className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-semibold">Active Session</p>
                <p className="text-xs text-muted-foreground">Current browser session is secured</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <ResidentNav />
    </div>
  );
}
