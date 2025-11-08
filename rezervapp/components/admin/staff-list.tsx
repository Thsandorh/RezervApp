"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaffForm } from "./staff-form"
import { Pencil, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { hu } from "date-fns/locale"

interface Staff {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date | null
}

export function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null)

  async function loadStaff() {
    try {
      const response = await fetch("/api/admin/staff")
      if (!response.ok) throw new Error("Failed to load staff")
      const data = await response.json()
      setStaff(data)
    } catch (error) {
      console.error("Error loading staff:", error)
      toast.error("Hiba történt a munkatársak betöltése során")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  function handleAdd() {
    setSelectedStaff(null)
    setFormOpen(true)
  }

  function handleEdit(staffMember: Staff) {
    setSelectedStaff(staffMember)
    setFormOpen(true)
  }

  function handleDeleteClick(staffMember: Staff) {
    setStaffToDelete(staffMember)
    setDeleteDialogOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!staffToDelete) return

    try {
      const response = await fetch(`/api/admin/staff/${staffToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Hiba történt a törlés során")
      }

      toast.success("Munkatárs sikeresen törölve")
      loadStaff()
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast.error(error instanceof Error ? error.message : "Hiba történt a törlés során")
    } finally {
      setDeleteDialogOpen(false)
      setStaffToDelete(null)
    }
  }

  function getRoleBadge(role: string) {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      OWNER: { label: "Tulajdonos", variant: "destructive" },
      MANAGER: { label: "Manager", variant: "default" },
      STAFF: { label: "Munkatárs", variant: "secondary" },
    }

    const roleInfo = roleMap[role] || { label: role, variant: "outline" }
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Betöltés...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Munkatársak listája</CardTitle>
          <Button onClick={handleAdd}>
            <UserPlus className="h-4 w-4 mr-2" />
            Új munkatárs
          </Button>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Még nincsenek munkatársak
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Név</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Szerepkör</TableHead>
                    <TableHead>Státusz</TableHead>
                    <TableHead>Utolsó belépés</TableHead>
                    <TableHead>Létrehozva</TableHead>
                    <TableHead className="text-right">Műveletek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "default" : "outline"}>
                          {member.isActive ? "Aktív" : "Inaktív"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.lastLoginAt
                          ? format(new Date(member.lastLoginAt), "yyyy. MM. dd. HH:mm", { locale: hu })
                          : "Még nem jelentkezett be"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(member.createdAt), "yyyy. MM. dd.", { locale: hu })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(member)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <StaffForm
        staff={selectedStaff}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={loadStaff}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törölni szeretné?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem vonható vissza. A munkatárs véglegesen törlésre kerül.
              {staffToDelete && (
                <div className="mt-2 font-medium">
                  Törlendő: {staffToDelete.name} ({staffToDelete.email})
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
