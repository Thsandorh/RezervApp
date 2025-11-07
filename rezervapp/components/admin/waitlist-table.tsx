"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { Phone, Users, Clock, Check, X } from "lucide-react"

interface WaitlistEntry {
  id: string
  guestName: string
  guestPhone: string
  partySize: number
  status: string
  createdAt: string
  notifiedAt?: string | null
  seatedAt?: string | null
}

interface WaitlistTableProps {
  entries: WaitlistEntry[]
  showHistory?: boolean
}

export function WaitlistTable({ entries, showHistory = false }: WaitlistTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleNotify = async (entryId: string) => {
    setLoadingId(entryId)

    try {
      const response = await fetch(`/api/waitlist/${entryId}/notify`, {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt")
      }

      toast({
        title: "Értesítés elküldve",
        description: "Vendég értesítve lett SMS-ben és emailben",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült értesíteni a vendéget",
        variant: "destructive",
      })
    } finally {
      setLoadingId(null)
    }
  }

  const handleMarkSeated = async (entryId: string) => {
    setLoadingId(entryId)

    try {
      const response = await fetch(`/api/waitlist/${entryId}/seat`, {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt")
      }

      toast({
        title: "Leültetve",
        description: "Vendég eltávolítva a várólistáról",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült leültetni a vendéget",
        variant: "destructive",
      })
    } finally {
      setLoadingId(null)
    }
  }

  const handleCancel = async (entryId: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a várólistás bejegyzést?")) {
      return
    }

    setLoadingId(entryId)

    try {
      const response = await fetch(`/api/waitlist/${entryId}/cancel`, {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Hiba történt")
      }

      toast({
        title: "Törölve",
        description: "Várólistás bejegyzés törölve",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message || "Nem sikerült törölni",
        variant: "destructive",
      })
    } finally {
      setLoadingId(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {showHistory ? "Nincs előzmény" : "Nincs aktív várólistás foglalás"}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Vendég</th>
            <th className="text-left p-2">Telefon</th>
            <th className="text-left p-2">Létszám</th>
            <th className="text-left p-2">Várólista kezdete</th>
            <th className="text-left p-2">Státusz</th>
            {!showHistory && <th className="text-left p-2">Műveletek</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b hover:bg-gray-50">
              <td className="p-2 font-semibold">{entry.guestName}</td>
              <td className="p-2 text-sm text-gray-600">
                <Phone className="inline h-3 w-3 mr-1" />
                {entry.guestPhone}
              </td>
              <td className="p-2">
                <Users className="inline h-3 w-3 mr-1" />
                {entry.partySize} fő
              </td>
              <td className="p-2 text-sm">
                <Clock className="inline h-3 w-3 mr-1" />
                {format(new Date(entry.createdAt), "yyyy. MM. dd. HH:mm", { locale: hu })}
              </td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    entry.status === "WAITING"
                      ? "bg-yellow-100 text-yellow-800"
                      : entry.status === "NOTIFIED"
                      ? "bg-blue-100 text-blue-800"
                      : entry.status === "SEATED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {entry.status === "WAITING"
                    ? "Várakozik"
                    : entry.status === "NOTIFIED"
                    ? "Értesítve"
                    : entry.status === "SEATED"
                    ? "Leültetve"
                    : "Lemondva"}
                </span>
              </td>
              {!showHistory && (
                <td className="p-2">
                  <div className="flex gap-2">
                    {entry.status === "WAITING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNotify(entry.id)}
                        disabled={loadingId === entry.id}
                      >
                        Értesítés
                      </Button>
                    )}
                    {entry.status === "NOTIFIED" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleMarkSeated(entry.id)}
                        disabled={loadingId === entry.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Leültetés
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(entry.id)}
                      disabled={loadingId === entry.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
