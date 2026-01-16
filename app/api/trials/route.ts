import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";
    const condition = searchParams.get("condition") || "";
    const useDatabase = searchParams.get("useDatabase") === "true";

    // Option 1: Fetch from database (faster, cached, reliable)
    if (useDatabase || !condition) {
      console.log("Fetching trials from database...");
      
      const where: any = {};
      if (condition) {
        where.conditions = {
          has: condition,
        };
      }

      const dbTrials = await prisma.clinicalTrial.findMany({
        where,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      const trials = dbTrials.map((trial) => ({
        nctId: trial.nctId,
        title: trial.title,
        status: trial.status,
        phase: trial.phase || "N/A",
        sponsor: trial.company?.name || trial.sponsorName || "Unknown",
        conditions: trial.conditions,
        startDate: trial.startDate?.toISOString() || null,
        enrollmentCount: trial.enrollmentCount,
        studyType: trial.studyType || "Unknown",
      }));

      const response = NextResponse.json({
        success: true,
        count: trials.length,
        trials,
        source: "Database (Cached)",
      });

      // Cache for 1 hour
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
      
      return response;
    }

    // Option 2: Fetch from ClinicalTrials.gov API (real-time, may fail)
    const apiUrl = process.env.CLINICALTRIALS_API_URL || "https://clinicaltrials.gov/api/v2";
    let query = `${apiUrl}/studies?format=json&pageSize=${limit}`;
    
    if (condition) {
      query += `&query.cond=${encodeURIComponent(condition)}`;
    }

    console.log("Fetching from ClinicalTrials.gov:", query);

    const response = await fetch(query, {
      headers: {
        "Accept": "application/json",
      },
      // Add timeout protection
      signal: AbortSignal.timeout(8000), // 8 second timeout
    });

    if (!response.ok) {
      throw new Error(`ClinicalTrials.gov API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to our format
    const trials = data.studies?.map((study: any) => {
      const protocolSection = study.protocolSection || {};
      const identificationModule = protocolSection.identificationModule || {};
      const statusModule = protocolSection.statusModule || {};
      const designModule = protocolSection.designModule || {};
      const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};
      const conditionsModule = protocolSection.conditionsModule || {};

      return {
        nctId: identificationModule.nctId || "",
        title: identificationModule.officialTitle || identificationModule.briefTitle || "",
        status: statusModule.overallStatus || "Unknown",
        phase: designModule.phases?.[0] || "N/A",
        sponsor: sponsorCollaboratorsModule.leadSponsor?.name || "Unknown",
        conditions: conditionsModule.conditions || [],
        startDate: statusModule.startDateStruct?.date || null,
        enrollmentCount: designModule.enrollmentInfo?.count || null,
        studyType: designModule.studyType || "Unknown",
      };
    }) || [];

    const apiResponse = NextResponse.json({
      success: true,
      count: trials.length,
      trials,
      source: "ClinicalTrials.gov API v2 (Live)",
    });

    // Cache API results for 30 minutes
    apiResponse.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');

    return apiResponse;
  } catch (error: any) {
    console.error("Error fetching trials from API:", error);
    
    // FALLBACK: Try database if API fails
    console.log("API failed, falling back to database...");
    
    try {
      const where: any = {};
      if (condition) {
        where.conditions = {
          has: condition,
        };
      }

      const dbTrials = await prisma.clinicalTrial.findMany({
        where,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      const trials = dbTrials.map((trial) => ({
        nctId: trial.nctId,
        title: trial.title,
        status: trial.status,
        phase: trial.phase || "N/A",
        sponsor: trial.company?.name || trial.sponsorName || "Unknown",
        conditions: trial.conditions,
        startDate: trial.startDate?.toISOString() || null,
        enrollmentCount: trial.enrollmentCount,
        studyType: trial.studyType || "Unknown",
      }));

      const fallbackResponse = NextResponse.json({
        success: true,
        count: trials.length,
        trials,
        source: "Database (API Fallback)",
        warning: "ClinicalTrials.gov API unavailable, showing cached data",
      });

      fallbackResponse.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');

      return fallbackResponse;
    } catch (dbError) {
      console.error("Database fallback also failed:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Both API and database unavailable",
          details: error.message,
          trials: [],
        },
        { status: 500 }
      );
    }
  }
}

