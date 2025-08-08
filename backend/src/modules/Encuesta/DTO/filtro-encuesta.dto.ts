/**
 * DTO para filtrar encuestas de tamizaje
 * Permite aplicar filtros en las consultas de encuestas
 */
export class FiltroEncuestaDto {
  /**
   * ID del paciente para filtrar encuestas específicas
   */
  pacienteId?: number;

  /**
   * Fecha de inicio para filtrar encuestas por rango de fechas
   * Formato: YYYY-MM-DD
   */
  fechaInicio?: string;

  /**
   * Fecha de fin para filtrar encuestas por rango de fechas
   * Formato: YYYY-MM-DD
   */
  fechaFin?: string;

  /**
   * Número de página para paginación
   * Por defecto: 1
   */
  pagina?: number;

  /**
   * Cantidad de elementos por página
   * Por defecto: 10
   */
  limite?: number;
}
