"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface AddTableModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const LOCATIONS = [
  "Terasz",
  "Belső terem",
  "Bár melletti",
  "Ablak melletti",
  "VIP terem",
  "Egyéb"
]

export function AddTableModal({ open, onOpenChange, onSuccess }: AddTableModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "4",
    location: "Belső terem",
    isActive: true
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          capacity: parseInt(formData.capacity),
          location: formData.location,
          isActive: formData.isActive
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Hiba történt az asztal létrehozásakor")
      }

      toast({
        title: "Sikeres létrehozás",
        description: `${formData.name} asztal sikeresen létrehozva!`,
      })

      // Reset form
      setFormData({
        name: "",
        capacity: "4",
        location: "Belső terem",
        isActive: true
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Hiba",
        description: error instanceof Error ? error.message : "Hiba történt",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Új asztal hozzáadása</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Asztal neve *</Label>
            <Input
              id="name"
              placeholder="pl. Asztal 1, A1, Terasz 3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Kapacitás (fő) *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="20"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Elhelyezkedés *</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData({ ...formData, location: value })}
              disabled={loading}
            >
              <SelectTrigger id="location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Asztal aktív</Label>
              <p className="text-sm text-muted-foreground">
                Csak az aktív asztalokra lehet foglalást létrehozni
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Mégse
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Asztal létrehozása
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
