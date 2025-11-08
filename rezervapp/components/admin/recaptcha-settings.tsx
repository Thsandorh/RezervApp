"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface RecaptchaSettingsProps {
  restaurantId: string
  initialSiteKey?: string | null
  initialSecretKey?: string | null
}

export function RecaptchaSettings({ restaurantId, initialSiteKey, initialSecretKey }: RecaptchaSettingsProps) {
  const [siteKey, setSiteKey] = useState(initialSiteKey || "")
  const [secretKey, setSecretKey] = useState(initialSecretKey || "")
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSiteKey(initialSiteKey || "")
    setSecretKey(initialSecretKey || "")
  }, [initialSiteKey, initialSecretKey])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/restaurant/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recaptchaSiteKey: siteKey || null,
          recaptchaSecretKey: secretKey || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Hiba történt a mentés során")
      }

      toast.success("Google reCAPTCHA beállítások sikeresen mentve")
    } catch (error) {
      console.error("Error saving reCAPTCHA settings:", error)
      toast.error("Hiba történt a mentés során")
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    if (!confirm("Biztosan törölni szeretné a Google reCAPTCHA beállításokat?")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/restaurant/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recaptchaSiteKey: null,
          recaptchaSecretKey: null,
        }),
      })

      if (!response.ok) {
        throw new Error("Hiba történt a törlés során")
      }

      setSiteKey("")
      setSecretKey("")
      toast.success("Google reCAPTCHA beállítások törölve")
    } catch (error) {
      console.error("Error clearing reCAPTCHA settings:", error)
      toast.error("Hiba történt a törlés során")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle>Google reCAPTCHA v3</CardTitle>
        </div>
        <CardDescription>
          Bot védelem a bejelentkezési oldalon. Szerezz kulcsokat:{" "}
          <a
            href="https://www.google.com/recaptcha/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google reCAPTCHA Admin
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recaptcha-site-key">Site Key (Publikus)</Label>
            <Input
              id="recaptcha-site-key"
              value={siteKey}
              onChange={(e) => setSiteKey(e.target.value)}
              placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Ez a kulcs a weboldalon fog megjelenni (publikus)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recaptcha-secret-key">Secret Key (Privát)</Label>
            <div className="relative">
              <Input
                id="recaptcha-secret-key"
                type={showSecretKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ez a kulcs biztonságosan titkosítva lesz tárolva az adatbázisban
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Fontos információk:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• reCAPTCHA v3 használata javasolt (láthatatlan védelem)</li>
              <li>• Az oldal újratöltése után lépnek érvénybe a beállítások</li>
              <li>• Ha nincs beállítva, a rendszer az .env fájlból veszi a kulcsokat</li>
              <li>• Production környezetben mindig használjon éles kulcsokat!</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Mentés..." : "Beállítások mentése"}
            </Button>
            {(siteKey || secretKey) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={loading}
              >
                Beállítások törlése
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
