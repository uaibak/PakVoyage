import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TourPackage } from '@prisma/client';
import { ListPackagesDto } from './dto/list-packages.dto';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListPackagesDto): Promise<TourPackage[]> {
    const where: Prisma.TourPackageWhereInput = {
      is_active: true,
      region: query.region
        ? {
            equals: query.region,
            mode: 'insensitive',
          }
        : undefined,
      package_type: query.package_type
        ? {
            equals: query.package_type,
            mode: 'insensitive',
          }
        : undefined,
      price_per_seat:
        query.max_price !== undefined ? { lte: query.max_price } : undefined,
      OR: query.search
        ? [
            {
              title: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              region: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              summary: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };

    const packages = await this.prisma.tourPackage.findMany({
      where,
      orderBy: [{ travel_date: 'asc' }, { title: 'asc' }],
    });

    if (query.month === undefined) {
      return packages;
    }

    return packages.filter(
      (travelPackage) => travelPackage.travel_date.getUTCMonth() + 1 === query.month,
    );
  }

  async findOne(id: string): Promise<TourPackage> {
    const travelPackage = await this.prisma.tourPackage.findUnique({
      where: { id },
    });

    if (!travelPackage || !travelPackage.is_active) {
      throw new NotFoundException(`Package with ID "${id}" was not found.`);
    }

    return travelPackage;
  }
}
