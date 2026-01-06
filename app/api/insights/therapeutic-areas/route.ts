import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get therapeutic areas with indication counts
    const therapeuticAreas = await prisma.indication.groupBy({
      by: ['therapeuticArea'],
      where: {
        therapeuticArea: {
          not: null,
        },
      },
      _count: {
        therapeuticArea: true,
      },
      orderBy: {
        _count: {
          therapeuticArea: 'desc',
        },
      },
    });

    // Get additional stats for each TA
    const enrichedTAs = await Promise.all(
      therapeuticAreas.map(async (ta) => {
        const stats = await prisma.indication.aggregate({
          where: {
            therapeuticArea: ta.therapeuticArea,
          },
          _sum: {
            totalReports: true,
          },
          _max: {
            mostRecentYear: true,
          },
        });

        return {
          name: ta.therapeuticArea,
          indicationCount: ta._count.therapeuticArea,
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

