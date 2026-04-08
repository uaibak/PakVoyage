import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TravelInterest } from '../travel-interest.enum';

export class RegisterCustomTripDto {
  @IsOptional()
  @IsString()
  readonly itinerary_id?: string;

  @IsString()
  @IsNotEmpty()
  readonly full_name!: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  readonly phone!: string;

  @IsString()
  @IsNotEmpty()
  readonly national_id!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  readonly seats!: number;

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

  @IsString()
  @IsNotEmpty()
  readonly trip_summary!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly destinations!: string[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly estimated_total!: number;

  @IsOptional()
  @IsString()
  readonly special_requests?: string;
}
