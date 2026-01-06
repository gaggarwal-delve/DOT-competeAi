import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get therapeutic areas with indication counts
    const therapeuticAreas = await prisma.indication.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });

    // Get additional stats for each TA
    const enrichedTAs = await Promise.all(
      therapeuticAreas.map(async (ta) => {
        const stats = await prisma.indication.aggregate({
          where: {
            category: ta.category,
          },
          _sum: {
            totalReports: true,
          },
          _max: {
            mostRecentYear: true,
          },
        });

        return {
          name: ta.category,
          indicationCount: ta._count.category,
          totalReports: stats._sum.totalReports || 0,
          mostRecentYear: stats._max.mostRecentYear,
        };
      })
    );

    return NextResponse.json({
      success: true,
      therapeuticAreas: enrichedTAs,
    });
  } catch (error: any) {
    console.error("Error fetching therapeutic areas:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch therapeutic areas",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

