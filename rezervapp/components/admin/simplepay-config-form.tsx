"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, CheckCircle, XCircle } from "lucide-react"

const simplePaySchema = z.object({
  merchantId: z.string().min(1, "Merchant ID kötelező"),
  secretKey: z.string().min(1, "Secret Key kötelező"),
})

type SimplePayData = z.infer<typeof simplePaySchema>

interface SimplePayConfigFormProps {
  restaurantId: string
  initialMerchantId?: string
  initialSecretKey?: string
}

export function SimplePayConfigForm({
  restaurantId,
  initialMerchantId = "",
  initialSecretKey = "",
}: SimplePayConfigFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfigured, setIsConfigured] = useState(!!initialMerchantId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SimplePayData>({
    resolver: zodResolver(simplePaySchema),
    defaultValues: {
      merchantId: initialMerchantId,
      secretKey: initialSecretKey ? "••••••••••••••••" : "",
    },
  })

  const onSubmit = async (data: SimplePayData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/simplepay-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          ...data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt")
      }

      toast({
        title: "Siker!",
        description: "SimplePay konfiguráció sikeresen mentve!",
      })

      setIsConfigured(true)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült menteni a konfigurációt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm("Biztosan törölni szeretnéd a SimplePay konfigurációt?")) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/simplepay-config`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt")
      }

      toast({
        title: "Siker!",
        description: "SimplePay konfiguráció törölve!",
      })

      setIsConfigured(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült törölni a konfigurációt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              SimplePay Konfiguráció
              {isConfigured && <CheckCircle className="h-5 w-5 text-green-600" />}
              {!isConfigured && <XCircle className="h-5 w-5 text-gray-400" />}
            </CardTitle>
            <CardDescription>
              Magyar online fizetési rendszer (OTP SimplePay)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchantId">Merchant ID</Label>
            <Input
              id="merchantId"
              {...register("merchantId")}
              placeholder="MERCHANT-12345678"
            />
            {errors.merchantId && (
              <p className="text-sm text-destructive">{errors.merchantId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              {...register("secretKey")}
              placeholder="SimplePay secret key"
            />
            {errors.secretKey && (
              <p className="text-sm text-destructive">{errors.secretKey.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              A kulcs biztonságosan titkosítva lesz az adatbázisban
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Hogyan szerezd meg a SimplePay kulcsokat?</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
              <li>Jelentkezz be a SimplePay kereskedői felületére</li>
              <li>Menj a Beállítások &gt; API kulcsok menüpontba</li>
              <li>Másold ki a Merchant ID-t és a Secret Key-t</li>
              <li>Állítsd be az IPN URL-t: <code className="bg-white px-1 rounded text-xs">{process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com'}/api/payments/simplepay-ipn</code></li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Mentés
            </Button>

            {isConfigured && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                disabled={isSubmitting}
              >
                Törlés
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
