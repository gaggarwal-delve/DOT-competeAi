import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Top 50 Pharmaceutical & Biotech Companies
const companies = [
  // Top 10 Big Pharma
  { name: 'Pfizer', headquarters: 'New York, USA', website: 'https://www.pfizer.com', therapyAreas: ['Oncology', 'Immunology', 'Cardiology', 'Vaccines'], foundedYear: 1849 },
  { name: 'Roche', headquarters: 'Basel, Switzerland', website: 'https://www.roche.com', therapyAreas: ['Oncology', 'Immunology', 'Neurology'], foundedYear: 1896 },
  { name: 'Novartis', headquarters: 'Basel, Switzerland', website: 'https://www.novartis.com', therapyAreas: ['Oncology', 'Cardiology', 'Immunology', 'Neurology'], foundedYear: 1996 },
  { name: 'Johnson & Johnson', headquarters: 'New Brunswick, USA', website: 'https://www.jnj.com', therapyAreas: ['Oncology', 'Immunology', 'Infectious Diseases'], foundedYear: 1886 },
  { name: 'Merck & Co.', headquarters: 'Rahway, USA', website: 'https://www.merck.com', therapyAreas: ['Oncology', 'Vaccines', 'Diabetes'], foundedYear: 1891 },
  { name: 'AbbVie', headquarters: 'Chicago, USA', website: 'https://www.abbvie.com', therapyAreas: ['Immunology', 'Oncology', 'Neurology'], foundedYear: 2013 },
  { name: 'Sanofi', headquarters: 'Paris, France', website: 'https://www.sanofi.com', therapyAreas: ['Diabetes', 'Cardiovascular', 'Vaccines', 'Rare Diseases'], foundedYear: 2004 },
  { name: 'GlaxoSmithKline', headquarters: 'London, UK', website: 'https://www.gsk.com', therapyAreas: ['Vaccines', 'Respiratory', 'HIV', 'Oncology'], foundedYear: 2000 },
  { name: 'AstraZeneca', headquarters: 'Cambridge, UK', website: 'https://www.astrazeneca.com', therapyAreas: ['Oncology', 'Cardiovascular', 'Respiratory'], foundedYear: 1999 },
  { name: 'Bristol Myers Squibb', headquarters: 'New York, USA', website: 'https://www.bms.com', therapyAreas: ['Oncology', 'Immunology', 'Cardiovascular'], foundedYear: 1989 },

  // Top 20 Large Pharma
  { name: 'Eli Lilly', headquarters: 'Indianapolis, USA', website: 'https://www.lilly.com', therapyAreas: ['Diabetes', 'Oncology', 'Immunology'], foundedYear: 1876 },
  { name: 'Amgen', headquarters: 'Thousand Oaks, USA', website: 'https://www.amgen.com', therapyAreas: ['Oncology', 'Cardiovascular', 'Bone Health'], foundedYear: 1980 },
  { name: 'Gilead Sciences', headquarters: 'Foster City, USA', website: 'https://www.gilead.com', therapyAreas: ['HIV', 'Hepatitis', 'Oncology'], foundedYear: 1987 },
  { name: 'Takeda', headquarters: 'Tokyo, Japan', website: 'https://www.takeda.com', therapyAreas: ['Oncology', 'Gastroenterology', 'Rare Diseases'], foundedYear: 1781 },
  { name: 'Boehringer Ingelheim', headquarters: 'Ingelheim, Germany', website: 'https://www.boehringer-ingelheim.com', therapyAreas: ['Respiratory', 'Cardiovascular', 'Oncology'], foundedYear: 1885 },
  { name: 'Bayer', headquarters: 'Leverkusen, Germany', website: 'https://www.bayer.com', therapyAreas: ['Oncology', 'Cardiology', 'Women\'s Health'], foundedYear: 1863 },
  { name: 'Biogen', headquarters: 'Cambridge, USA', website: 'https://www.biogen.com', therapyAreas: ['Neurology', 'Multiple Sclerosis', 'Alzheimer\'s'], foundedYear: 1978 },
  { name: 'Regeneron', headquarters: 'Tarrytown, USA', website: 'https://www.regeneron.com', therapyAreas: ['Ophthalmology', 'Immunology', 'Oncology'], foundedYear: 1988 },
  { name: 'Vertex Pharmaceuticals', headquarters: 'Boston, USA', website: 'https://www.vrtx.com', therapyAreas: ['Cystic Fibrosis', 'Pain', 'Rare Diseases'], foundedYear: 1989 },
  { name: 'Moderna', headquarters: 'Cambridge, USA', website: 'https://www.modernatx.com', therapyAreas: ['Vaccines', 'Oncology', 'Rare Diseases'], foundedYear: 2010 },

  // Top 30 Mid-Large Pharma
  { name: 'CSL', headquarters: 'Melbourne, Australia', website: 'https://www.csl.com', therapyAreas: ['Immunology', 'Rare Diseases', 'Vaccines'], foundedYear: 1916 },
  { name: 'Astellas', headquarters: 'Tokyo, Japan', website: 'https://www.astellas.com', therapyAreas: ['Oncology', 'Urology', 'Immunology'], foundedYear: 2005 },
  { name: 'Daiichi Sankyo', headquarters: 'Tokyo, Japan', website: 'https://www.daiichisankyo.com', therapyAreas: ['Oncology', 'Cardiovascular'], foundedYear: 2005 },
  { name: 'Eisai', headquarters: 'Tokyo, Japan', website: 'https://www.eisai.com', therapyAreas: ['Neurology', 'Oncology'], foundedYear: 1941 },
  { name: 'UCB', headquarters: 'Brussels, Belgium', website: 'https://www.ucb.com', therapyAreas: ['Neurology', 'Immunology'], foundedYear: 1928 },
  { name: 'Alexion', headquarters: 'Boston, USA', website: 'https://www.alexion.com', therapyAreas: ['Rare Diseases', 'Immunology'], foundedYear: 1992 },
  { name: 'BioNTech', headquarters: 'Mainz, Germany', website: 'https://www.biontech.com', therapyAreas: ['Vaccines', 'Oncology', 'Immunology'], foundedYear: 2008 },
  { name: 'Incyte', headquarters: 'Wilmington, USA', website: 'https://www.incyte.com', therapyAreas: ['Oncology', 'Inflammation'], foundedYear: 1991 },
  { name: 'Seagen', headquarters: 'Bothell, USA', website: 'https://www.seagen.com', therapyAreas: ['Oncology'], foundedYear: 1998 },
  { name: 'Horizon Therapeutics', headquarters: 'Dublin, Ireland', website: 'https://www.horizontherapeutics.com', therapyAreas: ['Rare Diseases', 'Rheumatology'], foundedYear: 2005 },

  // Top 40 Emerging Pharma & Biotech
  { name: 'Alnylam', headquarters: 'Cambridge, USA', website: 'https://www.alnylam.com', therapyAreas: ['Rare Diseases', 'Cardiology'], foundedYear: 2002 },
  { name: 'BioMarin', headquarters: 'San Rafael, USA', website: 'https://www.biomarin.com', therapyAreas: ['Rare Diseases', 'Genetic Disorders'], foundedYear: 1997 },
  { name: 'Neurocrine Biosciences', headquarters: 'San Diego, USA', website: 'https://www.neurocrine.com', therapyAreas: ['Neurology', 'Endocrinology'], foundedYear: 1992 },
  { name: 'Sarepta Therapeutics', headquarters: 'Cambridge, USA', website: 'https://www.sarepta.com', therapyAreas: ['Rare Diseases', 'Genetic Disorders'], foundedYear: 1980 },
  { name: 'Ultragenyx', headquarters: 'Novato, USA', website: 'https://www.ultragenyx.com', therapyAreas: ['Rare Diseases', 'Genetic Disorders'], foundedYear: 2010 },
  { name: 'Bluebird Bio', headquarters: 'Cambridge, USA', website: 'https://www.bluebirdbio.com', therapyAreas: ['Gene Therapy', 'Rare Diseases'], foundedYear: 2010 },
  { name: 'Spark Therapeutics', headquarters: 'Philadelphia, USA', website: 'https://www.sparktx.com', therapyAreas: ['Gene Therapy', 'Ophthalmology'], foundedYear: 2013 },
  { name: 'Argenx', headquarters: 'Breda, Netherlands', website: 'https://www.argenx.com', therapyAreas: ['Immunology', 'Rare Diseases'], foundedYear: 2008 },
  { name: 'Karuna Therapeutics', headquarters: 'Boston, USA', website: 'https://www.karunatx.com', therapyAreas: ['Neurology', 'Psychiatry'], foundedYear: 2009 },
  { name: 'Arvinas', headquarters: 'New Haven, USA', website: 'https://www.arvinas.com', therapyAreas: ['Oncology', 'Protein Degradation'], foundedYear: 2013 },

  // Top 50 Innovative Biotech
  { name: 'Relay Therapeutics', headquarters: 'Cambridge, USA', website: 'https://www.relaytx.com', therapyAreas: ['Oncology'], foundedYear: 2015 },
  { name: 'Recursion Pharmaceuticals', headquarters: 'Salt Lake City, USA', website: 'https://www.recursion.com', therapyAreas: ['AI Drug Discovery', 'Rare Diseases'], foundedYear: 2013 },
  { name: 'Beam Therapeutics', headquarters: 'Cambridge, USA', website: 'https://www.beamtx.com', therapyAreas: ['Gene Editing', 'Rare Diseases'], foundedYear: 2017 },
  { name: 'Intellia Therapeutics', headquarters: 'Cambridge, USA', website: 'https://www.intelliatx.com', therapyAreas: ['Gene Editing', 'Rare Diseases'], foundedYear: 2014 },
  { name: 'CRISPR Therapeutics', headquarters: 'Zug, Switzerland', website: 'https://www.crisprtx.com', therapyAreas: ['Gene Editing', 'Rare Diseases'], foundedYear: 2013 },
  { name: 'Editas Medicine', headquarters: 'Cambridge, USA', website: 'https://www.editasmedicine.com', therapyAreas: ['Gene Editing', 'Ophthalmology'], foundedYear: 2013 },
  { name: 'Denali Therapeutics', headquarters: 'South San Francisco, USA', website: 'https://www.denalitherapeutics.com', therapyAreas: ['Neurology', 'Neurodegenerative Diseases'], foundedYear: 2015 },
  { name: 'Alector', headquarters: 'South San Francisco, USA', website: 'https://www.alector.com', therapyAreas: ['Neurology', 'Immunology'], foundedYear: 2013 },
  { name: 'Kymera Therapeutics', headquarters: 'Watertown, USA', website: 'https://www.kymeratx.com', therapyAreas: ['Oncology', 'Immunology'], foundedYear: 2016 },
  { name: 'Revolution Medicines', headquarters: 'Redwood City, USA', website: 'https://www.revmed.com', therapyAreas: ['Oncology'], foundedYear: 2014 },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.newsItem.deleteMany();
  await prisma.clinicalTrial.deleteMany();
  await prisma.company.deleteMany();

  // Seed companies
  console.log('🏢 Seeding 50 pharmaceutical companies...');
  for (const company of companies) {
    const slug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.company.create({
      data: {
        ...company,
        slug,
      },
    });
  }

  console.log(`✅ Created ${companies.length} companies`);
  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Companies: ${companies.length}`);
  console.log('\n🎉 Ready to use CompeteAI!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

