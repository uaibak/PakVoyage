import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDestinationAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  region?: string;

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
}
