import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WaitlistTable } from "@/components/admin/waitlist-table"

async function getWaitlist() {
  return await prisma.waitlist.findMany({
    where: {
      status: {
        in: ['WAITING', 'NOTIFIED'],
      },
    },
    orderBy: {
      createdAt: 'asc', // First come, first served
    },
  })
}

async function getWaitlistHistory() {
  return await prisma.waitlist.findMany({
    where: {
      status: {
        in: ['SEATED', 'CANCELLED'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Last 50 completed/cancelled
  })
}

export const dynamic = 'force-dynamic'

export default async function WaitlistPage() {
  const activeWaitlist = await getWaitlist()
  const history = await getWaitlistHistory()

  // Serialize dates
  const serializedActive = activeWaitlist.map(entry => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    notifiedAt: entry.notifiedAt?.toISOString() || null,
    seatedAt: entry.seatedAt?.toISOString() || null,
  }))

  const serializedHistory = history.map(entry => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    notifiedAt: entry.notifiedAt?.toISOString() || null,
    seatedAt: entry.seatedAt?.toISOString() || null,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Várólistás foglalások</h1>
        <p className="text-muted-foreground">
          Vendégek, akik várólistára kerültek foglalás hiányában
        </p>
      </div>

      {/* Active Waitlist */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Aktív várólista ({activeWaitlist.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WaitlistTable entries={serializedActive as any} />
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>
            Előzmények ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WaitlistTable entries={serializedHistory as any} showHistory />
        </CardContent>
      </Card>
    </div>
  )
}
