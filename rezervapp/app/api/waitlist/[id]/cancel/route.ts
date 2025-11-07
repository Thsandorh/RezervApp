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

    // Mark as cancelled
    const updated = await prisma.waitlist.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    })

    return NextResponse.json({
      success: true,
      entry: updated,
    })
  } catch (error) {
    console.error("Waitlist cancel error:", error)
    return NextResponse.json(
      { error: "Failed to cancel waitlist entry" },
      { status: 500 }
    )
  }
}
