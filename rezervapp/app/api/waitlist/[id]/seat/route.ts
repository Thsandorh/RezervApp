import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const entry = await prisma.waitlist.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 }
      )
    }

    // Mark as seated
    const updated = await prisma.waitlist.update({
      where: { id },
      data: {
        status: "SEATED",
        seatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      entry: updated,
    })
  } catch (error) {
    console.error("Waitlist seat error:", error)
    return NextResponse.json(
      { error: "Failed to mark as seated" },
      { status: 500 }
    )
  }
}
