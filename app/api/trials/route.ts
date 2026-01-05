import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

// Fuzzy match sponsor name to company name
function matchCompany(sponsorName: string, companies: any[]) {
  if (!sponsorName) return null;
  
  const normalizedSponsor = sponsorName.toLowerCase()
    .replace(/\s+inc\.?$/i, '')
    .replace(/\s+ltd\.?$/i, '')
    .replace(/\s+llc\.?$/i, '')
    .replace(/\s+corp\.?$/i, '')
    .replace(/\s+corporation$/i, '')
    .replace(/\s+company$/i, '')
    .replace(/\s+co\.?$/i, '')
    .replace(/\s+pharmaceuticals?$/i, '')
    .replace(/\s+\&\s+co\.?$/i, '')
    .trim();

  // Exact match first
  let match = companies.find(c => 
    c.name.toLowerCase() === normalizedSponsor ||
    c.name.toLowerCase().includes(normalizedSponsor) ||
    normalizedSponsor.includes(c.name.toLowerCase())
  );

  return match || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";
    const condition = searchParams.get("condition") || "";
    const companySlug = searchParams.get("company") || "";

    // Fetch all companies for matching
    let companies: any[] = [];
    try {
      companies = await prisma.company.findMany({
        select: { id: true, name: true, slug: true }
      });
    } catch (dbError) {
      console.warn("Database not available, continuing without company matching");
    }

    const apiUrl = process.env.CLINICALTRIALS_API_URL || "https://clinicaltrials.gov/api/v2";
    let query = `${apiUrl}/studies?format=json&pageSize=${limit}`;
    
    if (condition) {
      query += `&query.cond=${encodeURIComponent(condition)}`;
    }

    // If filtering by company, add sponsor filter
    if (companySlug && companies.length > 0) {
      const company = companies.find(c => c.slug === companySlug);
      if (company) {
        query += `&query.lead=${encodeURIComponent(company.name)}`;
      }
    }

    console.log("Fetching from ClinicalTrials.gov:", query);

    const response = await fetch(query, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ClinicalTrials.gov API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to our format with company matching
    const trials = data.studies?.map((study: any) => {
      const protocolSection = study.protocolSection || {};
      const identificationModule = protocolSection.identificationModule || {};
      const statusModule = protocolSection.statusModule || {};
      const designModule = protocolSection.designModule || {};
      const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};
      const conditionsModule = protocolSection.conditionsModule || {};

      const sponsorName = sponsorCollaboratorsModule.leadSponsor?.name || "Unknown";
      const matchedCompany = companies.length > 0 ? matchCompany(sponsorName, companies) : null;

      return {
        nctId: identificationModule.nctId || "",
        title: identificationModule.officialTitle || identificationModule.briefTitle || "",
        status: statusModule.overallStatus || "Unknown",
        phase: designModule.phases?.[0] || "N/A",
        sponsor: sponsorName,
        companyId: matchedCompany?.id || null,
        companyName: matchedCompany?.name || null,
        companySlug: matchedCompany?.slug || null,
        conditions: conditionsModule.conditions || [],
        startDate: statusModule.startDateStruct?.date || null,
        enrollmentCount: designModule.enrollmentInfo?.count || null,
        studyType: designModule.studyType || "Unknown",
      };
    }) || [];

    return NextResponse.json({
      success: true,
      count: trials.length,
      trials,
      source: "ClinicalTrials.gov API v2",
      matchedCompanies: trials.filter((t: any) => t.companyId).length,
    });
  } catch (error: any) {
    console.error("Error fetching trials:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        trials: [],
      },
      { status: 500 }
    );
  }
}

