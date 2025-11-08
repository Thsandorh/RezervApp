"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface RestaurantFormProps {
  restaurant?: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RestaurantForm({
  restaurant,
  open,
  onOpenChange,
  onSuccess,
}: RestaurantFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    slug: restaurant?.slug || "",
    email: restaurant?.email || "",
    phone: restaurant?.phone || "",
    address: restaurant?.address || "",
    city: restaurant?.city || "",
    postalCode: restaurant?.postalCode || "",
    timeZone: restaurant?.timeZone || "Europe/Budapest",
    currency: restaurant?.currency || "HUF",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug from name
    if (name === "name" && !restaurant) {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with -
        .replace(/^-|-$/g, "") // Remove leading/trailing -
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = restaurant
        ? `/api/admin/restaurants/${restaurant.id}`
        : "/api/admin/restaurants"

      const method = restaurant ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to save restaurant")
      }

      toast.success(
        restaurant
          ? "Étterem sikeresen frissítve!"
          : "Étterem sikeresen létrehozva!"
      )

      onOpenChange(false)
      onSuccess?.()
      router.refresh()
    } catch (error: any) {
      console.error("Error saving restaurant:", error)
      toast.error(error.message || "Hiba történt a mentés során")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {restaurant ? "Étterem szerkesztése" : "Új étterem hozzáadása"}
          </DialogTitle>
          <DialogDescription>
            {restaurant
              ? "Frissítsd az étterem adatait"
              : "Add meg az új étterem részleteit"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Étterem neve *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Pizzeria Romana"
                required
              />
            </div>

            {/* Slug */}
            <div className="grid gap-2">
              <Label htmlFor="slug">
                URL slug * <span className="text-xs text-gray-500">(egyedi azonosító)</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="pizzeria-romana"
                pattern="[a-z0-9-]+"
                title="Csak kisbetű, szám és kötőjel használható"
                required
              />
              <p className="text-xs text-gray-500">
                Például: pizzeria-romana (csak kisbetű, szám és kötőjel)
              </p>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email cím *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@pizzeriaromana.hu"
                required
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefonszám *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+36 30 123 4567"
                required
              />
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Cím *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Fő utca 1."
                required
              />
            </div>

            {/* City */}
            <div className="grid gap-2">
              <Label htmlFor="city">Város *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Budapest"
                required
              />
            </div>

            {/* Postal Code */}
            <div className="grid gap-2">
              <Label htmlFor="postalCode">Irányítószám</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="1011"
              />
            </div>

            {/* Time Zone */}
            <div className="grid gap-2">
              <Label htmlFor="timeZone">Időzóna</Label>
              <Input
                id="timeZone"
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                placeholder="Europe/Budapest"
              />
            </div>

            {/* Currency */}
            <div className="grid gap-2">
              <Label htmlFor="currency">Pénznem</Label>
              <Input
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder="HUF"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Mégse
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Mentés..." : restaurant ? "Frissítés" : "Létrehozás"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
