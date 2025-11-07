import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createTableSchema = z.object({
  name: z.string().min(1, "Az asztal neve kötelező"),
  capacity: z.number().min(1, "A kapacitás minimum 1 fő").max(20, "A kapacitás maximum 20 fő"),
  location: z.string().min(1, "Az elhelyezkedés kötelező"),
  isActive: z.boolean().default(true),
})

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nincs bejelentkezve" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validatedData = createTableSchema.parse(body)

    // Get restaurant
    const restaurant = await prisma.restaurant.findFirst()
    if (!restaurant) {
      return NextResponse.json(
        { error: "Nincs étterem beállítva" },
        { status: 404 }
      )
    }

    // Check if table name already exists
    const existingTable = await prisma.table.findFirst({
      where: {
        restaurantId: restaurant.id,
        name: validatedData.name,
      },
    })

    if (existingTable) {
      return NextResponse.json(
        { error: "Már létezik ilyen nevű asztal" },
        { status: 400 }
      )
    }

    // Create table
    const table = await prisma.table.create({
      data: {
        name: validatedData.name,
        capacity: validatedData.capacity,
        location: validatedData.location,
        isActive: validatedData.isActive,
        restaurantId: restaurant.id,
      },
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error("Error creating table:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Hibás adatok", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hiba történt az asztal létrehozásakor" },
      { status: 500 }
    )
  }
}
