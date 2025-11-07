"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Utensils,
  Settings,
  LogOut,
  BarChart3,
  Clock,
  Menu,
  X,
} from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Foglalások",
    icon: Calendar,
    href: "/admin/bookings",
    color: "text-violet-500",
  },
  {
    label: "Asztalok",
    icon: Utensils,
    href: "/admin/tables",
    color: "text-pink-700",
  },
  {
    label: "Vendégek",
    icon: Users,
    href: "/admin/guests",
    color: "text-orange-700",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "text-emerald-500",
  },
  {
    label: "Várólista",
    icon: Clock,
    href: "/admin/waitlist",
    color: "text-amber-600",
  },
  {
    label: "Beállítások",
    icon: Settings,
    href: "/admin/settings",
    color: "text-gray-700",
  },
]

export function CollapsibleSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:sticky top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-40",
          // Mobile
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop
          isExpanded ? "lg:w-72" : "lg:w-20"
        )}
      >
        <div className="space-y-4 py-4 flex flex-col h-full">
          {/* Header */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between pl-3 mb-8">
              {isExpanded ? (
                <>
                  <Link href="/admin/dashboard" className="flex items-center">
                    <h1 className="text-2xl font-bold whitespace-nowrap">
                      Rezerv<span className="text-blue-500">App</span>
                    </h1>
                  </Link>
                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition"
                    aria-label="Collapse sidebar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleSidebar}
                  className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition mx-auto"
                  aria-label="Expand sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-2 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={closeMobileSidebar}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                    pathname === route.href
                      ? "text-white bg-white/10"
                      : "text-zinc-400",
                    !isExpanded && "lg:justify-center"
                  )}
                  title={!isExpanded ? route.label : undefined}
                >
                  <div className={cn(
                    "flex items-center",
                    isExpanded ? "flex-1" : "lg:flex-none"
                  )}>
                    <route.icon className={cn("h-5 w-5", route.color, isExpanded && "mr-3")} />
                    <span className={cn(
                      "whitespace-nowrap",
                      !isExpanded && "lg:hidden"
                    )}>
                      {route.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="px-3 py-2">
            <button
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400",
                !isExpanded && "lg:justify-center"
              )}
              onClick={() => signOut({ callbackUrl: "/login" })}
              title={!isExpanded ? "Kijelentkezés" : undefined}
            >
              <div className={cn(
                "flex items-center",
                isExpanded ? "flex-1" : "lg:flex-none"
              )}>
                <LogOut className={cn("h-5 w-5", isExpanded && "mr-3")} />
                <span className={cn(
                  "whitespace-nowrap",
                  !isExpanded && "lg:hidden"
                )}>
                  Kijelentkezés
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
