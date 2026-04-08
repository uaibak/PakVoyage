import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListPackagesAdminDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_inactive?: boolean;
}
