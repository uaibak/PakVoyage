import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  package_id!: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsString()
  full_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  national_id?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  seats!: number;

  @IsOptional()
  @IsString()
  special_requests?: string;
}
