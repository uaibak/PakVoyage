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
import { DisplayCurrency, PricingMarket } from '../../pricing/pricing.types';
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
  @IsEnum(PricingMarket)
  readonly pricing_market?: PricingMarket;

  @IsOptional()
  @IsEnum(DisplayCurrency)
  readonly display_currency?: DisplayCurrency;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly exchange_rate?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly display_total?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly security_cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly service_cost?: number;

  @IsOptional()
  @IsString()
  readonly special_requests?: string;
}
