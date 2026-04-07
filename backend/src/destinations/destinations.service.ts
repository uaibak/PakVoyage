import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Destination } from '@prisma/client';

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Destination[]> {
    return this.prisma.destination.findMany({
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
