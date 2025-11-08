import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StaffList } from "@/components/admin/staff-list"

export default async function StaffPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Only OWNER can manage staff
  if (session.user.role !== "OWNER") {
    redirect("/admin/dashboard")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Munkatársak</h1>
        <p className="text-muted-foreground mt-1">
          Munkatársak kezelése és jogosultságok beállítása
        </p>
      </div>

      <StaffList />
    </div>
  )
}
