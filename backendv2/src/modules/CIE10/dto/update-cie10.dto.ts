import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCie10Dto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;
}
