// Seed indications from indications.json
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface IndicationData {
  id: number;
  name: string;
  slug: string;
  category: string;
  report_types: string[];
}

async function main() {
  console.log('📊 Starting indication seeding...');
  
  // Read indications from JSON file
  const jsonPath = path.join(__dirname, 'indications.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const indications: IndicationData[] = JSON.parse(jsonData);
  
  console.log(`Found ${indications.length} indications to seed`);
  
  // Clear existing indications (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing indications...');
  await prisma.indicationTrial.deleteMany();
  await prisma.indicationCompany.deleteMany();
  await prisma.indication.deleteMany();
  
  console.log('✅ Cleared');
  
  // Seed indications in batches
  const batchSize = 500;
  let seededCount = 0;
  
  for (let i = 0; i < indications.length; i += batchSize) {
    const batch = indications.slice(i, i + batchSize);
    
    await prisma.indication.createMany({
      data: batch.map((ind) => ({
        name: ind.name,
        slug: ind.slug,
        category: ind.category || 'Other',
        reportTypes: ind.report_types || [],
        totalTrials: 0,
        activeTrials: 0,
        companiesCount: 0,
      })),
      skipDuplicates: true,
    });
    
    seededCount += batch.length;
    console.log(`✅ Seeded ${seededCount}/${indications.length} indications`);
  }
  
  console.log('✅ Indication seeding complete!');
  
  // Show stats
  const totalIndications = await prisma.indication.count();
  console.log(`📈 Total indications in database: ${totalIndications}`);
  
  // Group by category
  const categories = await prisma.indication.groupBy({
    by: ['category'],
    _count: {
      category: true,
    },
    orderBy: {
      _count: {
        category: 'desc',
      },
    },
    take: 10,
  });
  
  console.log('\n📊 Top 10 Categories:');
  categories.forEach((cat) => {
    console.log(`  ${cat.category}: ${cat._count.category}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding indications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

