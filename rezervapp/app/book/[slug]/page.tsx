import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { BookingPageClient } from "@/components/booking/booking-page-client"

async function getRestaurant(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      tables: {
        where: { isActive: true },
      },
    },
  })

  return restaurant
}

function getOpeningHoursDisplay(openingHoursStr: string) {
  try {
    const hours = JSON.parse(openingHoursStr)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap']

    return days.map((day, index) => {
      const dayHours = hours[day]
      if (dayHours?.closed) {
        return `${dayNames[index]}: Zárva`
      }
      return `${dayNames[index]}: ${dayHours?.open || '--'} - ${dayHours?.close || '--'}`
    })
  } catch {
    return []
  }
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const openingHours = getOpeningHoursDisplay(restaurant.openingHours)

  return <BookingPageClient restaurant={restaurant} openingHours={openingHours} />
}
