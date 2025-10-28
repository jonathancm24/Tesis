/**
 * Servicio de Odontogramas
 * 
 * Implementa la lógica de negocio básica para la gestión de odontogramas,
 * siguiendo el patrón establecido en el sistema y adaptándose al esquema
 * real de la base de datos.
 * 
 * @fileoverview Servicio principal del módulo Odontogramas
 * @module OdontogramaService
 * @requires PrismaService
 */

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CrearOdontogramaDto,
    ActualizarOdontogramaBasicoDto,
    FiltrosOdontogramasDto,
    RespuestaPaginadaOdontogramasDto
} from './DTO/';
import {
    IOdontograma,
    IOdontogramaCompleto
} from './Interface/';
import { Prisma } from '@prisma/client';

/**
 * Servicio principal para la gestión de odontogramas
 * 
 * Proporciona funcionalidades básicas para:
 * - Gestión CRUD de odontogramas
 * - Consultas con filtros y paginación
 * - Validación de permisos según el esquema de la BD
 */
@Injectable()
export class OdontogramaService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Crear un nuevo odontograma
     * Crea un odontograma asociado a un caso clínico específico
     */
    async crearOdontograma(
        crearOdontogramaDto: CrearOdontogramaDto,
        usuarioId: number
    ): Promise<IOdontograma> {
        // Validar que el caso clínico existe y pertenece al estudiante
        const casoClinico = await this.prisma.casoClinico.findFirst({
            where: {
                id: crearOdontogramaDto.casoClinicoId,
                estudianteId: usuarioId
            }
        });

        if (!casoClinico) {
            throw new NotFoundException('Caso clínico no encontrado o no pertenece al estudiante');
        }

        // Verificar si ya existe un odontograma para el mismo diente
        const odontogramaExistente = await this.prisma.odontograma.findFirst({
            where: {
                casoClinicoId: crearOdontogramaDto.casoClinicoId,
                diente: crearOdontogramaDto.diente
            }
        });

        if (odontogramaExistente) {
            throw new BadRequestException(
                `Ya existe un odontograma para el diente ${crearOdontogramaDto.diente} en este caso clínico`
            );
        }

        try {
            const nuevoOdontograma = await this.prisma.odontograma.create({
                data: {
                    diente: crearOdontogramaDto.diente,
                    condicion: JSON.parse(JSON.stringify(crearOdontogramaDto.condiciones)),
                    conclusion: crearOdontogramaDto.conclusion,
                    casoClinicoId: crearOdontogramaDto.casoClinicoId,
                    estudianteId: usuarioId,
                    docenteId: crearOdontogramaDto.docenteId || null
                }
            });

            return this.mapearOdontograma(nuevoOdontograma);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new BadRequestException(`Error al crear odontograma: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Obtener odontogramas con filtros y paginación
     */
    async obtenerOdontogramas(
        filtros: FiltrosOdontogramasDto,
        usuarioId: number
    ): Promise<RespuestaPaginadaOdontogramasDto> {
        const condicionesWhere: Prisma.OdontogramaWhereInput = {};

        // Aplicar filtros básicos
        if (filtros.estudianteId) {
            condicionesWhere.estudianteId = filtros.estudianteId;
        }

        if (filtros.docenteId) {
            condicionesWhere.docenteId = filtros.docenteId;
        }

        if (filtros.casoClinicoId) {
            condicionesWhere.casoClinicoId = filtros.casoClinicoId;
        }

        if (filtros.diente) {
            condicionesWhere.diente = filtros.diente;
        }

        // Filtros por fechas
        if (filtros.fechaInicio || filtros.fechaFin) {
            condicionesWhere.fechaCreacion = {};
            if (filtros.fechaInicio) {
                condicionesWhere.fechaCreacion.gte = new Date(filtros.fechaInicio);
            }
            if (filtros.fechaFin) {
                condicionesWhere.fechaCreacion.lte = new Date(filtros.fechaFin);
            }
        }

        // Búsqueda de texto
        if (filtros.busqueda) {
            condicionesWhere.conclusion = {
                contains: filtros.busqueda,
                mode: 'insensitive'
            };
        }

        const saltear = (filtros.page - 1) * filtros.limit;

        try {
            const [odontogramas, total] = await Promise.all([
                this.prisma.odontograma.findMany({
                    where: condicionesWhere,
                    skip: saltear,
                    take: filtros.limit,
                    orderBy: {
                        fechaCreacion: filtros.direccion || 'desc'
                    }
                }),
                this.prisma.odontograma.count({
                    where: condicionesWhere
                })
            ]);

            const totalPaginas = Math.ceil(total / filtros.limit);

            return {
                odontogramas: odontogramas.map(o => this.mapearOdontograma(o)),
                total,
                totalPaginas,
                paginaActual: filtros.page,
                elementosPorPagina: filtros.limit,
                tieneAnterior: filtros.page > 1,
                tieneSiguiente: filtros.page < totalPaginas
            };
        } catch (error) {
            throw new BadRequestException(`Error al obtener odontogramas: ${error.message}`);
        }
    }

    /**
     * Obtener odontogramas por caso clínico
     */
    async obtenerOdontogramasPorCasoClinico(casoClinicoId: number, usuarioId: number): Promise<IOdontogramaCompleto[]> {
        // Verificar que el usuario tiene acceso al caso clínico
        const casoClinico = await this.prisma.casoClinico.findUnique({
            where: { id: casoClinicoId },
            select: { 
                id: true, 
                estudianteId: true, 
                profesorId: true 
            }
        });

        if (!casoClinico) {
            throw new NotFoundException('Caso clínico no encontrado');
        }

        // Verificar permisos de acceso
        if (casoClinico.estudianteId !== usuarioId && casoClinico.profesorId !== usuarioId) {
            throw new ForbiddenException('No tiene permisos para acceder a este caso clínico');
        }

        const odontogramas = await this.prisma.odontograma.findMany({
            where: { casoClinicoId },
            include: {
                casoClinico: {
                    include: {
                        estudiante: {
                            select: { id: true, nombre: true, apellido: true, email: true }
                        },
                        especialidad: {
                            select: { id: true, nombre: true }
                        }
                    }
                },
                docente: {
                    select: { id: true, nombre: true, apellido: true, email: true }
                },
                observaciones: true
            },
            orderBy: { diente: 'asc' }
        });

        return odontogramas.map(o => this.mapearOdontogramaCompleto(o));
    }

    /**
     * Obtener un odontograma específico por ID
     */
    async obtenerOdontogramaPorId(id: number, usuarioId: number): Promise<IOdontogramaCompleto> {
        const odontograma = await this.prisma.odontograma.findUnique({
            where: { id },
            include: {
                casoClinico: {
                    include: {
                        estudiante: {
                            select: { id: true, nombre: true, apellido: true, email: true }
                        },
                        especialidad: {
                            select: { id: true, nombre: true }
                        }
                    }
                },
                docente: {
                    select: { id: true, nombre: true, apellido: true, email: true }
                },
                observaciones: true
            }
        });

        if (!odontograma) {
            throw new NotFoundException('Odontograma no encontrado');
        }

        // Validar permisos
        const tienePermiso =
            odontograma.estudianteId === usuarioId ||
            odontograma.docenteId === usuarioId;

        if (!tienePermiso) {
            throw new ForbiddenException('No tiene permisos para acceder a este odontograma');
        }

        return this.mapearOdontogramaCompleto(odontograma);
    }

    /**
     * Actualizar un odontograma existente
     */
    async actualizarOdontograma(
        id: number,
        actualizarDto: ActualizarOdontogramaBasicoDto,
        usuarioId: number
    ): Promise<IOdontograma> {
        await this.obtenerOdontogramaPorId(id, usuarioId);

        try {
            const datosActualizar: any = {};

            if (actualizarDto.conclusion) {
                datosActualizar.conclusion = actualizarDto.conclusion;
            }

            const odontogramaActualizado = await this.prisma.odontograma.update({
                where: { id },
                data: datosActualizar
            });

            return this.mapearOdontograma(odontogramaActualizado);
        } catch (error) {
            throw new BadRequestException(`Error al actualizar odontograma: ${error.message}`);
        }
    }

    /**
     * Eliminar un odontograma
     */
    async eliminarOdontograma(id: number, usuarioId: number): Promise<void> {
        const odontograma = await this.obtenerOdontogramaPorId(id, usuarioId);

        if (odontograma.estudianteId !== usuarioId) {
            throw new ForbiddenException('Solo el estudiante propietario puede eliminar el odontograma');
        }

        try {
            await this.prisma.odontograma.delete({
                where: { id }
            });
        } catch (error) {
            throw new BadRequestException(`Error al eliminar odontograma: ${error.message}`);
        }
    }

    /**
     * Obtener estadísticas básicas
     */
    async obtenerEstadisticasBasicas(usuarioId: number): Promise<any> {
        try {
            const totalOdontogramas = await this.prisma.odontograma.count({
                where: { estudianteId: usuarioId }
            });

            const odontogramasConDocente = await this.prisma.odontograma.count({
                where: {
                    estudianteId: usuarioId,
                    docenteId: { not: null }
                }
            });

            return {
                totalOdontogramas,
                odontogramasConDocente,
                porcentajeSupervision: totalOdontogramas > 0 ? (odontogramasConDocente / totalOdontogramas) * 100 : 0,
                fechaGeneracion: new Date()
            };
        } catch (error) {
            throw new BadRequestException(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    // === MÉTODOS PRIVADOS ===

    private mapearOdontograma(odontograma: any): IOdontograma {
        return {
            id: odontograma.id,
            diente: odontograma.diente,
            condicion: odontograma.condicion,
            conclusion: odontograma.conclusion,
            fechaCreacion: odontograma.fechaCreacion,
            casoClinicoId: odontograma.casoClinicoId,
            docenteId: odontograma.docenteId,
            estudianteId: odontograma.estudianteId
        };
    }

    private mapearOdontogramaCompleto(odontograma: any): IOdontogramaCompleto {
        return {
            ...this.mapearOdontograma(odontograma),
            casoClinico: odontograma.casoClinico ? {
                id: odontograma.casoClinico.id,
                estudiante: odontograma.casoClinico.estudiante,
                especialidad: odontograma.casoClinico.especialidad
            } : null,
            docente: odontograma.docente,
            observaciones: odontograma.observaciones ? odontograma.observaciones.map(obs => ({
                id: obs.id,
                contenido: obs.contenido || '',
                fechaCreacion: obs.fechaCreacion,
                docenteId: obs.docenteId,
                docente: { id: 0, nombre: '', apellido: '' },
                tipo: 'REVISION' as const,
                prioridad: 'MEDIA' as const
            })) : undefined
        };
    }
}
