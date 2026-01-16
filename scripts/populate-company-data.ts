import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Populate Company Data
 * Fetches trials from ClinicalTrials.gov and links them to companies in the database
 */

async function fetchTrialsForCompany(companyName: string, limit: number = 20) {
  const apiUrl = "https://clinicaltrials.gov/api/v2";
  const query = `${apiUrl}/studies?format=json&pageSize=${limit}&query.lead=${encodeURIComponent(companyName)}`;
  
  try {
    console.log(`   Fetching trials for ${companyName}...`);
    const response = await fetch(query);
    
    if (!response.ok) {
      console.warn(`   ⚠️  API error for ${companyName}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    const trials = data.studies?.map((study: any) => {
      const protocolSection = study.protocolSection || {};
      const identificationModule = protocolSection.identificationModule || {};
      const statusModule = protocolSection.statusModule || {};
      const designModule = protocolSection.designModule || {};
      const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};
      const conditionsModule = protocolSection.conditionsModule || {};
      const descriptionsModule = protocolSection.descriptionModule || {};

      return {
        nctId: identificationModule.nctId || "",
        title: identificationModule.officialTitle || identificationModule.briefTitle || "",
        sponsorName: sponsorCollaboratorsModule.leadSponsor?.name || companyName,
        phase: designModule.phases?.[0] || "N/A",
        status: statusModule.overallStatus || "Unknown",
        conditions: conditionsModule.conditions || [],
        interventions: [], // TODO: Parse from study
        startDate: statusModule.startDateStruct?.date ? new Date(statusModule.startDateStruct.date) : null,
        completionDate: statusModule.completionDateStruct?.date ? new Date(statusModule.completionDateStruct.date) : null,
        enrollmentCount: designModule.enrollmentInfo?.count || null,
        studyType: designModule.studyType || "Unknown",
        locations: [], // TODO: Parse from locations module
        briefSummary: descriptionsModule.briefSummary || null,
        url: `https://clinicaltrials.gov/study/${identificationModule.nctId}`,
      };
    }) || [];

    console.log(`   ✅ Found ${trials.length} trials for ${companyName}`);
    return trials;
  } catch (error) {
    console.error(`   ❌ Error fetching trials for ${companyName}:`, error);
    return [];
  }
}

async function main() {
  console.log('🚀 Starting company data population...\n');
  
  // Get all companies from database
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  console.log(`📊 Found ${companies.length} companies to process\n`);

  let totalTrialsCreated = 0;
  let totalTrialsSkipped = 0;

  for (const company of companies) {
    console.log(`\n🏢 Processing: ${company.name}`);
    
    // Fetch trials from ClinicalTrials.gov
    const trials = await fetchTrialsForCompany(company.name, 50); // Fetch up to 50 trials per company
    
    if (trials.length === 0) {
      console.log(`   ⚠️  No trials found for ${company.name}`);
      continue;
    }

    // Insert trials into database
    for (const trial of trials) {
      try {
        // Check if trial already exists
        const existing = await prisma.clinicalTrial.findUnique({
          where: { nctId: trial.nctId },
        });

        if (existing) {
          totalTrialsSkipped++;
          continue;
        }

        // Create new trial linked to company
        await prisma.clinicalTrial.create({
          data: {
            ...trial,
            companyId: company.id,
          },
        });
        
        totalTrialsCreated++;
      } catch (error) {
        console.error(`   ❌ Error creating trial ${trial.nctId}:`, error);
      }
    }

    console.log(`   ✅ Created ${trials.length - totalTrialsSkipped} trials for ${company.name}`);
    
    // Rate limiting: wait 1 second between companies to avoid hitting API limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n📊 SUMMARY:');
  console.log(`   ✅ Total trials created: ${totalTrialsCreated}`);
  console.log(`   ⚠️  Total trials skipped (duplicates): ${totalTrialsSkipped}`);
  console.log(`   🏢 Companies processed: ${companies.length}`);
  
  // Show updated counts
  const companiesWithCounts = await prisma.company.findMany({
    include: {
      _count: {
        select: {
          trials: true,
          newsItems: true,
        },
      },
    },
    orderBy: {
      trials: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  console.log('\n\n🏆 TOP 10 COMPANIES BY TRIAL COUNT:');
  companiesWithCounts.forEach((company, index) => {
    console.log(`   ${index + 1}. ${company.name}: ${company._count.trials} trials, ${company._count.newsItems} news`);
  });

  console.log('\n✅ Data population complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error populating data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
