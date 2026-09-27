  "use client";

import { useEffect, useMemo, useRef, useState } from "react";
  import Link from "next/link";
  import { useRouter } from "next/navigation";
  import {
    UserPlus,
    User,
    Mail,
    Lock,
    X,
    CheckCircle2,
    Upload,
    Eye,
    EyeOff,
    ShieldCheck,
    ClipboardCheck,
    Database,
    UserCheck,
    ArrowLeft,
    Phone,
    MapPin,
    RotateCcw
  } from "lucide-react";
  import { useToast } from "@/hooks/use-toast";
  import { type UserRole } from "@/lib/auth";
  import { cn } from "@/lib/utils";

  export const EAST_NEW_KALALAKE = "Barangay New Kalalake" as const;

  export const EAST_NEW_KALALAKE_STREETS: StreetRecord[] = [
    // Purok 1
    { name: "Gallagher Street", purok: 1, barangay: EAST_NEW_KALALAKE },
    { name: "Hansen Street", purok: 1, barangay: EAST_NEW_KALALAKE },
    { name: "Irving Street", purok: 1, barangay: EAST_NEW_KALALAKE },

    // Purok 2
    { name: "Labrador Street", purok: 2, barangay: EAST_NEW_KALALAKE },
    { name: "Rizal Street", purok: 2, barangay: EAST_NEW_KALALAKE },
    { name: "Fontaine Extension", purok: 2, barangay: EAST_NEW_KALALAKE },

    // Purok 3
    { name: "Hospital Road", purok: 3, barangay: EAST_NEW_KALALAKE },
    { name: "Dela Cruz Drive", purok: 3, barangay: EAST_NEW_KALALAKE },
    { name: "Fontaine Bridge", purok: 3, barangay: EAST_NEW_KALALAKE },

    // Purok 4
    { name: "Apelado Street", purok: 4, barangay: EAST_NEW_KALALAKE },
    { name: "East 14th Street", purok: 4, barangay: EAST_NEW_KALALAKE },
    { name: "Fontaine Extension", purok: 4, barangay: EAST_NEW_KALALAKE },

    // Purok 5
    { name: "East 14th Street", purok: 5, barangay: EAST_NEW_KALALAKE },
    { name: "East 13th Street", purok: 5, barangay: EAST_NEW_KALALAKE },
    { name: "11th Street", purok: 5, barangay: EAST_NEW_KALALAKE },
    { name: "Veterano Street", purok: 5, barangay: EAST_NEW_KALALAKE },
    { name: "Bacon Street", purok: 5, barangay: EAST_NEW_KALALAKE },
    { name: "East 9th Street", purok: 5, barangay: EAST_NEW_KALALAKE },
    { name: "Rizal Avenue", purok: 5, barangay: EAST_NEW_KALALAKE },

    // Purok 6
    { name: "Donor Street", purok: 6, barangay: EAST_NEW_KALALAKE },
    { name: "Llanos Street", purok: 6, barangay: EAST_NEW_KALALAKE },
    { name: "East 12th Street", purok: 6, barangay: EAST_NEW_KALALAKE },
    { name: "Fendler Street", purok: 6, barangay: EAST_NEW_KALALAKE },
    { name: "East 14th Street", purok: 6, barangay: EAST_NEW_KALALAKE },
    { name: "East 13th Street", purok: 6, barangay: EAST_NEW_KALALAKE },

    // Purok 7
    { name: "Fendler Street", purok: 7, barangay: EAST_NEW_KALALAKE },
    { name: "Gallagher Street", purok: 7, barangay: EAST_NEW_KALALAKE },
    { name: "Hansen Street", purok: 7, barangay: EAST_NEW_KALALAKE },
    { name: "Irving Street", purok: 7, barangay: EAST_NEW_KALALAKE },
    { name: "East 14th Street", purok: 7, barangay: EAST_NEW_KALALAKE },
    { name: "East 12th Street", purok: 7, barangay: EAST_NEW_KALALAKE },

    // Purok 8
    { name: "Bacon Street", purok: 8, barangay: EAST_NEW_KALALAKE },
    { name: "Fendler Street", purok: 8, barangay: EAST_NEW_KALALAKE },
    { name: "East 9th Street", purok: 8, barangay: EAST_NEW_KALALAKE },
    { name: "Magsaysay Drive", purok: 8, barangay: EAST_NEW_KALALAKE },
    { name: "Rizal Avenue", purok: 8, barangay: EAST_NEW_KALALAKE },

    // Purok 9
    { name: "Fendler Street", purok: 9, barangay: EAST_NEW_KALALAKE },
    { name: "Gallagher Street", purok: 9, barangay: EAST_NEW_KALALAKE },
    { name: "Hansen Street", purok: 9, barangay: EAST_NEW_KALALAKE },
    { name: "Irving Street", purok: 9, barangay: EAST_NEW_KALALAKE },
    { name: "East 12th Street", purok: 9, barangay: EAST_NEW_KALALAKE },
    { name: "East 10th Street", purok: 9, barangay: EAST_NEW_KALALAKE },

    // Purok 10
    { name: "Fendler Street", purok: 10, barangay: EAST_NEW_KALALAKE },
    { name: "East 10th Street", purok: 10, barangay: EAST_NEW_KALALAKE },
    { name: "East 8th Street", purok: 10, barangay: EAST_NEW_KALALAKE },
    { name: "East 6th Street", purok: 10, barangay: EAST_NEW_KALALAKE },
    { name: "Magsaysay Drive", purok: 10, barangay: EAST_NEW_KALALAKE },

    // Purok 11
    { name: "5th Street", purok: 11, barangay: EAST_NEW_KALALAKE },
    { name: "3rd Street", purok: 11, barangay: EAST_NEW_KALALAKE },
    { name: "Alba Street", purok: 11, barangay: EAST_NEW_KALALAKE },
    { name: "Fendler Street", purok: 11, barangay: EAST_NEW_KALALAKE },
    { name: "Lindayag Street", purok: 11, barangay: EAST_NEW_KALALAKE },
    { name: "Rizal Extension", purok: 11, barangay: EAST_NEW_KALALAKE },
  ];

  type StreetRecord = {
    name: string;
    purok: number;
    barangay: string;
  };

  type GeoPoint = {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };

  const groupedByPurok = EAST_NEW_KALALAKE_STREETS.reduce((acc, street) => {
    (acc[street.purok] ??= []).push(street);
    return acc;
  }, {} as Record<number, StreetRecord[]>);

  const SUFFIX_OPTIONS = ["Jr.", "Sr.", "II", "III", "IV", "V"] as const;

  const normalizeStreetQuery = (value: string) =>
    value.split(",")[0]?.trim().toLowerCase() ?? "";

  const findStreetMatch = (value: string) => {
    const query = normalizeStreetQuery(value);

    if (!query) return null;

    return EAST_NEW_KALALAKE_STREETS.find(
      (street) => street.name.toLowerCase() === query
    ) ?? null;
  };

  const getStreetSuggestions = (value: string) => {
    const query = normalizeStreetQuery(value);
    const seen = new Set<string>();

    return EAST_NEW_KALALAKE_STREETS
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

    const [gender, setGender] = useState<"" | "MALE" | "FEMALE" | "OTHER">("")
    const [genderOther, setGenderOther] = useState("")
    const [genderOpen, setGenderOpen] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [location, setLocation] = useState<(GeoPoint & { address: string; street: string; barangay: string }) | null>(null);
    const [contact, setContact] = useState("");
    const [street, setStreet] = useState("");
    
    const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);
    const [legalAccepted, setLegalAccepted] = useState(false);
    const [legalScrolledToEnd, setLegalScrolledToEnd] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

    const [verificationOpen, setVerificationOpen] = useState(false);
    const [viewIdOpen, setViewIdOpen] = useState(false);
    const [closingModal, setClosingModal] = useState<"legal" | "identity" | "verification" | null>(null);
    const closingModalTimers = useRef<Partial<Record<"legal" | "identity" | "verification", ReturnType<typeof setTimeout>>> >({});
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const [devCode, setDevCode] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const role: UserRole = "resident";

    const prepareModalOpen = (name: "legal" | "identity" | "verification") => {
      const timer = closingModalTimers.current[name];
      if (timer) clearTimeout(timer);
      delete closingModalTimers.current[name];
      setClosingModal((current) => current === name ? null : current);
    };

    const closeModal = (name: "legal" | "identity" | "verification", onClose: () => void) => {
      if (closingModalTimers.current[name]) return;
      setClosingModal(name);
      closingModalTimers.current[name] = setTimeout(() => {
        onClose();
        delete closingModalTimers.current[name];
        setClosingModal((current) => current === name ? null : current);
      }, 180);
    };

    useEffect(() => () => {
      Object.values(closingModalTimers.current).forEach((timer) => timer && clearTimeout(timer));
    }, []);

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

    const isPasswordValid =
      checks.length &&
      checks.uppercase &&
      checks.lowercase &&
      checks.number &&
      checks.special;

    const [step, setStep] = useState(1);
    const totalSteps = 5;
    const [verificationStatus, setVerificationStatus] =
      useState<"pending" | "verified" | "failed">("pending");
    const nextStep = () => {
      if (
        step === 4 &&
        verificationStatus !== "verified"
      ) {
        toast({
          title: "Verification required",
          description:
            "Please verify your identity before continuing.",
          variant: "warning",
        });

        return;
      }

      if (step < totalSteps) {
        setStep((prev) => prev + 1);
      }
    };

    const prevStep = () => {
      if (step > 1) setStep((prev) => prev - 1);
    };

    const canProceed = useMemo(() => {
      switch (step) {
        case 1:
          return (
            firstName.trim() &&
            lastName.trim() &&
            middleName.trim() &&
            gender && (gender !== "OTHER" || genderOther.trim())
          );

        case 2:
          return (
            email.trim() &&
            contact.trim().length >= 13
          );

        case 3:
          return street.trim().length > 0;

        case 4:
          return verificationStatus === "verified";

        case 5:
          return (
            password &&
            isPasswordValid &&
            termsAccepted &&
            privacyAccepted
          );

        default:
          return false;
      }
    }, [
      step,
      firstName,
      lastName,
      middleName,
      gender,
      genderOther,
      email,
      contact,
      street,
      verificationStatus,
      password,
      isPasswordValid,
      termsAccepted,
      privacyAccepted
    ]);

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
          description: "Type your address below to continue without location detection.",
          variant: "warning",
        });
        return;
      }

      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude, accuracy } = pos.coords;

            const response = await fetch("/api/location/resolve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ latitude, longitude, accuracy }),
            });

            const result = await response.json();

            if (!result.success) throw new Error(result.message);

            setLocation(result.data);
            setStreet(result.data?.street || result.data?.address || "");
          } catch (err) {
            toast({
              title: "Location failed",
              description:
                `${err instanceof Error ? err.message : "Unable to resolve location."} You can enter your address manually and continue.`,
              variant: "warning",
            });
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          setIsLocating(false);
          toast({
            title: "Location unavailable",
            description: `${err.message} You can enter your address manually and continue.`,
            variant: "warning",
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
      if (!idImage || !dateOfBirth) throw new Error("Upload a government ID and enter your date of birth.")
      const formData = new FormData()
      formData.set("fullName", fullName)
      formData.set("email", email)
      formData.set("password", password)
      formData.set("role", role)
      formData.set("street", street)
      formData.set("contact", contact)
      formData.set("gender", gender)
      formData.set("genderOther", genderOther)
      formData.set("dateOfBirth", dateOfBirth)
      formData.set("governmentId", idImage)
      if (location) {
        formData.set("locationLatitude", String(location.latitude))
        formData.set("locationLongitude", String(location.longitude))
        if (location.accuracy != null) formData.set("locationAccuracy", String(location.accuracy))
        formData.set("locationAddress", location.address)
      }
      const response = await fetch("/api/auth/signup/request-verification", {
        method: "POST",
        body: formData,
      });
      const result: { success: boolean; message: string; data?: { devCode?: string } } = await response.json();

      if (!result.success) throw new Error(result.message);

      setDevCode(result.data?.devCode ?? null);
      return result;
    };

    const calculateAge = (birthDate: string) => {
      if (!birthDate) return NaN;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return NaN;
      const [year, month, day] = birthDate.split("-").map(Number);
      const dob = new Date(year, month - 1, day);
      if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) return NaN;
      const today = new Date();
      let age = today.getFullYear() - year;
      if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;
      return age;
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
        prepareModalOpen("verification");
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
        const result: { success: boolean; message: string; data: { email: string; status: "Pending" } | null } = await response.json();

        if (!result.success || !result.data) throw new Error(result.message);

        toast({
          title: "Email verified",
          description: "Your ID is awaiting staff review. You can sign in after your account is approved.",
          variant: "success",
        });
        router.push("/login");
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
    const openLegalDoc = (doc: "terms" | "privacy") => {
      prepareModalOpen("legal");
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
          "Data We Collect: Name, email, contact, street, gender, date of birth, government ID image, and account credentials (stored securely).",
          "Case Information: Incident reports, evidence uploads, messages, and case updates needed for barangay workflows.",
          "How We Use Data: Verification, case management, notifications, analytics, and service improvement.",
          "Access & Sharing: Data is shared only with authorized barangay staff and officers for official purposes.",
          "Retention: Account and case data may be retained for audits, legal compliance, and public safety needs.",
          "Your Rights: You can request corrections or updates to your profile through the barangay administrator.",
        ],
      },
    } as const;

    const [idImage, setIdImage] = useState<File | null>(null);
    const [idImageUrl, setIdImageUrl] = useState("");

    useEffect(() => {
      if (!idImage) {
        setIdImageUrl("");
        return;
      }

      const imageUrl = URL.createObjectURL(idImage);
      setIdImageUrl(imageUrl);
      return () => URL.revokeObjectURL(imageUrl);
    }, [idImage]);

    const [dateOfBirth, setDateOfBirth] = useState("");

    const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
    const MINIMUM_AGE = 18;

    const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 4 * 1024 * 1024) {
        event.target.value = "";
        toast({
          title: "Unsupported ID image",
          description: "Upload a PNG or JPEG government ID image up to 4 MB.",
          variant: "warning",
        });
        return;
      }

      setIdImage(file);
      setIdentityConfirmed(false);
      setVerificationStatus("pending");
      setDateOfBirth("");
      setCalculatedAge(null);
    };

    
    const [isIdentityVerifying, setIsIdentityVerifying] = useState(false);
    const [identityConfirmed, setIdentityConfirmed] = useState(false);

    const verifyIdentity = async () => {
      setIsIdentityVerifying(true);

      try {
        if (!dateOfBirth || !idImage) {
          setVerificationStatus("failed");

          toast({
            title: "Verification failed",
            description: "Upload a government ID and enter the date of birth shown on it.",
            variant: "destructive",
          });

          return;
        }

        const age = calculateAge(dateOfBirth);

        if (Number.isNaN(age) || age < MINIMUM_AGE) {
          setVerificationStatus("failed");

          toast({
            title: "Verification failed",
            description: "You must be at least 18 years old.",
            variant: "destructive",
          });

          return;
        }

        setCalculatedAge(age);
        setIdentityConfirmed(true);
        setVerificationStatus("verified");

        toast({
          variant: "success",
          title: "Age requirement met",
          description: "Your ID will be reviewed by barangay staff before your account is activated.",
        });
      } finally {
        setIsIdentityVerifying(false);
      }
    };

    return (
    <>
    {/* MAIN LAYOUT */}
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] bg-[var(--iris-bg)] text-[var(--iris-text)]">

      {/* LEFT HERO */}
      <section
        className="relative hidden lg:flex overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at top left, rgba(217,165,20,0.18), transparent 35%),
            radial-gradient(circle at bottom right, rgba(255,255,255,0.06), transparent 45%),
            linear-gradient(
              150deg,
              #091225 0%,
              #101B35 35%,
              #14264A 70%,
              #091225 100%
            )
          `,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />

        <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-yellow-300/5 blur-3xl" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between p-14 text-white">

          <div className="space-y-10">

            <div className="flex items-center gap-4">
              <img
                src="/NewKalalake.png"
                alt="Barangay"
                className="h-16 w-16"
              />

              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-yellow-300">
                  IRIS PORTAL
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Barangay New Kalalake
                </h2>
              </div>
            </div>

            <div className="space-y-5 max-w-xl">

              <span className="inline-flex rounded-full bg-[var(--primary)]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300 border border-yellow-400/20">
                Create Account
              </span>

              <h1 className="text-5xl font-semibold leading-tight">
                Join the Community.
              </h1>

              <p className="text-lg leading-8 text-white/70">
                Register your secure resident account to report incidents,
                track requests, and stay connected with your barangay.
              </p>

            </div>

            {/* Steps */}
            <div className="space-y-6 pt-4">

              {[
                "Verify your identity",
                "Complete your resident profile",
                "Access services anytime"
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--foreground)] font-bold">
                    {index + 1}
                  </div>

                  <div>
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                </div>
              ))}

            </div>

          </div>

          <div className="flex justify-between text-xs text-white/50">
            <span>© 2026 IRIS</span>
          </div>

        </div>
      </section>

        {/* RIGHT SIDE */}
        <section className="flex min-h-screen items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
          <div
            className="
              w-full max-w-md
              overflow-visible
              rounded-3xl
              border border-[var(--iris-border)]
              bg-[var(--iris-surface)]/96
              shadow-[0_24px_70px_rgba(15,23,42,0.14)]
              backdrop-blur-xl
            "
          >

            {/* GO BACK INSIDE MODAL */}
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

              {/* HEADER */}
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
                    { number: 4, title: "Verify" },
                    { number: 5, title: "Security" },
                  ].map((item, index) => {
                    const active = step === item.number;
                    const completed = step > item.number;

                    return (
                      <div
                        key={item.number}
                        className="relative flex flex-1 items-center"
                      >
                        {/* CONNECTOR */}
                        {index < 4 && (
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

            {/* FORM */}
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
                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-36 overflow-y-auto rounded-2xl border border-[var(--iris-border)] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.15)] custom-scrollbar"
                      >
                        <button
                          type="button"
                          role="option"
                          aria-selected={suffix === ""}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSuffix("");
                            setSuffixOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-3 text-left text-sm font-semibold text-[var(--iris-text)] transition hover:bg-[var(--iris-primary-light)]/40",
                            suffix === "" ? "bg-[var(--iris-primary-light)]/40" : ""
                          )}
                        >
                          No suffix
                        </button>

                        {SUFFIX_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={suffix === option}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSuffix(option);
                              setSuffixOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-3 text-left text-sm font-semibold text-[var(--iris-text)] transition hover:bg-[var(--iris-primary-light)]/40",
                              suffix === option ? "bg-[var(--iris-primary-light)]/40" : ""
                            )}
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
                        : gender === "FEMALE"
                        ? "Female"
                        : "Other"}
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
                        className="absolute left-0 right-0 top-full z-20 mt-2 overflow-visible rounded-2xl border border-[var(--iris-border)] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.15)]"
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

                        <button
                          type="button"
                          role="option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setGender("OTHER");
                            setGenderOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-[var(--iris-text)] transition hover:bg-[var(--iris-primary-light)]/40"
                        >
                          Others
                        </button>
                      </div>
                    )}
                  </div>

                  {gender === "OTHER" && (
                    <label className="block space-y-2 sm:col-span-2">
                      <span className="text-xs font-semibold text-[var(--iris-text-subtle)]">Please specify</span>
                      <input
                        value={genderOther}
                        onChange={(event) => setGenderOther(event.target.value)}
                        maxLength={80}
                        required
                        disabled={isLoading}
                        className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-4 text-sm text-[var(--iris-text)] shadow-sm focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)]"
                        placeholder="Enter your gender"
                      />
                    </label>
                  )}
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
                            Address and location
                          </p>

                          <p className="text-xs leading-relaxed text-[var(--iris-text-subtle)]">
                            {location
                              ? `Barangay ${location.barangay}${location.accuracy != null ? ` • GPS accuracy about ${Math.round(location.accuracy)} m` : ""}`
                              : "Location detection is optional. You can enter an address from any barangay or city."}
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

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--iris-text)]">Street address *</span>
                    <input
                      type="text"
                      autoComplete="street-address"
                      value={street}
                      onChange={(event) => setStreet(event.target.value)}
                      placeholder="House number, street, barangay, city"
                      disabled={isLoading}
                      required
                      className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-4 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                    />
                    <span className="block text-xs leading-relaxed text-[var(--iris-text-subtle)]">
                      GPS only suggests an address. Signing up does not require being inside a barangay boundary or sharing your location.
                    </span>
                  </label>

                </div>
              )}

              {/* STEP 4 — VERIFY ID */}
              {step === 4 && (
                <div className="space-y-4">

                  <input
                    id="id-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleIdUpload}
                    className="hidden"
                  />

                  {!idImage && (
                    <label
                      htmlFor="id-upload"
                      className="
                        flex cursor-pointer items-center justify-center gap-3
                        rounded-2xl border border-dashed
                        border-[var(--iris-border)]
                        bg-[var(--iris-surface)]
                        px-5 py-5
                        transition-all
                        hover:border-[var(--iris-primary)]
                        hover:bg-[var(--iris-primary-light)]/10
                      "
                    >
                      <Upload className="h-5 w-5 text-[var(--iris-primary)]" />

                      <div className="text-left">
                        <p className="font-semibold text-[var(--iris-text)]">
                          Upload Government ID
                        </p>

                        <p className="text-xs text-[var(--iris-text-subtle)]">
                          PNG or JPEG, up to 4 MB. Barangay staff will review it.
                        </p>
                      </div>
                    </label>
                  )}

                  {idImage && (
                  <>
                  <div className="rounded-2xl border border-[var(--iris-border)] bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-[var(--iris-primary)]" />
                      <h4 className="font-semibold text-[var(--iris-text)]">
                        Government ID
                      </h4>
                    </div>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() => { prepareModalOpen("identity"); setViewIdOpen(true); }}
                        title="View uploaded government ID"
                        aria-label="View uploaded government ID"
                        className="
                          rounded-xl border border-[var(--iris-border)]
                          bg-white p-2
                          transition hover:bg-[var(--iris-primary-light)]/20
                        "
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <label
                        htmlFor="id-upload"
                        title="Replace uploaded government ID"
                        aria-label="Replace uploaded government ID"
                        className="
                          cursor-pointer rounded-xl
                          border border-[var(--iris-border)]
                          bg-white p-2
                          transition hover:bg-[var(--iris-primary-light)]/20
                        "
                      >
                        <RotateCcw className="h-4 w-4" />
                      </label>
                    </div>
                  </div>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="date-of-birth" className="mb-1 block text-xs text-[var(--iris-text-subtle)]">
                          Date of birth shown on your ID
                        </label>
                        <input
                          id="date-of-birth"
                          type="date"
                          value={dateOfBirth}
                          max={new Date().toISOString().slice(0, 10)}
                          onChange={(event) => {
                            setDateOfBirth(event.target.value)
                            setCalculatedAge(null)
                            setIdentityConfirmed(false)
                            setVerificationStatus("pending")
                          }}
                          required
                          disabled={isLoading}
                          className="h-11 w-full rounded-xl border border-[var(--iris-border)] bg-white px-3 text-sm text-[var(--iris-text)] focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)]"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-[var(--iris-text-subtle)]">
                          Age
                        </p>

                        <p className="font-medium">
                          {calculatedAge === null ? "-" : calculatedAge}
                        </p>
                      </div>

                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={verifyIdentity}
                    disabled={!idImage || identityConfirmed || isIdentityVerifying}
                    className="
                      w-full rounded-xl
                      bg-[var(--iris-primary)]
                      py-3 font-semibold text-white
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isIdentityVerifying
                      ? "Verifying..."
                      : identityConfirmed
                      ? "Age requirement met"
                      : "Check age eligibility"}
                  </button>

                  </>
                  )}


                </div>
                )}

              {/* STEP 5 — SECURITY */}
              {step === 5 && (
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

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                  disabled={!canProceed}
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

        {/* Identity review modal removed — verification now happens inline */}

        {legalDoc && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 motion-reduce:animate-none ${closingModal === "legal" ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200"}`}>
            <div className="w-full max-w-2xl">
              <div className={`flex max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-[var(--iris-border)] bg-[var(--iris-surface)] shadow-[0_30px_80px_rgba(15,23,42,0.18)] ring-1 ring-black/5 motion-reduce:animate-none ${closingModal === "legal" ? "animate-out zoom-out-95 duration-200" : "animate-in zoom-in-95 duration-200"}`}>

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
                    onClick={() => closeModal("legal", () => setLegalDoc(null))}
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

                      closeModal("legal", () => setLegalDoc(null));
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

        {viewIdOpen && idImageUrl && (
          <div className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 motion-reduce:animate-none ${closingModal === "identity" ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200"}`}>

            <div className={`relative max-w-4xl motion-reduce:animate-none ${closingModal === "identity" ? "animate-out zoom-out-95 duration-200" : "animate-in zoom-in-95 duration-200"}`}>

              <button
                type="button"
                onClick={() => closeModal("identity", () => setViewIdOpen(false))}
                className="absolute right-2 top-2 rounded-full bg-white p-2"
              >
                <X className="h-4 w-4" />
              </button>

              <img
                src={idImageUrl}
                alt="Government ID"
                decoding="async"
                className="max-h-[90vh] rounded-2xl"
              />

            </div>

          </div>
        )}

        {verificationOpen && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm motion-reduce:animate-none ${closingModal === "verification" ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200"}`}>
            <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] p-5 shadow-2xl motion-reduce:animate-none ${closingModal === "verification" ? "animate-out zoom-out-95 duration-200" : "animate-in zoom-in-95 duration-200"}`}>
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
                    onClick={() => closeModal("verification", () => setVerificationOpen(false))}
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
