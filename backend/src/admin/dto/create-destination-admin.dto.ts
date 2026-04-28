import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateDestinationAdminDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsString()
  @IsNotEmpty()
  short_summary!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  best_time!: string;

  @IsInt()
  @Min(0)
  avg_cost_per_day!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  highlights!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  travel_tips!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ideal_for!: string[];

  @IsString()
  @IsNotEmpty()
  cover_image_url!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  gallery_image_urls!: string[];
}
