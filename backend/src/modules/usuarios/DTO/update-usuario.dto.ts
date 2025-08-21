import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './registro.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(RegisterDto) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}