import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCie10Dto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tipo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descripcion: string;
}
