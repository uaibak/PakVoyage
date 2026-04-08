import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TourPackage } from '@prisma/client';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TourPackage[]> {
    return this.prisma.tourPackage.findMany({
      where: {
        is_active: true,
      },
      orderBy: [{ travel_date: 'asc' }, { title: 'asc' }],
    });
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
