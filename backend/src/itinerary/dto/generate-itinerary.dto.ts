import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsInt, Max, Min } from 'class-validator';
import { TravelInterest } from '../travel-interest.enum';

export class GenerateItineraryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  readonly days!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  readonly budget!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(TravelInterest, { each: true })
  readonly interests!: TravelInterest[];
}
