import { Controller, Get, Param, Query } from '@nestjs/common';
import { TourPackage } from '@prisma/client';
import { PackagesService } from './packages.service';
import { ListPackagesDto } from './dto/list-packages.dto';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async findAll(@Query() query: ListPackagesDto): Promise<TourPackage[]> {
    return this.packagesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TourPackage> {
    return this.packagesService.findOne(id);
  }
}
