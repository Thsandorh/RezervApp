"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, AlertTriangle, CheckCircle2, Lock } from "lucide-react"

interface StripeConfig {
  configured: boolean
  source: "environment" | "database" | "none"
  secretKey?: string
  webhookSecret?: string
}

export function StripeConfigForm() {
  const [config, setConfig] = useState<StripeConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [secretKey, setSecretKey] = useState("")
  const [webhookSecret, setWebhookSecret] = useState("")
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/stripe-config")

      if (!response.ok) {
        throw new Error("Nem sikerült betölteni a konfigurációt")
      }

      const data = await response.json()
      setConfig(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/stripe-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secretKey,
          webhookSecret: webhookSecret || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Hiba történt a mentés során")
      }

      setSuccess("Stripe konfiguráció sikeresen mentve!")
      setEditMode(false)
      setSecretKey("")
      setWebhookSecret("")

      // Reload config to show masked values
      await loadConfig()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Biztosan törölni szeretnéd a Stripe konfigurációt az adatbázisból?")) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/stripe-config", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Hiba történt a törlés során")
      }

      setSuccess("Stripe konfiguráció törölve!")
      await loadConfig()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {config?.source === "environment" && (
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Környezeti változóból betöltve (.env):</strong> A Stripe kulcsok a .env fájlban vannak beállítva.
            Ezek prioritást élveznek az adatbázis beállításokkal szemben. Ha módosítani szeretnéd, szerkeszd a .env fájlt a szerveren.
          </AlertDescription>
        </Alert>
      )}

      {config?.source === "database" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Adatbázisból betöltve:</strong> A Stripe kulcsok titkosítva vannak tárolva az adatbázisban.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Configuration */}
      {config?.configured && (
        <div className="space-y-3">
          <h3 className="font-semibold">Jelenlegi Konfiguráció</h3>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Secret Key</span>
              <span className="text-sm font-mono text-muted-foreground">
                {config.secretKey || "****"}
              </span>
            </div>
            {config.webhookSecret && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Webhook Secret</span>
                <span className="text-sm font-mono text-muted-foreground">
                  {config.webhookSecret}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Edit Form */}
      {(editMode || config?.source === "none") && (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key *</Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_test_... vagy sk_live_..."
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Stripe Dashboard → Developers → API keys
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Stripe Webhook Secret (opcionális)</Label>
            <div className="relative">
              <Input
                id="webhookSecret"
                type={showWebhookSecret ? "text" : "password"}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="whsec_..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Stripe Dashboard → Developers → Webhooks → Signing secret
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving || !secretKey}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mentés
            </Button>
            {editMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditMode(false)
                  setSecretKey("")
                  setWebhookSecret("")
                  setError(null)
                }}
                disabled={saving}
              >
                Mégse
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Action Buttons */}
      {!editMode && config?.source === "database" && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setEditMode(true)}>
            Kulcsok módosítása
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Konfiguráció törlése
          </Button>
        </div>
      )}

      {!editMode && config?.source === "none" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nincs Stripe konfiguráció beállítva. Add meg a kulcsokat fentebb vagy állítsd be a .env fájlban.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
