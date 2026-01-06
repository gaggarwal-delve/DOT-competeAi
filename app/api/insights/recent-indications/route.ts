import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Get indications with most recent publications
    const indications = await prisma.indication.findMany({
      where: {
        mostRecentYear: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        therapeuticArea: true,
        mostRecentYear: true,
        yearRange: true,
        totalReports: true,
        hasMarketInsight: true,
        hasDrugInsight: true,
        hasEpidemInsight: true,
      },
      orderBy: {
        mostRecentYear: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      indications,
    });
  } catch (error: any) {
    console.error("Error fetching recent indications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recent indications",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

