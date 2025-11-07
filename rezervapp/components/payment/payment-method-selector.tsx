"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface PaymentMethodSelectorProps {
  bookingId: string
  amount: number
  currency?: string
  stripeEnabled: boolean
  simplePayEnabled: boolean
}

export function PaymentMethodSelector({
  bookingId,
  amount,
  currency = "HUF",
  stripeEnabled,
  simplePayEnabled,
}: PaymentMethodSelectorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "simplepay" | null>(null)

  const handleStripeCheckout = async () => {
    setIsProcessing(true)
    setSelectedMethod("stripe")

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount,
          currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Fizetési hiba")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült elindítani a fizetést",
        variant: "destructive",
      })
      setIsProcessing(false)
      setSelectedMethod(null)
    }
  }

  const handleSimplePayCheckout = async () => {
    setIsProcessing(true)
    setSelectedMethod("simplepay")

    try {
      const response = await fetch("/api/payments/simplepay-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount,
          currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Fizetési hiba")
      }

      // Redirect to SimplePay
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült elindítani a fizetést",
        variant: "destructive",
      })
      setIsProcessing(false)
      setSelectedMethod(null)
    }
  }

  if (!stripeEnabled && !simplePayEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fizetési módok</CardTitle>
          <CardDescription>
            Jelenleg nem érhető el online fizetési lehetőség
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Válassz fizetési módot</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stripeEnabled && (
          <Card
            className={`cursor-pointer transition-all ${
              selectedMethod === "stripe"
                ? "ring-2 ring-primary"
                : "hover:border-primary"
            }`}
            onClick={!isProcessing ? handleStripeCheckout : undefined}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-lg">Bankkártya / Google Pay</CardTitle>
                  <CardDescription className="text-sm">
                    Biztonságos fizetés bankkártyával vagy Google Pay-jel
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleStripeCheckout}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing && selectedMethod === "stripe"
                  ? "Átirányítás..."
                  : "Fizetés"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Powered by Stripe
              </p>
            </CardContent>
          </Card>
        )}

        {simplePayEnabled && (
          <Card
            className={`cursor-pointer transition-all ${
              selectedMethod === "simplepay"
                ? "ring-2 ring-primary"
                : "hover:border-primary"
            }`}
            onClick={!isProcessing ? handleSimplePayCheckout : undefined}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-orange-600" />
                <div>
                  <CardTitle className="text-lg">SimplePay</CardTitle>
                  <CardDescription className="text-sm">
                    Biztonságos magyar online fizetés
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSimplePayCheckout}
                disabled={isProcessing}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isProcessing && selectedMethod === "simplepay"
                  ? "Átirányítás..."
                  : "Fizetés"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                OTP SimplePay
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Összeg: <strong>{amount.toLocaleString("hu-HU")} {currency}</strong>
      </p>
    </div>
  )
}
