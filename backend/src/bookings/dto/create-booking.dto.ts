import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  IsEnum,
} from 'class-validator';
import { DisplayCurrency, PricingMarket } from '../../pricing/pricing.types';
import { PaymentStatus } from '@prisma/client';

export class CreateBookingDto {
  @IsString()
  package_id!: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  national_id!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  seats!: number;

  @IsOptional()
  @IsString()
  special_requests?: string;

  @IsOptional()
  @IsEnum(PricingMarket)
  pricing_market?: PricingMarket;

  @IsOptional()
  @IsEnum(DisplayCurrency)
  display_currency?: DisplayCurrency;

  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @IsOptional()
  @IsString()
  payment_reference?: string;
}
