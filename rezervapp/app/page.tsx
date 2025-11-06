import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Utensils } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            Rezerv<span className="text-blue-600">App</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern éttermi foglalási rendszer magyar éttermek számára
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/admin/dashboard">
            <Button size="lg" className="w-64 gap-2">
              <Utensils className="h-5 w-5" />
              Admin Dashboard
            </Button>
          </Link>
          <Link href="/book/pizzeria-romana">
            <Button size="lg" variant="outline" className="w-64 gap-2">
              <Calendar className="h-5 w-5" />
              Foglalás tesztelése
            </Button>
          </Link>
        </div>

        <div className="pt-12 text-sm text-muted-foreground">
          <p>Demo bejelentkezés:</p>
          <p className="font-mono">admin@pizzeriaromana.hu / password123</p>
        </div>
      </div>
    </div>
  )
}
