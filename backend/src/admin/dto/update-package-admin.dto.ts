import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdatePackageAdminDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  stay_style?: string;

  @IsOptional()
  @IsString()
  difficulty_level?: string;

  @IsOptional()
  @IsString()
  departure_notes?: string;

  @IsOptional()
  @IsDateString()
  travel_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration_days?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price_per_seat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  total_seats?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  available_seats?: number;

  @IsOptional()
  @IsString()
  pickup_city?: string;

  @IsOptional()
  @IsString()
  package_type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  destinations?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itinerary_overview?: string[];

  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery_image_urls?: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}
