import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { TravelInterest } from '../travel-interest.enum';

class SaveItineraryDayDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly day_number!: number;

  @IsString()
  readonly destination_id!: string;

  @IsString()
  readonly activities!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly cost!: number;
}

export class SaveItineraryDto {
  @IsOptional()
  @IsString()
  readonly user_id?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly days!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  readonly budget!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(TravelInterest, { each: true })
  readonly interests!: TravelInterest[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly total_cost!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly hotel_cost!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly transport_cost!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly food_cost!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaveItineraryDayDto)
  readonly itinerary_days!: SaveItineraryDayDto[];
}
