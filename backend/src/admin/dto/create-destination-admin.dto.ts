import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateDestinationAdminDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  best_time!: string;

  @IsInt()
  @Min(0)
  avg_cost_per_day!: number;
}
