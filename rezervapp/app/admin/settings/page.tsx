import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Check, Shield } from "lucide-react"
import { StripeConfigForm } from "@/components/admin/stripe-config-form"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default async function SettingsPage() {
  const session = await auth()

  // Only OWNER can access settings
  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/admin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Beállítások</h2>
        <p className="text-muted-foreground">
          Rendszer beállítások és konfiguráció (csak tulajdonos)
        </p>
      </div>

      {/* Security Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-blue-900">Biztonsági Beállítások</CardTitle>
              <CardDescription className="text-blue-700">
                Az érzékeny adatok (API kulcsok) AES-256 titkosítással védettek
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <ul className="space-y-1 ml-4">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Account Lockout:</strong> 5 sikertelen bejelentkezés után 30 perc zárolás</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Titkosított tárolás:</strong> Minden API kulcs titkosítva van az adatbázisban</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Login tracking:</strong> Sikertelen bejelentkezési kísérletek naplózása</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Brute force protection:</strong> Rate limiting és automatikus zárolás</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Stripe Payment Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6" />
            <div>
              <CardTitle>Stripe Fizetési Integráció</CardTitle>
              <CardDescription>Online bankkártyás fizetés kezelése (opcionális)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p><strong>Megjegyzés:</strong> A Stripe integráció teljesen opcionális. Az alkalmazás Stripe nélkül is működik.</p>
          </div>

          {/* Stripe Configuration Form */}
          <StripeConfigForm />

          {/* Setup Instructions */}
          <div className="space-y-3 border-t pt-6">
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
                <li>Másold ki a Secret key értéket (sk_test_... vagy sk_live_...)</li>
              </ul>

              <p className="pt-2"><strong>3. Webhook beállítása (opcionális, de ajánlott):</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Stripe Dashboard → Developers → Webhooks</li>
                <li>Add endpoint: yoursite.com/api/payments/webhook</li>
                <li>Válaszd ki: checkout.session.completed, checkout.session.expired</li>
                <li>Másold ki a webhook signing secret-et (whsec_...)</li>
              </ul>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="space-y-3 border-t pt-6">
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
          <div className="space-y-3 border-t pt-6">
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
                <span>Titkosított kulcs tárolás az adatbázisban</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
