import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { RegisterCustomTripDto } from './dto/register-custom-trip.dto';
import { SaveItineraryDto } from './dto/save-itinerary.dto';
import {
  CustomTripRegistrationResponse,
  GeneratedItineraryResponse,
  SavedItineraryResponse,
} from './itinerary.types';

@Controller('itinerary')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateItineraryDto): Promise<GeneratedItineraryResponse> {
    return this.itineraryService.generateItinerary(dto);
  }

  @Post('save')
  async save(@Body() dto: SaveItineraryDto): Promise<SavedItineraryResponse> {
    return this.itineraryService.saveItinerary(dto);
  }

  @Post('register-custom')
  async registerCustom(
    @Body() dto: RegisterCustomTripDto,
  ): Promise<CustomTripRegistrationResponse> {
    return this.itineraryService.registerCustomTrip(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SavedItineraryResponse> {
    return this.itineraryService.findOne(id);
  }
}
