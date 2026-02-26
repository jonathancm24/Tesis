import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ArchivosService } from './archivos.service';
import { CreateArchivoDto, ListArchivosDto } from './dto';

@Controller('archivos')
@UseGuards(JwtAuthGuard)
export class ArchivosController {
  constructor(private readonly archivosService: ArchivosService) {}

  @Get('area-estudiantes')
  async listAreaEstudiantes(@Req() req: Request) {
    const actorId = this.getActorId(req);
    return this.archivosService.listAreaEstudiantes(actorId);
  }

  @Post('area-estudiantes/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async uploadAreaEstudiantes(
    @UploadedFile() file: Express.Multer.File,
    @Body('descripcion') descripcion: string | undefined,
    @Req() req: Request,
  ) {
    const actorId = this.getActorId(req);
    return this.archivosService.uploadAreaEstudiantes(actorId, file, descripcion);
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateArchivoDto,
    @Req() req: Request,
  ) {
    const actorId = this.getActorId(req);
    return this.archivosService.upload(actorId, dto, file);
  }

  @Get('entidad/:entidadTipo/:entidadId')
  async listByEntity(
    @Param('entidadTipo') entidadTipo: string,
    @Param('entidadId', ParseIntPipe) entidadId: number,
    @Req() req: Request,
  ) {
    const actorId = this.getActorId(req);
    return this.archivosService.listByEntity(actorId, entidadTipo, entidadId);
  }

  @Get('mis-subidos')
  async listMyUploads(@Query() query: ListArchivosDto, @Req() req: Request) {
    const actorId = this.getActorId(req);
    return this.archivosService.listMyUploads(actorId, query);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const actorId = this.getActorId(req);
    const payload = await this.archivosService.getDownloadPayload(actorId, id);

    res.set({
      'Content-Type': payload.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(payload.fileName)}"`,
    });

    return new StreamableFile(payload.stream);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const actorId = this.getActorId(req);
    return this.archivosService.remove(actorId, id);
  }

  private getActorId(req: Request): number {
    const actorId = (req.user as any)?.id;
    if (typeof actorId !== 'number') {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return actorId;
  }
}
