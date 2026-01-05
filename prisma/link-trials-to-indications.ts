// Link clinical trials to indications based on condition matching
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fuzzy match score threshold (0-1, where 1 is perfect match)
const MATCH_THRESHOLD = 0.7;

/**
 * Calculate similarity between two strings (Levenshtein-based)
 */
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

/**
 * Find matching indication for a trial condition
 */
async function findMatchingIndication(
  condition: string,
  indications: Array<{ id: number; name: string; slug: string }>
): Promise<{ id: number; score: number } | null> {
  let bestMatch: { id: number; score: number } | null = null;
  
  for (const indication of indications) {
    const score = similarity(condition, indication.name);
    
    if (score >= MATCH_THRESHOLD) {
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { id: indication.id, score };
      }
    }
    
    // Also check if condition contains indication name or vice versa (partial match)
    const conditionLower = condition.toLowerCase();
    const indicationLower = indication.name.toLowerCase();
    
    if (conditionLower.includes(indicationLower) || indicationLower.includes(conditionLower)) {
      const partialScore = Math.max(indicationLower.length / conditionLower.length, conditionLower.length / indicationLower.length);
      if (partialScore >= MATCH_THRESHOLD) {
        if (!bestMatch || partialScore > bestMatch.score) {
          bestMatch = { id: indication.id, score: partialScore };
        }
      }
    }
  }
  
  return bestMatch;
}

async function main() {
  console.log('🔗 Starting trial-to-indication linking...\n');
  
  // Step 1: Load all indications into memory for faster matching
  console.log('📚 Loading indications...');
  const indications = await prisma.indication.findMany({
    select: { id: true, name: true, slug: true },
  });
  console.log(`✅ Loaded ${indications.length} indications\n`);
  
  // Step 2: Get all clinical trials
  console.log('📊 Loading clinical trials...');
  const trials = await prisma.clinicalTrial.findMany({
    select: {
      id: true,
      nctId: true,
      conditions: true,
      status: true,
      companyId: true,
    },
  });
  console.log(`✅ Loaded ${trials.length} trials\n`);
  
  // Step 3: Clear existing links (fresh start)
  console.log('🗑️  Clearing existing trial-indication links...');
  await prisma.indicationTrial.deleteMany();
  await prisma.indicationCompany.deleteMany();
  console.log('✅ Cleared\n');
  
  // Step 4: Match trials to indications
  console.log('🔍 Matching trials to indications...');
  let linkedCount = 0;
  let skippedCount = 0;
  const indicationLinks: Map<number, Set<string>> = new Map();
  const companyIndicationLinks: Map<string, Set<number>> = new Map(); // "companyId-indicationId" -> trials
  
  for (let i = 0; i < trials.length; i++) {
    const trial = trials[i];
    
    if (trial.conditions.length === 0) {
      skippedCount++;
      continue;
    }
    
    // Match each condition to an indication
    for (const condition of trial.conditions) {
      const match = await findMatchingIndication(condition, indications);
      
      if (match) {
        // Store the link (we'll batch insert later)
        if (!indicationLinks.has(match.id)) {
          indicationLinks.set(match.id, new Set());
        }
        indicationLinks.get(match.id)!.add(trial.nctId);
        
        // Track company-indication relationships
        if (trial.companyId) {
          const key = `${trial.companyId}-${match.id}`;
          if (!companyIndicationLinks.has(key)) {
            companyIndicationLinks.set(key, new Set());
          }
          companyIndicationLinks.get(key)!.add(trial.nctId);
        }
        
        linkedCount++;
        break; // Use first matching condition (primary indication)
      }
    }
    
    if ((i + 1) % 500 === 0) {
      console.log(`  Processed ${i + 1}/${trials.length} trials (${linkedCount} links, ${skippedCount} skipped)`);
    }
  }
  
  console.log(`\n✅ Matched ${linkedCount} trials to indications (${skippedCount} skipped)\n`);
  
  // Step 5: Batch insert indication-trial links
  console.log('💾 Saving indication-trial links...');
  let insertedLinks = 0;
  
  for (const [indicationId, trialNctIds] of indicationLinks.entries()) {
    const linksToInsert = Array.from(trialNctIds).map((nctId) => ({
      indicationId,
      trialNctId: nctId,
      isPrimary: true,
    }));
    
    await prisma.indicationTrial.createMany({
      data: linksToInsert,
      skipDuplicates: true,
    });
    
    insertedLinks += linksToInsert.length;
  }
  
  console.log(`✅ Inserted ${insertedLinks} trial links\n`);
  
  // Step 6: Update indication metrics
  console.log('📈 Updating indication metrics...');
  
  for (const [indicationId, trialNctIds] of indicationLinks.entries()) {
    const totalTrials = trialNctIds.size;
    
    // Count active trials
    const activeTrials = await prisma.clinicalTrial.count({
      where: {
        nctId: { in: Array.from(trialNctIds) },
        status: { in: ['Recruiting', 'Active, not recruiting', 'Enrolling by invitation'] },
      },
    });
    
    // Count unique companies
    const companies = await prisma.clinicalTrial.findMany({
      where: { nctId: { in: Array.from(trialNctIds) } },
      select: { companyId: true },
      distinct: ['companyId'],
    });
    const companiesCount = companies.filter((c) => c.companyId !== null).length;
    
    await prisma.indication.update({
      where: { id: indicationId },
      data: {
        totalTrials,
        activeTrials,
        companiesCount,
      },
    });
  }
  
  console.log(`✅ Updated metrics for ${indicationLinks.size} indications\n`);
  
  // Step 7: Create company-indication links
  console.log('🏢 Creating company-indication links...');
  let companyLinksCreated = 0;
  
  for (const [key, trialNctIds] of companyIndicationLinks.entries()) {
    const [companyIdStr, indicationIdStr] = key.split('-');
    const companyId = parseInt(companyIdStr);
    const indicationId = parseInt(indicationIdStr);
    
    // Get phase distribution for these trials
    const trials = await prisma.clinicalTrial.findMany({
      where: { nctId: { in: Array.from(trialNctIds) } },
      select: { phase: true },
    });
    
    const phases = Array.from(new Set(trials.map((t) => t.phase).filter(Boolean)));
    
    await prisma.indicationCompany.create({
      data: {
        indicationId,
        companyId,
        trialsCount: trialNctIds.size,
        phases: phases as string[],
        pipelineStrength: trialNctIds.size * 10, // Simple score for now
      },
    });
    
    companyLinksCreated++;
  }
  
  console.log(`✅ Created ${companyLinksCreated} company-indication links\n`);
  
  // Step 8: Summary stats
  console.log('📊 FINAL SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const indicationsWithTrials = await prisma.indication.findMany({
    where: { totalTrials: { gt: 0 } },
    orderBy: { totalTrials: 'desc' },
    take: 10,
  });
  
  console.log('\n🏆 Top 10 Indications by Trial Count:');
  indicationsWithTrials.forEach((ind, idx) => {
    console.log(`  ${idx + 1}. ${ind.name} (${ind.totalTrials} trials, ${ind.activeTrials} active)`);
  });
  
  console.log('\n✅ Linking complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

