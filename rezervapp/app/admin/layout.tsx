import { CollapsibleSidebar } from "@/components/admin/collapsible-sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
