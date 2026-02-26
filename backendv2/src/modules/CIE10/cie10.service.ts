import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import * as XLSX from 'xlsx';
import { CreateCie10Dto, ListCie10Dto, UpdateCie10Dto } from './dto';

@Injectable()
export class Cie10Service {
  constructor(private readonly prisma: PrismaService) {}

  generateTemplateExcel(): Buffer {
    const workbook = XLSX.utils.book_new();

    const dataRows = [
      { codigo: 'K02.1', tipo: 'CIE10', descripcion: 'Caries de dentina' },
      {
        codigo: 'D7140',
        tipo: 'PROCEDIMIENTO',
        descripcion: 'Extracción de diente erupcionado o raíz expuesta',
      },
    ];

    const dataSheet = XLSX.utils.json_to_sheet(dataRows, {
      header: ['codigo', 'tipo', 'descripcion'],
    });

    const instrucciones = [
      {
        campo: 'codigo',
        detalle: 'Obligatorio. Debe ser único. Ej: K02.1, D7140',
      },
      {
        campo: 'tipo',
        detalle: 'Obligatorio. Recomendado: CIE10 o PROCEDIMIENTO',
      },
      {
        campo: 'descripcion',
        detalle: 'Obligatorio. Descripción completa del código',
      },
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instrucciones, {
      header: ['campo', 'detalle'],
    });

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'plantilla_cie10');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'instrucciones');

    return XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;
  }

  async create(dto: CreateCie10Dto) {
    const codigo = this.normalizeCodigo(dto.codigo);

    const existente = await this.prisma.cIE10yOtrasClasificaciones.findUnique({
      where: { codigo },
    });

    if (existente) {
      throw new ConflictException(`Ya existe un registro con código ${codigo}`);
    }

    return this.prisma.cIE10yOtrasClasificaciones.create({
      data: {
        codigo,
        tipo: dto.tipo.trim(),
        descripcion: dto.descripcion.trim(),
      },
    });
  }

  async findAll(query: ListCie10Dto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const where: Prisma.CIE10yOtrasClasificacionesWhereInput = {};

    if (query.tipo?.trim()) {
      where.tipo = {
        contains: query.tipo.trim(),
        mode: 'insensitive',
      };
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        {
          codigo: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          descripcion: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.cIE10yOtrasClasificaciones.count({ where }),
      this.prisma.cIE10yOtrasClasificaciones.findMany({
        where,
        orderBy: { codigo: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(codigo: string) {
    const normalized = this.normalizeCodigo(codigo);
    const item = await this.prisma.cIE10yOtrasClasificaciones.findUnique({
      where: { codigo: normalized },
    });

    if (!item) {
      throw new NotFoundException(`No existe el código ${normalized}`);
    }

    return item;
  }

  async update(codigo: string, dto: UpdateCie10Dto) {
    const normalized = this.normalizeCodigo(codigo);
    await this.findOne(normalized);

    return this.prisma.cIE10yOtrasClasificaciones.update({
      where: { codigo: normalized },
      data: {
        tipo: dto.tipo?.trim(),
        descripcion: dto.descripcion?.trim(),
      },
    });
  }

  async remove(codigo: string) {
    const normalized = this.normalizeCodigo(codigo);
    await this.findOne(normalized);

    try {
      await this.prisma.cIE10yOtrasClasificaciones.delete({
        where: { codigo: normalized },
      });
    } catch (error) {
      throw new ConflictException(
        'No se puede eliminar el código porque está siendo usado en tratamientos',
      );
    }

    return {
      message: `Código ${normalized} eliminado correctamente`,
    };
  }

  async importFromExcel(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo Excel en el campo file');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new BadRequestException('El archivo Excel no contiene hojas');
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: '',
    });

    if (!rows.length) {
      throw new BadRequestException('El archivo Excel no contiene registros');
    }

    let creados = 0;
    let actualizados = 0;
    let omitidos = 0;
    const errores: Array<{ fila: number; mensaje: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const fila = i + 2;

      const codigoRaw = this.getColumnValue(row, [
        'codigo',
        'código',
        'cie10',
        'code',
        'codigo_cie10',
      ]);

      const tipoRaw = this.getColumnValue(row, [
        'tipo',
        'clasificacion',
        'categoria',
        'tipo_codigo',
      ]);

      const descripcionRaw = this.getColumnValue(row, [
        'descripcion',
        'descripción',
        'detalle',
        'nombre',
        'description',
      ]);

      const codigo = this.normalizeCodigo(codigoRaw);
      const tipo = tipoRaw?.trim() || 'CIE10';
      const descripcion = descripcionRaw?.trim();

      if (!codigo && !descripcion) {
        omitidos += 1;
        continue;
      }

      if (!codigo) {
        errores.push({ fila, mensaje: 'Código vacío' });
        continue;
      }

      if (!descripcion) {
        errores.push({ fila, mensaje: `Descripción vacía para código ${codigo}` });
        continue;
      }

      try {
        const existe = await this.prisma.cIE10yOtrasClasificaciones.findUnique({
          where: { codigo },
          select: { codigo: true },
        });

        await this.prisma.cIE10yOtrasClasificaciones.upsert({
          where: { codigo },
          update: {
            tipo,
            descripcion,
          },
          create: {
            codigo,
            tipo,
            descripcion,
          },
        });

        if (existe) {
          actualizados += 1;
        } else {
          creados += 1;
        }
      } catch (error) {
        errores.push({ fila, mensaje: `No se pudo procesar el código ${codigo}` });
      }
    }

    return {
      totalFilas: rows.length,
      creados,
      actualizados,
      omitidos,
      errores,
    };
  }

  private normalizeCodigo(value: any): string {
    return String(value ?? '')
      .trim()
      .toUpperCase();
  }

  private getColumnValue(row: Record<string, any>, aliases: string[]): string {
    const normalizedMap = new Map<string, any>();

    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = key
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      normalizedMap.set(normalizedKey, value);
    });

    for (const alias of aliases) {
      const normalizedAlias = alias
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (normalizedMap.has(normalizedAlias)) {
        return String(normalizedMap.get(normalizedAlias) ?? '');
      }
    }

    return '';
  }
}
