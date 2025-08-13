import { 
  Controller, 
  Post, 
  Body, 
  UploadedFile, 
  UseInterceptors, 
  BadRequestException,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { BulkUsuariosService } from './bulk-usuarios.service';
import { 
  BulkDeactivateDto, 
  ExcelValidationResponseDto, 
  BulkProcessResponseDto,
  BulkDeactivateResponseDto
} from './DTO/bulk-upload.dto';

/**
 * Controlador para operaciones masivas de usuarios
 * Maneja carga desde Excel y desactivación por lotes
 */
@Controller('usuarios/bulk')
@UseGuards(JwtAuthGuard)
export class BulkUsuariosController {
  constructor(private readonly bulkUsuariosService: BulkUsuariosService) {}

  /**
   * Endpoint para validar archivo Excel antes de procesar
   * POST /usuarios/bulk/validate-excel
   * @param file Archivo Excel con datos de usuarios
   * @returns Resultado de la validación con usuarios válidos, inválidos y duplicados
   */
  @Post('validate-excel')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      console.log('📎 Archivo recibido:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      
      // Validar que sea un archivo Excel
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        console.log('❌ Tipo de archivo no válido:', file.mimetype);
        callback(new BadRequestException('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
  }))
  async validateExcelFile(
    @UploadedFile() file: Express.Multer.File
  ): Promise<ExcelValidationResponseDto> {
    console.log('🔍 Validando archivo Excel...');
    
    if (!file) {
      console.log('❌ No se recibió archivo');
      throw new BadRequestException('Archivo Excel es requerido');
    }

    console.log('✅ Archivo válido, procesando...');
    return await this.bulkUsuariosService.validateExcelFile(file.buffer);
  }

  /**
   * Endpoint para procesar usuarios validados
   * POST /usuarios/bulk/process
   * @param body Datos de usuarios válidos y duplicados para procesar
   * @returns Resultado del procesamiento masivo
   */
  @Post('process')
  async processUsers(
    @Body() body: {
      validUsers: any[];
      duplicateUsers: any[];
    }
  ): Promise<BulkProcessResponseDto> {
    const { validUsers, duplicateUsers } = body;

    if (!validUsers || !Array.isArray(validUsers)) {
      throw new BadRequestException('Lista de usuarios válidos es requerida');
    }

    if (!duplicateUsers || !Array.isArray(duplicateUsers)) {
      throw new BadRequestException('Lista de usuarios duplicados es requerida');
    }

    return await this.bulkUsuariosService.processValidUsers(validUsers, duplicateUsers);
  }

  /**
   * Endpoint para desactivar múltiples usuarios
   * POST /usuarios/bulk/deactivate
   * @param bulkDeactivateDto DTO con los IDs de usuarios a desactivar
   * @returns Resultado de la desactivación masiva
   */
  @Post('deactivate')
  async bulkDeactivateUsers(
    @Body() bulkDeactivateDto: BulkDeactivateDto
  ): Promise<BulkDeactivateResponseDto> {
    return await this.bulkUsuariosService.bulkDeactivateUsers(bulkDeactivateDto);
  }
}
