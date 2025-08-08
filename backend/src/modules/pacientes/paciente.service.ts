import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistroPacienteDto, ActualizarPacienteDto } from './DTO/registro.dto';
import { 
  HistorialCompletoDto, 
  PacienteListaDto,
  PacienteBasicoDto,
  CasoClinicoDto,
  CitaDto,
  EncuestaTamizajeDto,
  TratamientoDto
} from './DTO/historial.dto';

/**
 * Servicio para la gestión de pacientes
 * Incluye CRUD básico y obtención del historial completo
 */
@Injectable()
export class PacienteService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo paciente
   */
  async crearPaciente(data: RegistroPacienteDto) {
    try {
      // Verificar que no exista un paciente con la misma cédula
      const pacienteExistente = await this.prisma.paciente.findUnique({
        where: { cedula: data.cedula }
      });

      if (pacienteExistente) {
        throw new BadRequestException('Ya existe un paciente con esta cédula');
      }

      // Verificar que la parroquia existe
      const parroquia = await this.prisma.parroquia.findUnique({
        where: { id: data.parroquiaId }
      });

      if (!parroquia) {
        throw new BadRequestException('La parroquia especificada no existe');
      }

      // Crear el paciente
      const nuevoPaciente = await this.prisma.paciente.create({
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          fechaNacimiento: new Date(data.fechaNacimiento),
          cedula: data.cedula,
          parroquiaId: data.parroquiaId,
          telefono: data.telefono,
          direccion: data.direccion,
          genero: data.genero,
          Nacionalidad: data.Nacionalidad,
          email: data.email,
          estadoCivil: data.estadoCivil,
          ocupacion: data.ocupacion,
          EmpresaLaboral: data.EmpresaLaboral,
          representante: data.representante,
          cedulaRep: data.cedulaRep,
          relacionRep: data.relacionRep,
          telefonoRep: data.telefonoRep,
          activo: true
        },
        include: {
          parroquia: {
            include: {
              canton: {
                include: {
                  provincia: {
                    include: {
                      pais: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return nuevoPaciente;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el paciente: ' + error.message);
    }
  }

  /**
   * Obtener lista de todos los pacientes con información resumida
   */
  async obtenerListaPacientes(): Promise<PacienteListaDto[]> {
    const pacientes = await this.prisma.paciente.findMany({
      where: { activo: true },
      include: {
        parroquia: {
          include: {
            canton: true
          }
        },
        casosClinicos: {
          select: { id: true, fechaCreacion: true }
        },
        citas: {
          select: { fecha: true },
          orderBy: { fecha: 'desc' },
          take: 1
        }
      },
      orderBy: { fechaRegistro: 'desc' }
    });

    return pacientes.map(paciente => ({
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      cedula: paciente.cedula,
      telefono: paciente.telefono,
      email: paciente.email,
      fechaNacimiento: paciente.fechaNacimiento,
      edad: this.calcularEdad(paciente.fechaNacimiento),
      activo: paciente.activo,
      fechaRegistro: paciente.fechaRegistro,
      totalCasosClinicos: paciente.casosClinicos.length,
      ultimaVisita: paciente.citas[0]?.fecha,
      proximaCita: undefined, // TODO: Implementar lógica para próxima cita
      parroquia: {
        nombre: paciente.parroquia.nombre,
        canton: {
          nombre: paciente.parroquia.canton.nombre
        }
      }
    }));
  }

  /**
   * Obtener el historial completo de un paciente por ID
   */
  async obtenerHistorialCompleto(pacienteId: number): Promise<HistorialCompletoDto> {
    // Verificar que el paciente existe
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
      include: {
        parroquia: {
          include: {
            canton: {
              include: {
                provincia: {
                  include: {
                    pais: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Obtener encuestas de tamizaje
    const encuestas = await this.prisma.encuestaTamizaje.findMany({
      where: { pacienteId },
      include: {
        RespuestaTamizaje: true
      },
      orderBy: { fecha: 'desc' }
    });

    // Obtener casos clínicos
    const casosClinicos = await this.prisma.casoClinico.findMany({
      where: { pacienteId },
      include: {
        estudiante: true,
        profesor: true,
        especialidad: true,
        tratamientos: true,
        observaciones: true,
        odontograma: true
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    // Obtener citas
    const citas = await this.prisma.cita.findMany({
      where: { pacienteId },
      include: {
        estudiante: true,
        docente: true,
        especialidad: true
      },
      orderBy: { fecha: 'desc' }
    });

    // Obtener tratamientos de todos los casos clínicos
    const tratamientos = await this.prisma.tratamiento.findMany({
      where: {
        casoClinico: {
          pacienteId
        }
      },
      include: {
        estudiante: true,
        docente: true
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    // Mapear datos
    const encuestasDto: EncuestaTamizajeDto[] = encuestas.map(encuesta => ({
      id: encuesta.id,
      fecha: encuesta.fecha,
      totalRespuestas: encuesta.RespuestaTamizaje.length,
      completada: encuesta.RespuestaTamizaje.length > 0
    }));

    const casoClinicosDto: CasoClinicoDto[] = casosClinicos.map(caso => ({
      id: caso.id,
      fechaCreacion: caso.fechaCreacion,
      fechaActualizacion: caso.fechaActualizacion,
      estado: caso.estado,
      motivoConsulta: caso.motivoConsulta,
      calificacion: caso.calificacion,
      estudiante: {
        id: caso.estudiante.id,
        nombre: caso.estudiante.nombre,
        apellido: caso.estudiante.apellido
      },
      profesor: {
        id: caso.profesor.id,
        nombre: caso.profesor.nombre,
        apellido: caso.profesor.apellido
      },
      especialidad: {
        id: caso.especialidad.id,
        nombre: caso.especialidad.nombre,
        descripcion: caso.especialidad.descripcion
      },
      totalTratamientos: caso.tratamientos.length,
      totalObservaciones: caso.observaciones.length,
      totalOdontogramas: caso.odontograma.length
    }));

    const citasDto: CitaDto[] = citas.map(cita => ({
      id: cita.id,
      fecha: cita.fecha,
      horainicio: cita.horainicio,
      horafin: cita.horafin,
      estado: cita.estado,
      observaciones: cita.observaciones,
      estudiante: {
        id: cita.estudiante.id,
        nombre: cita.estudiante.nombre,
        apellido: cita.estudiante.apellido
      },
      docente: cita.docente ? {
        id: cita.docente.id,
        nombre: cita.docente.nombre,
        apellido: cita.docente.apellido
      } : undefined,
      especialidad: {
        id: cita.especialidad.id,
        nombre: cita.especialidad.nombre
      }
    }));

    const tratamientosDto: TratamientoDto[] = tratamientos.map(tratamiento => ({
      id: tratamiento.id,
      descripcion: tratamiento.descripcion,
      fechaCreacion: tratamiento.fechaCreacion,
      fechaActualizacion: tratamiento.fechaActualizacion,
      estado: tratamiento.estado,
      tipoDiagnostico: tratamiento.tipoDiagnostico,
      cie10Codigo: tratamiento.cie10Codigo,
      procedimientoCodigo: tratamiento.procedimientoCodigo,
      estudiante: {
        id: tratamiento.estudiante.id,
        nombre: tratamiento.estudiante.nombre,
        apellido: tratamiento.estudiante.apellido
      },
      docente: tratamiento.docente ? {
        id: tratamiento.docente.id,
        nombre: tratamiento.docente.nombre,
        apellido: tratamiento.docente.apellido
      } : undefined
    }));

    // Crear resumen estadístico
    const casosActivos = casosClinicos.filter(caso => 
      ['EN_REVISION', 'APROBADO', 'EN_TRATAMIENTO'].includes(caso.estado)
    ).length;
    
    const casosFinalizados = casosClinicos.filter(caso => 
      caso.estado === 'FINALIZADO'
    ).length;

    const citasPendientes = citas.filter(cita => 
      ['RESERVADA'].includes(cita.estado)
    ).length;

    const encuestasCompletas = encuestas.filter(encuesta => 
      encuesta.RespuestaTamizaje.length > 0
    ).length;

    return {
      paciente: {
        id: paciente.id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        fechaNacimiento: paciente.fechaNacimiento,
        telefono: paciente.telefono,
        direccion: paciente.direccion,
        genero: paciente.genero,
        Nacionalidad: paciente.Nacionalidad,
        cedula: paciente.cedula,
        email: paciente.email,
        estadoCivil: paciente.estadoCivil,
        ocupacion: paciente.ocupacion,
        EmpresaLaboral: paciente.EmpresaLaboral,
        activo: paciente.activo,
        fechaRegistro: paciente.fechaRegistro,
        representante: paciente.representante,
        cedulaRep: paciente.cedulaRep,
        relacionRep: paciente.relacionRep,
        telefonoRep: paciente.telefonoRep,
        parroquia: paciente.parroquia
      },
      encuestasTamizaje: encuestasDto,
      casosClinicos: casoClinicosDto,
      citas: citasDto,
      tratamientos: tratamientosDto,
      resumen: {
        totalCasosClinicos: casosClinicos.length,
        casosActivos,
        casosFinalizados,
        totalCitas: citas.length,
        citasPendientes,
        totalEncuestas: encuestas.length,
        encuestasCompletas,
        ultimaVisita: citas[0]?.fecha,
        proximaCita: citas.find(cita => cita.estado === 'RESERVADA' && cita.fecha > new Date())?.fecha
      }
    };
  }

  /**
   * Actualizar datos de un paciente
   */
  async actualizarPaciente(pacienteId: number, data: ActualizarPacienteDto) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return await this.prisma.paciente.update({
      where: { id: pacienteId },
      data,
      include: {
        parroquia: {
          include: {
            canton: {
              include: {
                provincia: {
                  include: {
                    pais: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Desactivar un paciente (borrado suave)
   */
  async desactivarPaciente(pacienteId: number) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return await this.prisma.paciente.update({
      where: { id: pacienteId },
      data: { activo: false }
    });
  }

  /**
   * Buscar pacientes por nombre, apellido o cédula
   */
  async buscarPacientes(termino: string): Promise<PacienteListaDto[]> {
    const pacientes = await this.prisma.paciente.findMany({
      where: {
        AND: [
          { activo: true },
          {
            OR: [
              { nombre: { contains: termino, mode: 'insensitive' } },
              { apellido: { contains: termino, mode: 'insensitive' } },
              { cedula: { contains: termino } }
            ]
          }
        ]
      },
      include: {
        parroquia: {
          include: {
            canton: true
          }
        },
        casosClinicos: {
          select: { id: true }
        },
        citas: {
          select: { fecha: true },
          orderBy: { fecha: 'desc' },
          take: 1
        }
      },
      orderBy: { fechaRegistro: 'desc' }
    });

    return pacientes.map(paciente => ({
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      cedula: paciente.cedula,
      telefono: paciente.telefono,
      email: paciente.email,
      fechaNacimiento: paciente.fechaNacimiento,
      edad: this.calcularEdad(paciente.fechaNacimiento),
      activo: paciente.activo,
      fechaRegistro: paciente.fechaRegistro,
      totalCasosClinicos: paciente.casosClinicos.length,
      ultimaVisita: paciente.citas[0]?.fecha,
      proximaCita: undefined,
      parroquia: {
        nombre: paciente.parroquia.nombre,
        canton: {
          nombre: paciente.parroquia.canton.nombre
        }
      }
    }));
  }

  /**
   * Calcular la edad basada en la fecha de nacimiento
   */
  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }
}
