"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DangerousActions() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteBookingsDialogOpen, setDeleteBookingsDialogOpen] = useState(false)
  const [deleteTablesDialogOpen, setDeleteTablesDialogOpen] = useState(false)

  const handleDeleteAllBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/delete-all-bookings", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Hiba történt a törlés során")
      }

      const data = await response.json()
      toast.success(`Sikeresen törölve: ${data.deletedCount} foglalás`)
      setDeleteBookingsDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Hiba történt")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllTables = async () {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/delete-all-tables", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Hiba történt a törlés során")
      }

      const data = await response.json()
      toast.success(`Sikeresen törölve: ${data.deletedCount} asztal`)
      setDeleteTablesDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Hiba történt")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Delete All Bookings */}
      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
        <div>
          <h4 className="font-semibold text-red-900 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Összes foglalás törlése
          </h4>
          <p className="text-sm text-red-700 mt-1">
            Minden foglalás véglegesen törlődik. Ez a művelet nem vonható vissza!
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setDeleteBookingsDialogOpen(true)}
          className="ml-4"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Törlés
        </Button>
      </div>

      {/* Delete All Tables */}
      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
        <div>
          <h4 className="font-semibold text-red-900 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Összes asztal törlése
          </h4>
          <p className="text-sm text-red-700 mt-1">
            Minden asztal véglegesen törlődik. Ez a kapcsolódó foglalásokat is érinti!
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setDeleteTablesDialogOpen(true)}
          className="ml-4"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Törlés
        </Button>
      </div>

      {/* Delete Bookings Confirmation Dialog */}
      <AlertDialog
        open={deleteBookingsDialogOpen}
        onOpenChange={setDeleteBookingsDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törlöd az összes foglalást?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet <strong>véglegesen törli az összes foglalást</strong> az étteremből.
              Ez nem vonható vissza és minden vendég foglalása elvész!
              <br />
              <br />
              Folytatod?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllBookings}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? "Törlés folyamatban..." : "Igen, töröld mind"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tables Confirmation Dialog */}
      <AlertDialog
        open={deleteTablesDialogOpen}
        onOpenChange={setDeleteTablesDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törlöd az összes asztalt?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet <strong>véglegesen törli az összes asztalt</strong> az étteremből.
              Ez nem vonható vissza! Az asztalokhoz kapcsolódó foglalások is törlődhetnek.
              <br />
              <br />
              <strong className="text-red-600">FIGYELEM:</strong> Ez súlyos következményekkel járhat!
              <br />
              <br />
              Folytatod?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllTables}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? "Törlés folyamatban..." : "Igen, töröld mind"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
