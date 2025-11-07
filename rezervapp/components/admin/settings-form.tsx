"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Mail, MessageSquare, CreditCard, BarChart3, Save, Eye, EyeOff } from "lucide-react"

interface SettingsFormProps {
  restaurantId: string
  initialSettings?: {
    resendApiKey?: string | null
    twilioAccountSid?: string | null
    twilioAuthToken?: string | null
    twilioPhoneNumber?: string | null
    stripeApiKey?: string | null
    googleAnalyticsId?: string | null
  }
}

export function SettingsForm({ restaurantId, initialSettings }: SettingsFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Show/hide API keys
  const [showResend, setShowResend] = useState(false)
  const [showTwilio, setShowTwilio] = useState(false)
  const [showStripe, setShowStripe] = useState(false)

  const [formData, setFormData] = useState({
    resendApiKey: initialSettings?.resendApiKey || "",
    twilioAccountSid: initialSettings?.twilioAccountSid || "",
    twilioAuthToken: initialSettings?.twilioAuthToken || "",
    twilioPhoneNumber: initialSettings?.twilioPhoneNumber || "",
    stripeApiKey: initialSettings?.stripeApiKey || "",
    googleAnalyticsId: initialSettings?.googleAnalyticsId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          ...formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt")
      }

      toast({
        title: "Siker!",
        description: "Beállítások sikeresen mentve!",
      })
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült menteni a beállításokat",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Notifications (Resend) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Értesítések (Resend)
          </CardTitle>
          <CardDescription>
            Email megerősítések és emlékeztetők küldése vendégeknek
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resendApiKey">Resend API Key</Label>
            <div className="flex gap-2">
              <Input
                id="resendApiKey"
                type={showResend ? "text" : "password"}
                value={formData.resendApiKey}
                onChange={(e) => handleChange("resendApiKey", e.target.value)}
                placeholder="re_xxxxxxxxxxxx"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowResend(!showResend)}
              >
                {showResend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ingyenes 100 email/hó: <a href="https://resend.com" target="_blank" className="underline">resend.com</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications (Twilio) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Értesítések (Twilio)
          </CardTitle>
          <CardDescription>
            SMS emlékeztetők küldése vendégeknek
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
            <Input
              id="twilioAccountSid"
              value={formData.twilioAccountSid}
              onChange={(e) => handleChange("twilioAccountSid", e.target.value)}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
            <div className="flex gap-2">
              <Input
                id="twilioAuthToken"
                type={showTwilio ? "text" : "password"}
                value={formData.twilioAuthToken}
                onChange={(e) => handleChange("twilioAuthToken", e.target.value)}
                placeholder="Auth Token"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowTwilio(!showTwilio)}
              >
                {showTwilio ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
            <Input
              id="twilioPhoneNumber"
              type="tel"
              value={formData.twilioPhoneNumber}
              onChange={(e) => handleChange("twilioPhoneNumber", e.target.value)}
              placeholder="+36301234567"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            ~$0.01/SMS: <a href="https://twilio.com" target="_blank" className="underline">twilio.com</a>
          </p>
        </CardContent>
      </Card>

      {/* Payment (Stripe) - Optional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fizetés (Stripe) - Opcionális
          </CardTitle>
          <CardDescription>
            Online fizetés fogadása (jövőbeli funkció)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripeApiKey">Stripe API Key</Label>
            <div className="flex gap-2">
              <Input
                id="stripeApiKey"
                type={showStripe ? "text" : "password"}
                value={formData.stripeApiKey}
                onChange={(e) => handleChange("stripeApiKey", e.target.value)}
                placeholder="sk_xxxxxxxxxxxx"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowStripe(!showStripe)}
              >
                {showStripe ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics (Google Analytics) - Optional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics (Google) - Opcionális
          </CardTitle>
          <CardDescription>
            Látogatói statisztikák követése
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
            <Input
              id="googleAnalyticsId"
              value={formData.googleAnalyticsId}
              onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Mentés..." : "Beállítások mentése"}
        </Button>
      </div>
    </form>
  )
}
