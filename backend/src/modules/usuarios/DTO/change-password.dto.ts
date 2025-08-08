// backend/src/modules/usuarios/DTO/change-password.dto.ts
import { IsString, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangePasswordDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos: una minúscula y un número'
  })
  @Transform(({ value }) => value?.trim())
  newPassword: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  confirmPassword: string;

  // Validación personalizada para confirmar contraseñas
  static validatePasswordsMatch(dto: ChangePasswordDto): boolean {
    return dto.newPassword === dto.confirmPassword;
  }
}