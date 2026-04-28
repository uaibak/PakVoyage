import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreatePackageAdminDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  stay_style!: string;

  @IsString()
  @IsNotEmpty()
  difficulty_level!: string;

  @IsString()
  @IsNotEmpty()
  departure_notes!: string;

  @IsDateString()
  travel_date!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration_days!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price_per_seat!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  total_seats!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  available_seats!: number;

  @IsString()
  @IsNotEmpty()
  pickup_city!: string;

  @IsString()
  @IsNotEmpty()
  package_type!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  destinations!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  inclusions!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  exclusions!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  itinerary_overview!: string[];

  @IsString()
  @IsNotEmpty()
  cover_image_url!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  gallery_image_urls!: string[];

  @Type(() => Boolean)
  @IsBoolean()
  is_active!: boolean;
}
