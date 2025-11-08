"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Shield } from "lucide-react"
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3"

function LoginForm() {
  const router = useRouter()
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Get reCAPTCHA token
      if (!executeRecaptcha) {
        setError("reCAPTCHA nem elérhető")
        setIsLoading(false)
        return
      }

      const token = await executeRecaptcha("login")

      const result = await signIn("credentials", {
        email,
        password,
        recaptchaToken: token,
        redirect: false,
      })

      if (result?.error) {
        // Check if it's a lockout error
        if (result.error.includes("Fiók zárolva")) {
          setError(result.error)
        } else {
          setError("Hibás email vagy jelszó")
        }
      } else {
        router.push("/admin/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("Hiba történt a bejelentkezés során")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Bejelentkezés</CardTitle>
          <CardDescription>
            RezervApp Admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pizzeriaromana.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Jelszó</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Bejelentkezés..." : "Bejelentkezés"}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Shield className="h-3 w-3" />
              <span>Védve Google reCAPTCHA-val</span>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>Demo fiók:</p>
              <p className="font-mono text-xs">
                admin@pizzeriaromana.hu / password123
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function LoginPage() {
  // Fetch reCAPTCHA config from database (with env fallback)
  let siteKey = null

  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/recaptcha-config`,
      { cache: 'no-store' }
    )
    if (response.ok) {
      const data = await response.json()
      siteKey = data.siteKey
    }
  } catch (error) {
    console.error('Error fetching reCAPTCHA config:', error)
    // Fallback to env variable
    siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  }

  if (!siteKey) {
    // Fallback without reCAPTCHA if not configured
    return <LoginFormWithoutRecaptcha />
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      <LoginForm />
    </GoogleReCaptchaProvider>
  )
}

// Fallback component without reCAPTCHA
function LoginFormWithoutRecaptcha() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes("Fiók zárolva")) {
          setError(result.error)
        } else {
          setError("Hibás email vagy jelszó")
        }
      } else {
        router.push("/admin/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("Hiba történt a bejelentkezés során")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Bejelentkezés</CardTitle>
          <CardDescription>
            RezervApp Admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pizzeriaromana.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Jelszó</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Bejelentkezés..." : "Bejelentkezés"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>Demo fiók:</p>
              <p className="font-mono text-xs">
                admin@pizzeriaromana.hu / password123
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
