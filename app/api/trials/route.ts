import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";
    const condition = searchParams.get("condition") || "";

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

    return NextResponse.json({
      success: true,
      count: trials.length,
      trials,
      source: "ClinicalTrials.gov API v2",
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

