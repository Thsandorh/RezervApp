import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Check, X } from "lucide-react"

export default function SettingsPage() {
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY
  const webhookConfigured = !!process.env.STRIPE_WEBHOOK_SECRET

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Beállítások</h2>
        <p className="text-muted-foreground">
          Rendszer beállítások és konfiguráció
        </p>
      </div>

      {/* Stripe Payment Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6" />
              <div>
                <CardTitle>Stripe Fizetési Integráció</CardTitle>
                <CardDescription>Online bankkártyás fizetés kezelése (opcionális)</CardDescription>
              </div>
            </div>
            <Badge variant={stripeConfigured ? "success" : "secondary"}>
              {stripeConfigured ? "Aktív" : "Nincs beállítva"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!stripeConfigured && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p><strong>Megjegyzés:</strong> A Stripe integráció teljesen opcionális. Az alkalmazás Stripe nélkül is működik, ilyenkor a foglalások standard módon kerülnek rögzítésre fizetési funkció nélkül.</p>
            </div>
          )}
          {/* API Keys Status */}
          <div className="space-y-3">
            <h3 className="font-semibold">API Kulcsok Állapota</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">STRIPE_SECRET_KEY</span>
                {stripeConfigured ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Beállítva</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <X className="h-4 w-4" />
                    <span className="text-sm">Nincs beállítva</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">STRIPE_WEBHOOK_SECRET</span>
                {webhookConfigured ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Beállítva</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <X className="h-4 w-4" />
                    <span className="text-sm">Nincs beállítva</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Beállítási Útmutató</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>1. Stripe Account létrehozása:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Regisztrálj a stripe.com oldalon</li>
                <li>Állítsd be a fiókod (cégadatok, banki információk)</li>
              </ul>

              <p className="pt-2"><strong>2. API Kulcsok megszerzése:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Lépj be a Stripe Dashboard-ra</li>
                <li>Developers → API keys menüpont</li>
                <li>Másold ki a Secret key értéket</li>
              </ul>

              <p className="pt-2"><strong>3. Környezeti változók beállítása:</strong></p>
              <div className="bg-gray-100 p-3 rounded-md font-mono text-xs overflow-x-auto">
                STRIPE_SECRET_KEY=sk_test_... vagy sk_live_...<br/>
                STRIPE_WEBHOOK_SECRET=whsec_...
              </div>

              <p className="pt-2"><strong>4. Webhook beállítása:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Stripe Dashboard → Developers → Webhooks</li>
                <li>Add endpoint: yoursite.com/api/payments/webhook</li>
                <li>Válaszd ki: checkout.session.completed</li>
                <li>Másold ki a webhook signing secret-et</li>
              </ul>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="space-y-3">
            <h3 className="font-semibold">API Endpointok</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono text-xs">POST /api/payments/create-checkout</span>
                <Badge variant="outline" className="text-xs">Checkout létrehozás</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono text-xs">POST /api/payments/webhook</span>
                <Badge variant="outline" className="text-xs">Stripe webhook</Badge>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold">Funkciók</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Bankkártyás fizetés (Visa, Mastercard, Amex)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Automatikus foglalás megerősítés sikeres fizetés után</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Biztonságos fizetés SSL titkosítással</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Webhook integráció valós idejű státusz frissítéshez</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Foglalás belső jegyzetekben rögzített fizetési információk</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
