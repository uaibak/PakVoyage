import { Controller, Get, Param } from '@nestjs/common';
import { TourPackage } from '@prisma/client';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async findAll(): Promise<TourPackage[]> {
    return this.packagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TourPackage> {
    return this.packagesService.findOne(id);
  }
}
