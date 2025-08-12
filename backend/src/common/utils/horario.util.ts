/**
 * Utilidades comunes para manejo de horarios
 * 
 * Funciones compartidas para validación, conversión y manipulación
 * de horarios utilizadas en múltiples módulos del sistema.
 * 
 * @fileoverview Utilidades de horarios compartidas
 * @module HorarioUtil
 */

import { BadRequestException } from '@nestjs/common';
import { DiaSemana } from '@prisma/client';

/**
 * Clase con métodos estáticos para operaciones con horarios
 */
export class HorarioUtil {
  
  /**
   * Convertir hora en formato HH:MM a minutos desde medianoche
   * 
   * @param hora - Hora en formato HH:MM
   * @returns number - Minutos desde medianoche
   * 
   * @example
   * HorarioUtil.convertirHoraAMinutos('09:30') // Returns 570
   */
  static convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  /**
   * Convertir minutos a formato HH:MM
   * 
   * @param minutos - Minutos desde medianoche
   * @returns string - Hora en formato HH:MM
   */
  static convertirMinutosAHora(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Validar formato de hora HH:MM
   * 
   * @param hora - Hora a validar
   * @throws {BadRequestException} - Si el formato es inválido
   */
  static validarFormatoHora(hora: string): void {
    const formatoHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!formatoHora.test(hora)) {
      throw new BadRequestException(`Formato de hora inválido: ${hora} (debe ser HH:MM)`);
    }
  }

  /**
   * Validar rango de horarios
   * 
   * @param horaInicio - Hora de inicio
   * @param horaFin - Hora de fin
   * @param duracionMinima - Duración mínima en minutos (default: 15)
   * @param duracionMaxima - Duración máxima en minutos (default: 720)
   * @throws {BadRequestException} - Si el rango es inválido
   */
  static validarRangoHorarios(
    horaInicio: string,
    horaFin: string,
    duracionMinima: number = 15,
    duracionMaxima: number = 720
  ): void {
    this.validarFormatoHora(horaInicio);
    this.validarFormatoHora(horaFin);

    const minutosInicio = this.convertirHoraAMinutos(horaInicio);
    const minutosFin = this.convertirHoraAMinutos(horaFin);

    if (minutosInicio >= minutosFin) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
    }

    const duracion = minutosFin - minutosInicio;
    
    if (duracion < duracionMinima) {
      throw new BadRequestException(`La duración mínima debe ser de ${duracionMinima} minutos`);
    }

    if (duracion > duracionMaxima) {
      throw new BadRequestException(`La duración máxima debe ser de ${Math.floor(duracionMaxima / 60)} horas`);
    }
  }

  /**
   * Verificar si dos rangos horarios se solapan
   * 
   * @param inicio1 - Hora inicio del primer rango
   * @param fin1 - Hora fin del primer rango
   * @param inicio2 - Hora inicio del segundo rango
   * @param fin2 - Hora fin del segundo rango
   * @returns boolean - True si hay solapamiento
   */
  static verificarSolapamientoHorarios(
    inicio1: string,
    fin1: string,
    inicio2: string,
    fin2: string
  ): boolean {
    const minutos1Inicio = this.convertirHoraAMinutos(inicio1);
    const minutos1Fin = this.convertirHoraAMinutos(fin1);
    const minutos2Inicio = this.convertirHoraAMinutos(inicio2);
    const minutos2Fin = this.convertirHoraAMinutos(fin2);

    return minutos1Inicio < minutos2Fin && minutos1Fin > minutos2Inicio;
  }

  /**
   * Crear fecha y hora completa
   * 
   * @param fecha - Fecha en formato YYYY-MM-DD
   * @param hora - Hora en formato HH:MM
   * @returns Date - Fecha completa
   */
  static crearFechaHora(fecha: string, hora: string): Date {
    return new Date(`${fecha}T${hora}:00.000Z`);
  }

  /**
   * Extraer hora de un objeto Date
   * 
   * @param fecha - Objeto Date
   * @returns string - Hora en formato HH:MM
   */
  static extraerHora(fecha: Date): string {
    return fecha.toTimeString().slice(0, 5);
  }

  /**
   * Obtener día de la semana en español desde una fecha
   * 
   * @param fecha - Fecha a procesar
   * @returns DiaSemana - Día correspondiente
   */
  static obtenerDiaSemana(fecha: Date): DiaSemana {
    const dias = [
      DiaSemana.DOMINGO,
      DiaSemana.LUNES,
      DiaSemana.MARTES,
      DiaSemana.MIERCOLES,
      DiaSemana.JUEVES,
      DiaSemana.VIERNES,
      DiaSemana.SABADO
    ];
    return dias[fecha.getDay()];
  }

  /**
   * Generar slots de tiempo en un rango horario
   * 
   * @param horaInicio - Hora de inicio
   * @param horaFin - Hora de fin
   * @param duracionSlot - Duración de cada slot en minutos (default: 30)
   * @returns string[] - Array de horarios de inicio de cada slot
   */
  static generarSlotsHorarios(
    horaInicio: string,
    horaFin: string,
    duracionSlot: number = 30
  ): string[] {
    const slots: string[] = [];
    const minutosInicio = this.convertirHoraAMinutos(horaInicio);
    const minutosFin = this.convertirHoraAMinutos(horaFin);

    for (let minutos = minutosInicio; minutos < minutosFin; minutos += duracionSlot) {
      slots.push(this.convertirMinutosAHora(minutos));
    }

    return slots;
  }

  /**
   * Validar que una fecha no sea pasada
   * 
   * @param fecha - Fecha a validar
   * @throws {BadRequestException} - Si la fecha es pasada
   */
  static validarFechaFutura(fecha: string): void {
    const fechaObj = new Date(fecha);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    if (fechaObj < fechaActual) {
      throw new BadRequestException('No se pueden crear citas para fechas pasadas');
    }
  }

  /**
   * Calcular diferencia en minutos entre dos horas
   * 
   * @param horaInicio - Hora de inicio
   * @param horaFin - Hora de fin
   * @returns number - Diferencia en minutos
   */
  static calcularDuracionEnMinutos(horaInicio: string, horaFin: string): number {
    return this.convertirHoraAMinutos(horaFin) - this.convertirHoraAMinutos(horaInicio);
  }
}
