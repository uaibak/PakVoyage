import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { DisplayCurrency, PricingMarket } from '../../pricing/pricing.types';

export class QuotePackageDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  readonly seats!: number;

  @IsOptional()
  @IsEnum(PricingMarket)
  readonly pricing_market?: PricingMarket;

  @IsOptional()
  @IsEnum(DisplayCurrency)
  readonly display_currency?: DisplayCurrency;
}
