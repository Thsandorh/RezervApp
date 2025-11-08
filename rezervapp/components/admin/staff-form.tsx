"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface StaffFormProps {
  staff?: {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function StaffForm({ staff, open, onOpenChange, onSuccess }: StaffFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("STAFF")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const isEdit = !!staff

  useEffect(() => {
    if (staff) {
      setName(staff.name)
      setEmail(staff.email)
      setRole(staff.role)
      setIsActive(staff.isActive)
      setPassword("") // Clear password for edit
    } else {
      // Reset form for new staff
      setName("")
      setEmail("")
      setPassword("")
      setRole("STAFF")
      setIsActive(true)
    }
  }, [staff, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        // Update existing staff
        const updateData: any = { name, email, role, isActive }
        if (password) {
          updateData.password = password
        }

        const response = await fetch(`/api/admin/staff/${staff.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || "Hiba történt a munkatárs frissítése során")
        }

        toast.success("Munkatárs sikeresen frissítve")
      } else {
        // Create new staff
        if (!password) {
          toast.error("Jelszó megadása kötelező új munkatárs létrehozásához")
          setLoading(false)
          return
        }

        const response = await fetch("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || "Hiba történt a munkatárs létrehozása során")
        }

        toast.success("Munkatárs sikeresen létrehozva")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Staff form error:", error)
      toast.error(error instanceof Error ? error.message : "Hiba történt")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Munkatárs szerkesztése" : "Új munkatárs hozzáadása"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Név *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kovács János"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kovacs.janos@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Jelszó {isEdit ? "(hagyja üresen, ha nem szeretné megváltoztatni)" : "*"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required={!isEdit}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Szerepkör *</Label>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">Munkatárs</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="OWNER">Tulajdonos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between space-x-2 py-2">
              <Label htmlFor="isActive" className="cursor-pointer">
                Aktív fiók
              </Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={loading}
              />
            </div>
          )}

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
              {loading ? "Mentés..." : isEdit ? "Frissítés" : "Létrehozás"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
