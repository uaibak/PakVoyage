import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const destinations = [
    {
      name: 'Hunza',
      region: 'Gilgit-Baltistan',
      description:
        'A dramatic mountain valley known for Attabad Lake, ancient forts, and long scenic drives under the Karakoram peaks.',
      best_time: 'May to October',
      avg_cost_per_day: 9500,
    },
    {
      name: 'Skardu',
      region: 'Gilgit-Baltistan',
      description:
        'A high-altitude base for alpine landscapes, cold deserts, lakes, and road trips deeper into Baltistan.',
      best_time: 'June to September',
      avg_cost_per_day: 10500,
    },
    {
      name: 'Lahore',
      region: 'Punjab',
      description:
        'Pakistan’s cultural capital, packed with Mughal heritage, old-city streets, museums, and legendary food.',
      best_time: 'October to March',
      avg_cost_per_day: 7000,
    },
    {
      name: 'Islamabad',
      region: 'Capital Territory',
      description:
        'A calm, well-planned capital with Margalla Hills access, museums, cafés, and convenient northbound connections.',
      best_time: 'Year-round',
      avg_cost_per_day: 7500,
    },
    {
      name: 'Swat Valley',
      region: 'Khyber Pakhtunkhwa',
      description:
        'A lush valley of rivers, forests, hill towns, and family-friendly mountain escapes with easy road access.',
      best_time: 'April to October',
      avg_cost_per_day: 8200,
    },
    {
      name: 'Karachi',
      region: 'Sindh',
      description:
        'A fast-paced coastal metropolis with street food, colonial architecture, art spaces, and weekend beach options.',
      best_time: 'November to February',
      avg_cost_per_day: 6800,
    },
  ];

  for (const dest of destinations) {
    await prisma.destination.upsert({
      where: {
        name: dest.name,
      },
      update: dest,
      create: dest,
    });
  }

  console.log(`Seeded ${destinations.length} destinations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
