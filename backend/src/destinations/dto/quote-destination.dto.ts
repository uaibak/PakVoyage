import { IsEnum, IsOptional } from 'class-validator';
import { DisplayCurrency, PricingMarket } from '../../pricing/pricing.types';

export class QuoteDestinationDto {
  @IsOptional()
  @IsEnum(PricingMarket)
  readonly pricing_market?: PricingMarket;

  @IsOptional()
  @IsEnum(DisplayCurrency)
  readonly display_currency?: DisplayCurrency;
}
