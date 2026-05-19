"use client"
export const dynamic = 'force-dynamic'

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
import { getAuthUser, saveAuthUser, type AuthUser } from "@/lib/auth"

type UserProfile = {
  fullName: string
  email: string
  phone: string
  address: string
  bio: string
  photoUrl: string
}

export default function ProfilePage() {
  const { toast } = useToast()
  const authUser = getAuthUser()
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: authUser?.email ?? "",
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
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState("")
  const [cropZoom, setCropZoom] = useState(1)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropPreviewSrc, setCropPreviewSrc] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!authUser?.email) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/profile?email=${encodeURIComponent(authUser.email)}`)
        const result = await response.json()
        if (result.success && result.data) {
          setProfile(result.data)
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [authUser?.email])

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

  useEffect(() => {
    if (!cropImageSrc) return

    buildCroppedImage(cropImageSrc, cropZoom, cropX, cropY, 320)
      .then(setCropPreviewSrc)
      .catch(() => setCropPreviewSrc(cropImageSrc))
  }, [cropImageSrc, cropZoom, cropX, cropY])

  const update = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          photoUrl: profile.photoUrl,
        }),
      })
      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.message)
      }

      setProfile(result.data)
      setSaved(true)
      toast({
        title: "Profile saved",
        description: "Your profile information was updated successfully.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save profile.",
        variant: "destructive",
      })
    }
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
      setCropImageSrc(result)
      setCropZoom(1)
      setCropX(0)
      setCropY(0)
      setIsCropDialogOpen(true)
    }
    reader.readAsDataURL(file)

    event.target.value = ""
  }

  const buildCroppedImage = (
    src: string,
    zoom: number,
    horizontalOffset: number,
    verticalOffset: number,
    outputSize: number,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = new Image()

      image.onload = () => {
        const sourceWidth = image.naturalWidth
        const sourceHeight = image.naturalHeight
        const shortestSide = Math.min(sourceWidth, sourceHeight)
        const cropSize = shortestSide / zoom

        const maxOffsetX = (sourceWidth - cropSize) / 2
        const maxOffsetY = (sourceHeight - cropSize) / 2
        const cropStartX = (sourceWidth - cropSize) / 2 + horizontalOffset * maxOffsetX
        const cropStartY = (sourceHeight - cropSize) / 2 + verticalOffset * maxOffsetY

        const clampedX = Math.max(0, Math.min(cropStartX, sourceWidth - cropSize))
        const clampedY = Math.max(0, Math.min(cropStartY, sourceHeight - cropSize))

        const canvas = document.createElement("canvas")
        canvas.width = outputSize
        canvas.height = outputSize

        const context = canvas.getContext("2d")
        if (!context) {
          reject(new Error("Could not initialize crop canvas"))
          return
        }

        context.drawImage(
          image,
          clampedX,
          clampedY,
          cropSize,
          cropSize,
          0,
          0,
          outputSize,
          outputSize,
        )

        resolve(canvas.toDataURL("image/png"))
      }

      image.onerror = () => reject(new Error("Failed to load image for cropping"))
      image.src = src
    })
  }

  const applyCroppedImage = async () => {
    if (!cropImageSrc) return

    let croppedDataUrl = ""
    try {
      croppedDataUrl = await buildCroppedImage(cropImageSrc, cropZoom, cropX, cropY, 512)
    } catch {
      toast({
        title: "Image crop failed",
        description: "Please try uploading your photo again.",
        variant: "destructive",
      })
      return
    }

    setProfile((prev) => ({ ...prev, photoUrl: croppedDataUrl }))
    setSaved(false)
    setIsCropDialogOpen(false)

    toast({
      title: "Profile picture updated",
      description: "Your cropped photo is ready for profile display.",
      variant: "success",
    })
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

  const confirmEmailChange = async () => {
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

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, nextEmail: newEmail }),
      })
      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.message)
      }

      setProfile(result.data)
      if (authUser) {
        saveAuthUser({ ...(authUser as AuthUser), email: result.data.email })
      }
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
    } catch (error) {
      toast({
        title: "Email change failed",
        description: error instanceof Error ? error.message : "Failed to change email.",
        variant: "destructive",
      })
    }
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
      <div className="hidden lg:flex h-screen shrink-0">
        <DashboardSidebar />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
        <DashboardHeader
          title="Profile Overview"
          description="Manage your public and contact information"
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
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
                Account Details
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
                  <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="flex-1 truncate text-sm text-foreground">{profile.email}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7 px-3 text-xs focus-visible:ring-0 focus-visible:ring-transparent"
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
        )}

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

        <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
          <DialogContent className="max-w-xl rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <DialogHeader>
              <DialogTitle>Crop Profile Picture</DialogTitle>
              <DialogDescription>
                Reposition and zoom your image so your preferred area appears in your profile avatar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="mx-auto h-64 w-64 overflow-hidden rounded-full border border-border bg-muted">
                {cropPreviewSrc && (
                  <img src={cropPreviewSrc} alt="Crop preview" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropZoom">Zoom</Label>
                <input
                  id="cropZoom"
                  type="range"
                  title="Zoom"
                  aria-label="Zoom"
                  min={1}
                  max={3}
                  step={0.1}
                  value={cropZoom}
                  onChange={(event) => setCropZoom(Number(event.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cropX">Horizontal Position</Label>
                  <input
                    id="cropX"
                    type="range"
                    title="Horizontal Position"
                    aria-label="Horizontal Position"
                    min={-1}
                    max={1}
                    step={0.01}
                    value={cropX}
                    onChange={(event) => setCropX(Number(event.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropY">Vertical Position</Label>
                  <input
                    id="cropY"
                    type="range"
                    title="Vertical Position"
                    aria-label="Vertical Position"
                    min={-1}
                    max={1}
                    step={0.01}
                    value={cropY}
                    onChange={(event) => setCropY(Number(event.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={applyCroppedImage}>
                Apply Crop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
