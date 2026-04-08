import { BookingStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateCustomTripStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
