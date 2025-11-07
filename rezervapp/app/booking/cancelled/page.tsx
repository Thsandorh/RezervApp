import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function BookingCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Foglalás lemondva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              A foglalásod sikeresen lemondtuk.
            </p>
            <p className="text-gray-600">
              Email megerősítést küldtünk a megadott címre.
            </p>
            <p className="text-sm text-gray-500 mt-6">
              Reméljük hamarosan újra látunk! 🙏
            </p>

            <div className="pt-6">
              <Link href="/">
                <Button className="w-full">
                  Vissza a főoldalra
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
