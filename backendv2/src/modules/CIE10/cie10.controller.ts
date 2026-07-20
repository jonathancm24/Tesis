import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateCie10Dto, ListCie10Dto, UpdateCie10Dto } from './dto';
import { Cie10Service } from './cie10.service';

@Controller('cie10')
@UseGuards(JwtAuthGuard)
export class Cie10Controller {
  constructor(private readonly cie10Service: Cie10Service) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCie10Dto) {
    return this.cie10Service.create(dto);
  }

  @Get()
  findAll(@Query() query: ListCie10Dto) {
    return this.cie10Service.findAll(query);
  }

  @Get('template/excel')
  async downloadTemplate(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.buildTemplateResponse(res);
  }

  @Get('template')
  async downloadTemplateAlias(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.buildTemplateResponse(res);
  }

  private async buildTemplateResponse(res: Response): Promise<StreamableFile> {
    const buffer = await this.cie10Service.generateTemplateExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_cie10.xlsx"',
    });

    return new StreamableFile(buffer);
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.cie10Service.findOne(codigo);
  }

  @Patch(':codigo')
  update(@Param('codigo') codigo: string, @Body() dto: UpdateCie10Dto) {
    return this.cie10Service.update(codigo, dto);
  }

  @Delete(':codigo')
  remove(@Param('codigo') codigo: string) {
    return this.cie10Service.remove(codigo);
  }

  @Post('import/excel')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  importExcel(@UploadedFile() file: Express.Multer.File) {
    return this.cie10Service.importFromExcel(file);
  }
}
