import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDestinationAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  short_summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  best_time?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  avg_cost_per_day?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  travel_tips?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ideal_for?: string[];

  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery_image_urls?: string[];
}
