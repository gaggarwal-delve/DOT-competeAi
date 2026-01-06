import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    // Fetch indications and get trial counts from ClinicalTrials.gov
    const indications = await prisma.indication.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        therapeuticArea: true,
        mostRecentYear: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 500, // Get more to sample from
    });

    // For performance, we'll estimate activity based on a sample
    // In production, you'd cache these results
    const indicationsWithActivity = [];

    for (const indication of indications.slice(0, 100)) {
      try {
        const trialsResponse = await fetch(
          `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(indication.name)}&countTotal=true&pageSize=1`,
          { next: { revalidate: 3600 } } // Cache for 1 hour
        );
        
        if (trialsResponse.ok) {
          const trialsData = await trialsResponse.json();
          const totalCount = trialsData.totalCount || 0;
          
          if (totalCount > 0) {
            indicationsWithActivity.push({
              ...indication,
              trialCount: totalCount,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching trials for ${indication.name}:`, error);
      }
    }

    // Sort by trial count descending
    indicationsWithActivity.sort((a, b) => b.trialCount - a.trialCount);

    return NextResponse.json({
      success: true,
      indications: indicationsWithActivity.slice(0, limit),
    });
  } catch (error: any) {
    console.error("Error fetching top indications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch top indications",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

