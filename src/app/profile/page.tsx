"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, KeyRound, Mail, RotateCw, Save, Upload, UserCircle2 } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getUserProfile, saveUserProfile, type UserProfile } from "@/lib/profile"

export default function ProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    photoUrl: "",
  })
  const [saved, setSaved] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [verificationCodeInput, setVerificationCodeInput] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [hasSentCode, setHasSentCode] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    setProfile(getUserProfile())
  }, [])

  useEffect(() => {
    if (!hasSentCode || resendCooldown <= 0) return

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [hasSentCode, resendCooldown])

  const update = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    saveUserProfile(profile)
    setSaved(true)
    toast({
      title: "Profile saved",
      description: "Your profile information was updated successfully.",
      variant: "success",
    })
  }

  const handleLocalImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported image format",
        description: "Please upload PNG, JPG, JPEG, or WEBP only.",
        variant: "warning",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      setProfile((prev) => ({ ...prev, photoUrl: result }))
      setSaved(false)
      toast({
        title: "Profile picture updated",
        description: "Your new profile image has been selected.",
        variant: "success",
      })
    }
    reader.readAsDataURL(file)
  }

  const sendVerificationCode = () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email address before sending a code.",
        variant: "warning",
      })
      return
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    setGeneratedCode(code)
    setHasSentCode(true)
    setResendCooldown(10)
    toast({
      title: "Verification code sent",
      description: `Demo code: ${code}`,
      variant: "success",
    })
  }

  const confirmEmailChange = () => {
    if (!hasSentCode) {
      toast({
        title: "Code required",
        description: "Send a verification code first.",
        variant: "warning",
      })
      return
    }

    if (verificationCodeInput !== generatedCode) {
      toast({
        title: "Invalid code",
        description: "The verification code does not match.",
        variant: "destructive",
      })
      return
    }

    setProfile((prev) => ({ ...prev, email: newEmail }))
    setSaved(false)
    setIsEmailDialogOpen(false)
    setNewEmail("")
    setGeneratedCode("")
    setVerificationCodeInput("")
    setHasSentCode(false)

    toast({
      title: "Email changed",
      description: "Your new email has been verified and saved.",
      variant: "success",
    })
  }

  const isEmailValid = newEmail.includes("@") && newEmail.includes(".")
  const canSendCode = isEmailValid && !hasSentCode
  const canResendCode = isEmailValid && hasSentCode && resendCooldown === 0
  const canConfirm = hasSentCode && verificationCodeInput.trim().length >= 6

  const initials = profile.fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Profile Overview"
          description="Manage your public and contact information"
        />

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="text-base">Profile Card</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border border-border">
                <AvatarImage src={profile.photoUrl} alt={profile.fullName} />
                <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
                  {initials || "AD"}
                </AvatarFallback>
              </Avatar>

              <div className="w-full space-y-2">
                <Label htmlFor="photoUpload" className="text-xs text-muted-foreground">
                  Upload profile picture
                </Label>
                <label
                  htmlFor="photoUpload"
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  Choose from this device
                </label>
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLocalImageUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Approved formats only: PNG, JPG, JPEG, WEBP.
                </p>
              </div>

              <div className="w-full rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-semibold text-foreground">{profile.fullName || "Admin User"}</p>
                <p className="text-xs text-muted-foreground">{profile.email || "admin@iris.local"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCircle2 className="h-4 w-4 text-primary" />
                Editable Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    className="focus-visible:ring-0 focus-visible:ring-transparent"
                    value={profile.fullName}
                    onChange={(event) => update("fullName", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="flex-1 text-sm text-foreground">{profile.email}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="focus-visible:ring-0 focus-visible:ring-transparent"
                      onClick={() => setIsEmailDialogOpen(true)}
                    >
                      Change Email
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    className="focus-visible:ring-0 focus-visible:ring-transparent"
                    value={profile.phone}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    className="focus-visible:ring-0 focus-visible:ring-transparent"
                    value={profile.address}
                    onChange={(event) => update("address", event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={profile.bio}
                  onChange={(event) => update("bio", event.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} className="gap-2 rounded-lg">
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
                {saved && <p className="text-sm text-emerald-700">Profile saved successfully.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <DialogHeader className="mb-2 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
                <KeyRound className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl">Change Email</DialogTitle>
              <DialogDescription className="mt-1">
                Enter your new email and verify with the code sent to your inbox.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">New email address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification code</Label>
                <Input
                  id="verificationCode"
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  value={verificationCodeInput}
                  onChange={(event) => setVerificationCodeInput(event.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>

              {!hasSentCode ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendVerificationCode}
                  disabled={!canSendCode}
                  className="w-full"
                >
                  Send Code
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendVerificationCode}
                    disabled={!canResendCode}
                    className="flex-1"
                  >
                    <RotateCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </Button>
                  <p className="w-14 text-right text-xs font-medium text-muted-foreground">
                    {resendCooldown > 0 ? `${resendCooldown}s` : "Ready"}
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={confirmEmailChange} disabled={!canConfirm}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
