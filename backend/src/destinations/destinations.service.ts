import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Destination, Prisma } from '@prisma/client';
import { ListDestinationsDto } from './dto/list-destinations.dto';

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListDestinationsDto): Promise<Destination[]> {
    const where: Prisma.DestinationWhereInput = {
      region: query.region
        ? {
            equals: query.region,
            mode: 'insensitive',
          }
        : undefined,
      avg_cost_per_day:
        query.max_cost_per_day !== undefined
          ? { lte: query.max_cost_per_day }
          : undefined,
      OR: query.search
        ? [
            {
              name: {
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
              short_summary: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };

    return this.prisma.destination.findMany({
      where,
      orderBy: [{ region: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string): Promise<Destination> {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
    });

    if (!destination) {
      throw new NotFoundException(`Destination with ID "${id}" was not found.`);
    }

    return destination;
  }
}
