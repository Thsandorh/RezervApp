"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Loader2, Eye, EyeOff, AlertTriangle, CheckCircle2, Lock } from "lucide-react"

interface SimplePayConfig {
  configured: boolean
  source: "environment" | "database" | "none"
  merchantId?: string
  secretKey?: string
  sandboxMode?: boolean
}

export function SimplePayConfigForm() {
  const [config, setConfig] = useState<SimplePayConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [merchantId, setMerchantId] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [sandboxMode, setSandboxMode] = useState(true)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/simplepay-config")

      if (!response.ok) {
        throw new Error("Nem sikerült betölteni a konfigurációt")
      }

      const data = await response.json()
      setConfig(data)
      if (data.configured && data.sandboxMode !== undefined) {
        setSandboxMode(data.sandboxMode)
      }
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
      const response = await fetch("/api/admin/simplepay-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          secretKey,
          sandboxMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Hiba történt a mentés során")
      }

      setSuccess("SimplePay konfiguráció sikeresen mentve!")
      setEditMode(false)
      setMerchantId("")
      setSecretKey("")

      await loadConfig()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Biztosan törölni szeretnéd a SimplePay konfigurációt az adatbázisból?")) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/simplepay-config", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Hiba történt a törlés során")
      }

      setSuccess("SimplePay konfiguráció törölve!")
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
      {config?.source === "environment" && (
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Környezeti változóból betöltve (.env):</strong> A SimplePay kulcsok a .env fájlban vannak beállítva.
          </AlertDescription>
        </Alert>
      )}

      {config?.source === "database" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Adatbázisból betöltve:</strong> A SimplePay kulcsok titkosítva vannak tárolva az adatbázisban.
          </AlertDescription>
        </Alert>
      )}

      {config?.configured && (
        <div className="space-y-3">
          <h3 className="font-semibold">Jelenlegi Konfiguráció</h3>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Merchant ID</span>
              <span className="text-sm font-mono text-muted-foreground">
                {config.merchantId || "****"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Secret Key</span>
              <span className="text-sm font-mono text-muted-foreground">****</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Környezet</span>
              <span className="text-sm font-medium">
                {config.sandboxMode ? "🧪 Teszt (Sandbox)" : "🚀 Éles"}
              </span>
            </div>
          </div>
        </div>
      )}

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

      {(editMode || config?.source === "none") && (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchantId">SimplePay Merchant ID *</Label>
            <Input
              id="merchantId"
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="MERCHANT-12345678"
              required
            />
            <p className="text-xs text-muted-foreground">
              SimplePay Admin → Beállítások → Merchant azonosító
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">SimplePay Secret Key *</Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="********************************"
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
              SimplePay Admin → Beállítások → Titkosítási kulcs
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="sandboxMode"
              checked={sandboxMode}
              onCheckedChange={setSandboxMode}
            />
            <Label htmlFor="sandboxMode" className="cursor-pointer">
              Teszt mód (Sandbox) - {sandboxMode ? "Bekapcsolva" : "Kikapcsolva"}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Teszt módban nem történik valódi pénzmozgás
          </p>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving || !merchantId || !secretKey}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mentés
            </Button>
            {editMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditMode(false)
                  setMerchantId("")
                  setSecretKey("")
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
            Nincs SimplePay konfiguráció beállítva. Add meg a kulcsokat fentebb vagy állítsd be a .env fájlban.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
