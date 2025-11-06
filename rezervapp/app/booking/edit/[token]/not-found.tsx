import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function BookingNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Foglalás nem található</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              A keresett foglalás nem található, vagy már le van zárva.
            </p>
            <p className="text-sm text-gray-500">
              Lehetséges okok:
            </p>
            <ul className="text-sm text-gray-500 text-left space-y-1">
              <li>• A foglalás már le lett mondva</li>
              <li>• A foglalás már lezárult</li>
              <li>• A link lejárt vagy érvénytelen</li>
            </ul>

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
