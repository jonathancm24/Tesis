import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as xlsx from 'xlsx';
import { hash } from 'bcrypt';
import { 
  ExcelValidationResponseDto, 
  BulkProcessResponseDto, 
  BulkDeactivateDto, 
  BulkDeactivateResponseDto 
} from './DTO/bulk-upload.dto';

/**
 * Servicio para manejar operaciones masivas de usuarios
 * Incluye carga desde Excel y desactivación por lotes
 */
@Injectable()
export class BulkUsuariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida el formato del archivo Excel y retorna los usuarios procesables
   * @param buffer Buffer del archivo Excel
   * @returns Resultado de la validación con usuarios válidos, inválidos y duplicados
   */
  async validateExcelFile(buffer: Buffer): Promise<ExcelValidationResponseDto> {
    try {
      // Leer el archivo Excel
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        throw new BadRequestException('El archivo Excel no contiene hojas de cálculo');
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new BadRequestException('El archivo Excel está vacío');
      }

      // Validar estructura del archivo
      const requiredColumns = [
        'nombre', 'apellido', 'email', 'tipoDocumento', 
        'numeroDocumento', 'fechaNacimiento', 'role'
      ];

      const firstRow = jsonData[0] as any;
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));

      if (missingColumns.length > 0) {
        throw new BadRequestException(
          `Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}`
        );
      }

      // Procesar cada fila
      const validUsers = [];
      const invalidUsers = [];
      const duplicateUsers = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        const rowNumber = i + 2; // +2 porque Excel empieza en 1 y hay header

        try {
          // Validar datos de la fila
          const validationResult = await this.validateUserRow(row, rowNumber);
          
          if (validationResult.isValid) {
            // Verificar si el usuario ya existe
            const existingUser = await this.checkUserExists(row.email, row.numeroDocumento);
            
            if (existingUser) {
              duplicateUsers.push({
                row: rowNumber,
                data: row,
                existingUser: {
                  id: existingUser.id,
                  nombre: existingUser.nombre,
                  apellido: existingUser.apellido,
                  email: existingUser.email,
                  activo: existingUser.activo
                }
              });
            } else {
              validUsers.push({
                ...validationResult.cleanedData,
                _originalRow: rowNumber
              });
            }
          } else {
            invalidUsers.push({
              row: rowNumber,
              data: row,
              errors: validationResult.errors
            });
          }
        } catch (error) {
          invalidUsers.push({
            row: rowNumber,
            data: row,
            errors: [`Error inesperado: ${error.message}`]
          });
        }
      }

      // Crear respuesta
      const response: ExcelValidationResponseDto = {
        validUsers,
        invalidUsers,
        duplicateUsers,
        summary: {
          totalRows: jsonData.length,
          validRows: validUsers.length,
          invalidRows: invalidUsers.length,
          duplicateRows: duplicateUsers.length
        },
        hasErrors: invalidUsers.length > 0
      };

      return response;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al procesar el archivo Excel: ${error.message}`);
    }
  }

  /**
   * Procesa usuarios válidos y los crea en la base de datos
   * También reactiva usuarios duplicados si están inactivos
   * @param validUsers Lista de usuarios válidos para procesar
   * @param duplicateUsers Lista de usuarios duplicados para reactivar
   * @returns Resultado del procesamiento masivo
   */
  async processValidUsers(
    validUsers: any[], 
    duplicateUsers: any[]
  ): Promise<BulkProcessResponseDto> {
    const created = [];
    const updated = [];
    const failed = [];

    // Procesar usuarios nuevos
    for (const userData of validUsers) {
      try {
        // Obtener roleId basado en el nombre del rol
        const roleId = await this.getRoleIdByName(userData.role);
        
        // Generar contraseña temporal
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await hash(temporaryPassword, 10);

        // Crear usuario
        const newUser = await this.prisma.usuario.create({
          data: {
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
            tipoDocumento: userData.tipoDocumento,
            numeroDocumento: userData.numeroDocumento,
            fechaNacimiento: new Date(userData.fechaNacimiento),
            password: hashedPassword,
            roleId: roleId,
            parroquiaId: userData.parroquiaId || 1, // Parroquia por defecto
            activo: true
          },
          include: {
            role: true
          }
        });

        created.push({
          ...newUser,
          temporaryPassword, // Solo para mostrar en la respuesta
          _originalRow: userData._originalRow
        });

      } catch (error) {
        failed.push({
          data: userData,
          error: error.message
        });
      }
    }

    // Reactivar usuarios duplicados que están inactivos
    for (const duplicateInfo of duplicateUsers) {
      try {
        if (!duplicateInfo.existingUser.activo) {
          const reactivatedUser = await this.prisma.usuario.update({
            where: { id: duplicateInfo.existingUser.id },
            data: { activo: true },
            include: {
              role: true
            }
          });

          updated.push({
            ...reactivatedUser,
            _originalRow: duplicateInfo.row
          });
        }
      } catch (error) {
        failed.push({
          data: duplicateInfo.data,
          error: `Error al reactivar usuario: ${error.message}`
        });
      }
    }

    return {
      created,
      updated,
      failed,
      summary: {
        totalProcessed: validUsers.length + duplicateUsers.length,
        successfullyCreated: created.length,
        successfullyUpdated: updated.length,
        failed: failed.length
      }
    };
  }

  /**
   * Desactiva múltiples usuarios por sus IDs
   * @param bulkDeactivateDto DTO con los IDs de usuarios a desactivar
   * @returns Resultado de la desactivación masiva
   */
  async bulkDeactivateUsers(bulkDeactivateDto: BulkDeactivateDto): Promise<BulkDeactivateResponseDto> {
    const { userIds } = bulkDeactivateDto;
    const deactivated = [];
    const failed = [];

    for (const userId of userIds) {
      try {
        // Verificar que el usuario existe y está activo
        const user = await this.prisma.usuario.findUnique({
          where: { id: userId },
          include: { role: true }
        });

        if (!user) {
          failed.push({
            id: userId,
            error: 'Usuario no encontrado'
          });
          continue;
        }

        if (!user.activo) {
          failed.push({
            id: userId,
            error: 'Usuario ya está desactivado'
          });
          continue;
        }

        // Desactivar usuario
        const deactivatedUser = await this.prisma.usuario.update({
          where: { id: userId },
          data: { activo: false },
          include: { role: true }
        });

        deactivated.push(deactivatedUser);

      } catch (error) {
        failed.push({
          id: userId,
          error: error.message
        });
      }
    }

    return {
      deactivated,
      failed,
      summary: {
        totalRequested: userIds.length,
        successfullyDeactivated: deactivated.length,
        failed: failed.length
      }
    };
  }

  /**
   * Valida una fila de datos de usuario
   * @param row Fila de datos del Excel
   * @param rowNumber Número de fila para referencia
   * @returns Resultado de validación con datos limpios o errores
   */
  private async validateUserRow(row: any, rowNumber: number): Promise<{
    isValid: boolean;
    cleanedData?: any;
    errors?: string[];
  }> {
    const errors = [];

    // Validar campos requeridos
    if (!row.nombre || typeof row.nombre !== 'string' || row.nombre.trim().length === 0) {
      errors.push('Nombre es requerido');
    }

    if (!row.apellido || typeof row.apellido !== 'string' || row.apellido.trim().length === 0) {
      errors.push('Apellido es requerido');
    }

    if (!row.email || typeof row.email !== 'string' || !this.isValidEmail(row.email)) {
      errors.push('Email válido es requerido');
    }

    if (!row.tipoDocumento || !['CEDULA', 'PASAPORTE', 'RUC'].includes(row.tipoDocumento)) {
      errors.push('Tipo de documento debe ser: CEDULA, PASAPORTE o RUC');
    }

    if (!row.numeroDocumento || typeof row.numeroDocumento !== 'string' || row.numeroDocumento.trim().length === 0) {
      errors.push('Número de documento es requerido');
    }

    if (!row.fechaNacimiento || !this.isValidDate(row.fechaNacimiento)) {
      errors.push('Fecha de nacimiento válida es requerida (formato: YYYY-MM-DD)');
    }

    if (!row.role || !['admin', 'profesor', 'estudiante', 'secretario', 'paciente'].includes(row.role.toLowerCase())) {
      errors.push('Rol debe ser: admin, profesor, estudiante, secretario o paciente');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Limpiar y formatear datos
    const cleanedData = {
      nombre: row.nombre.trim(),
      apellido: row.apellido.trim(),
      email: row.email.trim().toLowerCase(),
      tipoDocumento: row.tipoDocumento.toUpperCase(),
      numeroDocumento: row.numeroDocumento.trim(),
      fechaNacimiento: row.fechaNacimiento,
      role: row.role.toLowerCase(),
      parroquiaId: row.parroquiaId || 1 // Parroquia por defecto
    };

    return { isValid: true, cleanedData };
  }

  /**
   * Verifica si un usuario ya existe por email o número de documento
   * @param email Email del usuario
   * @param numeroDocumento Número de documento del usuario
   * @returns Usuario existente o null
   */
  private async checkUserExists(email: string, numeroDocumento: string) {
    return await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { numeroDocumento: numeroDocumento }
        ]
      }
    });
  }

  /**
   * Obtiene el ID del rol basado en su nombre
   * @param roleName Nombre del rol
   * @returns ID del rol
   */
  private async getRoleIdByName(roleName: string): Promise<number> {
    const roleMap = {
      'admin': 'ADMIN',
      'profesor': 'PROFESOR',
      'estudiante': 'ESTUDIANTE',
      'secretario': 'SECRETARIO',
      'paciente': 'PACIENTE'
    };

    const backendRoleName = roleMap[roleName.toLowerCase()];
    
    if (!backendRoleName) {
      throw new Error(`Rol no válido: ${roleName}`);
    }

    const role = await this.prisma.role.findFirst({
      where: { nombre: backendRoleName }
    });

    if (!role) {
      throw new Error(`Rol no encontrado en la base de datos: ${backendRoleName}`);
    }

    return role.id;
  }

  /**
   * Genera una contraseña temporal para usuarios creados masivamente
   * @returns Contraseña temporal
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Valida si un email tiene formato correcto
   * @param email Email a validar
   * @returns true si es válido
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida si una fecha tiene formato correcto
   * @param dateString Fecha como string
   * @returns true si es válida
   */
  private isValidDate(dateString: any): boolean {
    if (!dateString) return false;
    
    // Si es un número de Excel, convertir
    if (typeof dateString === 'number') {
      const excelDate = new Date((dateString - 25569) * 86400 * 1000);
      return !isNaN(excelDate.getTime());
    }
    
    // Si es string, validar formato
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
