import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

type PackageSeedRecord = {
  title: string;
  slug: string;
  region: string;
  summary: string;
  description: string;
  stay_style: string;
  difficulty_level: string;
  departure_notes: string;
  travel_date: Date;
  duration_days: number;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  pickup_city: string;
  package_type: string;
  destinations: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary_overview: string[];
  cover_image_url: string;
  gallery_image_urls: string[];
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
      short_summary:
        'Alpine viewpoints, turquoise lakes, old forts, and long mountain mornings.',
      description:
        'A dramatic mountain valley known for Attabad Lake, ancient forts, and long scenic drives under the Karakoram peaks.',
      best_time: 'May to October',
      avg_cost_per_day: 9500,
      highlights: ['Attabad Lake', 'Baltit Fort', 'Karimabad viewpoints'],
      travel_tips: [
        'Road travel times can shift with weather and traffic on the Karakoram Highway.',
        'Carry layers for large temperature swings between day and night.',
        'Keep one flexible slot for weather-dependent lake or pass excursions.',
      ],
      ideal_for: ['Mountain scenery', 'Slow scenic road trips', 'Photography'],
      cover_image_url:
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1464820453369-31d2c0b651af?auto=format&fit=crop&w=1400&q=80',
      ],
    },
    {
      name: 'Skardu',
      region: 'Gilgit-Baltistan',
      short_summary:
        'A high-altitude launch point for lakes, deserts, and Baltistan valley drives.',
      description:
        'A high-altitude base for alpine landscapes, cold deserts, lakes, and road trips deeper into Baltistan.',
      best_time: 'June to September',
      avg_cost_per_day: 10500,
      highlights: ['Upper Kachura Lake', 'Shigar Valley', 'Sarfaranga cold desert'],
      travel_tips: [
        'Build in recovery time for altitude and long transfer days.',
        'Morning departures are the most reliable for scenic drive days.',
        'Pack sun protection; the high-altitude light is stronger than it feels.',
      ],
      ideal_for: ['Adventure routes', 'Landscape photography', 'Longer northern circuits'],
      cover_image_url:
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
      ],
    },
    {
      name: 'Lahore',
      region: 'Punjab',
      short_summary:
        'A heritage-heavy city break with Mughal landmarks and iconic food stops.',
      description:
        "Pakistan's cultural capital, packed with Mughal heritage, old-city streets, museums, and legendary food.",
      best_time: 'October to March',
      avg_cost_per_day: 7000,
      highlights: ['Badshahi Mosque', 'Walled City', 'Food Street'],
      travel_tips: [
        'Late afternoons work best for old-city walks and evening food stops.',
        'Weekday museum visits are usually calmer than weekends.',
        'Keep cash for older markets and small local food vendors.',
      ],
      ideal_for: ['Culture', 'Architecture', 'Food-focused trips'],
      cover_image_url:
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80',
      ],
    },
    {
      name: 'Islamabad',
      region: 'Capital Territory',
      short_summary:
        'A calm capital city with hills access, easy logistics, and a polished urban pace.',
      description:
        'A calm, well-planned capital with Margalla Hills access, museums, cafes, and convenient northbound connections.',
      best_time: 'Year-round',
      avg_cost_per_day: 7500,
      highlights: ['Faisal Mosque', 'Margalla viewpoints', 'Saidpur and museum stops'],
      travel_tips: [
        'Use it as a soft landing before a longer northern road trip.',
        'Evening traffic is lighter than larger commercial cities, but peak hours still matter.',
        'Pair city time with a short Margalla stop for balance.',
      ],
      ideal_for: ['Easy pacing', 'Transit-friendly starts', 'Balanced city + nature trips'],
      cover_image_url:
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1464823063530-08f10ed1a2dd?auto=format&fit=crop&w=1400&q=80',
      ],
    },
    {
      name: 'Swat Valley',
      region: 'Khyber Pakhtunkhwa',
      short_summary:
        'Forests, rivers, family-friendly hill stops, and easy mountain contrast from major cities.',
      description:
        'A lush valley of rivers, forests, hill towns, and family-friendly mountain escapes with easy road access.',
      best_time: 'April to October',
      avg_cost_per_day: 8200,
      highlights: ['Malam Jabba', 'Riverside valleys', 'Hill town markets'],
      travel_tips: [
        'Road conditions can change by season, so leave buffer time between stops.',
        'Families usually do best with shorter, more anchored day plans here.',
        'Pack light outerwear even in warmer months for evening temperature drops.',
      ],
      ideal_for: ['Family travel', 'Nature-heavy getaways', 'Short mountain escapes'],
      cover_image_url:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1400&q=80',
      ],
    },
    {
      name: 'Karachi',
      region: 'Sindh',
      short_summary:
        'A big-city coastal mix of food culture, art, and weekend shoreline options.',
      description:
        'A fast-paced coastal metropolis with street food, colonial architecture, art spaces, and weekend beach options.',
      best_time: 'November to February',
      avg_cost_per_day: 6800,
      highlights: ['Burns Road food belt', 'Historic districts', 'Coastal sunset plans'],
      travel_tips: [
        'Use shorter clustered routes to avoid burning time in traffic.',
        'Early evenings are best for food and coastal transitions.',
        'Weekends are lively, but weekday museum and gallery stops are easier to manage.',
      ],
      ideal_for: ['Food itineraries', 'Urban weekends', 'Art and city energy'],
      cover_image_url:
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
      ],
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
      stay_style: 'Boutique scenic stays',
      difficulty_level: 'Easy to moderate',
      departure_notes: 'Best for travelers comfortable with long but rewarding road stretches.',
      travel_date: new Date('2026-06-15T00:00:00.000Z'),
      duration_days: 5,
      price_per_seat: 42000,
      total_seats: 18,
      available_seats: 18,
      pickup_city: 'Islamabad',
      package_type: 'Mountains',
      destinations: ['Islamabad', 'Hunza'],
      inclusions: ['Hotel stay', 'Intercity transport', 'Breakfast', 'Sightseeing support'],
      exclusions: ['Lunch and dinner', 'Personal shopping', 'Travel insurance'],
      itinerary_overview: [
        'Islamabad departure and transit briefing',
        'Scenic Hunza arrival with Karimabad orientation',
        'Attabad Lake and fort-focused sightseeing day',
      ],
      cover_image_url:
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1464820453369-31d2c0b651af?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
      ],
      is_active: true,
    },
    {
      title: 'Skardu Adventure Circuit',
      slug: 'skardu-adventure-circuit',
      region: 'Gilgit-Baltistan',
      summary: 'A higher-altitude route for travelers wanting lakes, viewpoints, and Baltistan landscapes.',
      description:
        'A practical group package built for Skardu, Upper Kachura, and nearby scenic excursions with guided coordination and reserved seats.',
      stay_style: 'Comfort adventure lodges',
      difficulty_level: 'Moderate',
      departure_notes: 'Suited to travelers who want fuller sightseeing days and higher-altitude terrain.',
      travel_date: new Date('2026-07-10T00:00:00.000Z'),
      duration_days: 6,
      price_per_seat: 52000,
      total_seats: 20,
      available_seats: 20,
      pickup_city: 'Islamabad',
      package_type: 'Adventure',
      destinations: ['Skardu'],
      inclusions: ['Hotel stay', 'Group transport', 'Breakfast and dinner', 'Tour coordination'],
      exclusions: ['Lunch', 'Optional ATV or jeep add-ons', 'Personal porter services'],
      itinerary_overview: [
        'Arrival and acclimatization pacing in Skardu',
        'Lake and viewpoint day with guided transport',
        'Shigar or cold desert excursion depending on conditions',
      ],
      cover_image_url:
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
      ],
      is_active: true,
    },
    {
      title: 'Lahore Culture & Food Weekend',
      slug: 'lahore-culture-food-weekend',
      region: 'Punjab',
      summary: 'A short city package centered on history, architecture, and iconic Lahore food trails.',
      description:
        'Built for local tourists and international visitors who want a compact guided Lahore experience with heritage highlights and food-driven stops.',
      stay_style: 'Urban boutique hotel',
      difficulty_level: 'Easy',
      departure_notes: 'A strong fit for weekend travelers who want a compact city itinerary.',
      travel_date: new Date('2026-11-06T00:00:00.000Z'),
      duration_days: 3,
      price_per_seat: 22500,
      total_seats: 24,
      available_seats: 24,
      pickup_city: 'Lahore',
      package_type: 'Culture',
      destinations: ['Lahore'],
      inclusions: ['Hotel stay', 'City transport', 'Breakfast', 'Guided old-city visit'],
      exclusions: ['Dinner', 'Museum entry surcharges', 'Airport transfers'],
      itinerary_overview: [
        'Arrival, orientation, and evening food circuit',
        'Walled City and heritage landmark day',
        'Flexible museum, shopping, and departure window',
      ],
      cover_image_url:
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80',
      gallery_image_urls: [
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80',
      ],
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
