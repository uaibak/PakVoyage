import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

type PackageSeedRecord = {
  title: string;
  slug: string;
  region: string;
  summary: string;
  description: string;
  travel_date: Date;
  duration_days: number;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  pickup_city: string;
  package_type: string;
  destinations: string[];
  inclusions: string[];
  is_active: boolean;
};

type PrismaClientWithPackages = PrismaClient & {
  tourPackage: {
    upsert: (args: {
      where: {
        slug: string;
      };
      update: PackageSeedRecord;
      create: PackageSeedRecord;
    }) => Promise<unknown>;
  };
};

const prisma = new PrismaClient() as PrismaClientWithPackages;

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
        "Pakistan's cultural capital, packed with Mughal heritage, old-city streets, museums, and legendary food.",
      best_time: 'October to March',
      avg_cost_per_day: 7000,
    },
    {
      name: 'Islamabad',
      region: 'Capital Territory',
      description:
        'A calm, well-planned capital with Margalla Hills access, museums, cafes, and convenient northbound connections.',
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

  const packages: PackageSeedRecord[] = [
    {
      title: 'Hunza Escape',
      slug: 'hunza-escape',
      region: 'Gilgit-Baltistan',
      summary: 'A scenic northern escape built around Hunza, Attabad Lake, and slow mountain mornings.',
      description:
        'Designed for travelers who want a comfortable mountain itinerary with curated sightseeing, local stays, and dependable pacing across Hunza.',
      travel_date: new Date('2026-06-15T00:00:00.000Z'),
      duration_days: 5,
      price_per_seat: 42000,
      total_seats: 18,
      available_seats: 18,
      pickup_city: 'Islamabad',
      package_type: 'Mountains',
      destinations: ['Islamabad', 'Hunza'],
      inclusions: ['Hotel stay', 'Intercity transport', 'Breakfast', 'Sightseeing support'],
      is_active: true,
    },
    {
      title: 'Skardu Adventure Circuit',
      slug: 'skardu-adventure-circuit',
      region: 'Gilgit-Baltistan',
      summary: 'A higher-altitude route for travelers wanting lakes, viewpoints, and Baltistan landscapes.',
      description:
        'A practical group package built for Skardu, Upper Kachura, and nearby scenic excursions with guided coordination and reserved seats.',
      travel_date: new Date('2026-07-10T00:00:00.000Z'),
      duration_days: 6,
      price_per_seat: 52000,
      total_seats: 20,
      available_seats: 20,
      pickup_city: 'Islamabad',
      package_type: 'Adventure',
      destinations: ['Skardu'],
      inclusions: ['Hotel stay', 'Group transport', 'Breakfast and dinner', 'Tour coordination'],
      is_active: true,
    },
    {
      title: 'Lahore Culture & Food Weekend',
      slug: 'lahore-culture-food-weekend',
      region: 'Punjab',
      summary: 'A short city package centered on history, architecture, and iconic Lahore food trails.',
      description:
        'Built for local tourists and international visitors who want a compact guided Lahore experience with heritage highlights and food-driven stops.',
      travel_date: new Date('2026-11-06T00:00:00.000Z'),
      duration_days: 3,
      price_per_seat: 22500,
      total_seats: 24,
      available_seats: 24,
      pickup_city: 'Lahore',
      package_type: 'Culture',
      destinations: ['Lahore'],
      inclusions: ['Hotel stay', 'City transport', 'Breakfast', 'Guided old-city visit'],
      is_active: true,
    },
  ];

  for (const destination of destinations) {
    await prisma.destination.upsert({
      where: {
        name: destination.name,
      },
      update: destination,
      create: destination,
    });
  }

  for (const travelPackage of packages) {
    await prisma.tourPackage.upsert({
      where: {
        slug: travelPackage.slug,
      },
      update: {
        ...travelPackage,
        available_seats: travelPackage.total_seats,
      },
      create: travelPackage,
    });
  }

  console.log(`Seeded ${destinations.length} destinations and ${packages.length} packages`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
