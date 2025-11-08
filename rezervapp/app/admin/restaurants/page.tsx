"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RestaurantForm } from "@/components/admin/restaurant-form"
import { Plus, Edit, Trash2, Building2, Users, Calendar, Utensils } from "lucide-react"
import { toast } from "sonner"
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

interface Restaurant {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  createdAt: string
  _count: {
    tables: number
    bookings: number
    staff: number
  }
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null)

  const fetchRestaurants = async () => {
    try {
      const response = await fetch("/api/admin/restaurants")
      if (!response.ok) throw new Error("Failed to fetch restaurants")
      const data = await response.json()
      setRestaurants(data)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
      toast.error("Nem sikerült betölteni az éttermeket")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const handleAdd = () => {
    setSelectedRestaurant(null)
    setFormOpen(true)
  }

  const handleEdit = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setFormOpen(true)
  }

  const handleDeleteClick = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!restaurantToDelete) return

    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete restaurant")

      toast.success("Étterem sikeresen törölve!")
      fetchRestaurants()
    } catch (error) {
      console.error("Error deleting restaurant:", error)
      toast.error("Hiba történt a törlés során")
    } finally {
      setDeleteDialogOpen(false)
      setRestaurantToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Betöltés...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Éttermek</h1>
          <p className="text-muted-foreground">
            Kezeld az összes éttermet egy helyről
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Új étterem
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Összes étterem
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Összes foglalás
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurants.reduce((sum, r) => sum + r._count.bookings, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Összes asztal
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurants.reduce((sum, r) => sum + r._count.tables, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Étterem lista</CardTitle>
          <CardDescription>
            Az összes regisztrált étterem áttekintése
          </CardDescription>
        </CardHeader>
        <CardContent>
          {restaurants.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nincs étterem</h3>
              <p className="mt-1 text-sm text-gray-500">
                Kezdj el egy új étterem hozzáadásával
              </p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Új étterem
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Név</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Város</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead className="text-center">Asztalok</TableHead>
                    <TableHead className="text-center">Foglalások</TableHead>
                    <TableHead className="text-center">Munkatársak</TableHead>
                    <TableHead className="text-right">Műveletek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell className="font-medium">
                        {restaurant.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{restaurant.slug}</Badge>
                      </TableCell>
                      <TableCell>{restaurant.city}</TableCell>
                      <TableCell>{restaurant.email}</TableCell>
                      <TableCell>{restaurant.phone}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{restaurant._count.tables}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{restaurant._count.bookings}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{restaurant._count.staff}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(restaurant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(restaurant)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Restaurant Form Dialog */}
      <RestaurantForm
        restaurant={selectedRestaurant}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchRestaurants}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törlöd?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem vonható vissza. Ez véglegesen törölni fogja{" "}
              <strong>{restaurantToDelete?.name}</strong> éttermet és az összes
              kapcsolódó adatot (asztalok, foglalások, munkatársak).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
