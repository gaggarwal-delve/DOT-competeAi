// Seed universal indications with full metadata
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UniversalIndication {
  indication_name: string;
  therapeutic_area: string;
  has_market_insight: 'Y' | 'N';
  has_drug_insight: 'Y' | 'N';
  has_epidem_insight: 'Y' | 'N';
  most_recent_year: number | string;
  year_range: string;
  total_reports: number;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('📊 Seeding Universal Indications...\n');
  
  // Read universal indications
  const jsonPath = path.join(__dirname, 'universal-indications.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const indications: UniversalIndication[] = JSON.parse(jsonData);
  
  console.log(`Found ${indications.length} indications\n`);
  
  // Clear existing
  console.log('🗑️  Clearing existing indications...');
  await prisma.indicationTrial.deleteMany();
  await prisma.indicationCompany.deleteMany();
  await prisma.indication.deleteMany();
  console.log('✅ Cleared\n');
  
  // Seed in batches
  const batchSize = 500;
  let seededCount = 0;
  
  console.log('💾 Seeding indications...');
  
  for (let i = 0; i < indications.length; i += batchSize) {
    const batch = indications.slice(i, i + batchSize);
    
    await prisma.indication.createMany({
      data: batch.map((ind) => ({
        name: ind.indication_name,
        slug: createSlug(ind.indication_name),
        category: ind.therapeutic_area || 'Other',
        hasMarketInsight: ind.has_market_insight === 'Y',
        hasDrugInsight: ind.has_drug_insight === 'Y',
        hasEpidemInsight: ind.has_epidem_insight === 'Y',
        mostRecentYear: ind.most_recent_year ? parseInt(ind.most_recent_year.toString()) : null,
        yearRange: ind.year_range || null,
        totalReports: ind.total_reports || 0,
        totalTrials: 0,
        activeTrials: 0,
        companiesCount: 0,
      })),
      skipDuplicates: true,
    });
    
    seededCount += batch.length;
    console.log(`  ✅ ${seededCount}/${indications.length}`);
  }
  
  console.log('\n✅ Seeding complete!\n');
  
  // Stats
  const total = await prisma.indication.count();
  console.log(`📊 STATISTICS:`);
  console.log(`  Total: ${total}\n`);
  
  // By category
  const categories = await prisma.indication.groupBy({
    by: ['category'],
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
    take: 10,
  });
  
  console.log('🏥 Top 10 Categories:');
  categories.forEach((cat) => {
    console.log(`  ${cat.category}: ${cat._count.category}`);
  });
  
  // By insight coverage
  const withMarket = await prisma.indication.count({ where: { hasMarketInsight: true } });
  const withDrug = await prisma.indication.count({ where: { hasDrugInsight: true } });
  const withEpidem = await prisma.indication.count({ where: { hasEpidemInsight: true } });
  const withAll = await prisma.indication.count({
    where: {
      hasMarketInsight: true,
      hasDrugInsight: true,
      hasEpidemInsight: true,
    },
  });
  
  console.log('\n📚 Insight Coverage:');
  console.log(`  Market: ${withMarket} (${(withMarket/total*100).toFixed(1)}%)`);
  console.log(`  Drug: ${withDrug} (${(withDrug/total*100).toFixed(1)}%)`);
  console.log(`  Epidem: ${withEpidem} (${(withEpidem/total*100).toFixed(1)}%)`);
  console.log(`  All 3: ${withAll} (${(withAll/total*100).toFixed(1)}%)`);
  
  console.log('\n✅ DONE!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

