import { PartialType, OmitType } from '@nestjs/mapped-types';
import { RegisterDto } from './registro.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(
  OmitType(RegisterDto, ['email', 'cedula'] as const)
) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}