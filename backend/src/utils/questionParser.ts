/**
 * Parser optimizado para preguntas clínicas con formato de texto plano
 * Versión backend para Node.js/NestJS
 * @author Sistema de Gestión Clínica
 * @version 2.0
 */

export enum QuestionType {
  SI_NO = 'SI_NO',
  NUMERO = 'NUMERO', 
  TEXTO = 'TEXTO',
  TEXTO_LARGO = 'TEXTO_LARGO',
  MULTIPLE = 'MULTIPLE',
  FECHA = 'FECHA',
  ESCALA = 'ESCALA'
}

export interface ParsedQuestion {
  displayText: string;
  type: QuestionType;
  config: QuestionConfig;
  validation: ValidationRules;
}

export interface QuestionConfig {
  requiresDetail?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  scale?: { min: number; max: number; labels?: string[] };
  placeholder?: string;
  multiline?: boolean;
}

export interface ValidationRules {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

/**
 * Parsea el texto de una pregunta en formato optimizado
 * @param rawText Texto completo de la pregunta (línea 1 + línea 2)
 * @returns Objeto ParsedQuestion con toda la configuración
 */
export function parseQuestion(rawText: string): ParsedQuestion {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Texto de pregunta inválido');
  }

  const lines = rawText.trim().split('\n');
  
  if (lines.length < 1) {
    throw new Error('La pregunta debe tener al menos una línea');
  }

  // Línea 1: Texto a mostrar
  const displayText = lines[0].trim();
  
  if (!displayText) {
    throw new Error('El texto de la pregunta no puede estar vacío');
  }

  // Línea 2: Configuración (opcional, por defecto es texto)
  const configLine = lines[1]?.trim() || 'texto';
  
  return parseConfigLine(displayText, configLine);
}

/**
 * Parsea la línea de configuración
 * @param displayText Texto a mostrar
 * @param configLine Línea de configuración
 * @returns ParsedQuestion completo
 */
function parseConfigLine(displayText: string, configLine: string): ParsedQuestion {
  // Detectar modificadores especiales
  const requiresDetail = configLine.includes('*');
  const cleanConfig = configLine.replace('*', '');
  
  // Separar tipo y parámetros
  const parts = cleanConfig.split('|');
  const typeString = parts[0].toLowerCase();
  const params = parts.slice(1);
  
  // Convertir string a enum
  let type: QuestionType;
  switch (typeString) {
    case 'si_no':
      type = QuestionType.SI_NO;
      break;
    case 'numero':
      type = QuestionType.NUMERO;
      break;
    case 'texto_largo':
      type = QuestionType.TEXTO_LARGO;
      break;
    case 'multiple':
      type = QuestionType.MULTIPLE;
      break;
    case 'fecha':
      type = QuestionType.FECHA;
      break;
    case 'escala':
      type = QuestionType.ESCALA;
      break;
    default:
      type = QuestionType.TEXTO;
  }
  
  const config: QuestionConfig = { requiresDetail };
  const validation: ValidationRules = { required: true };
  
  switch (type) {
    case QuestionType.SI_NO:
      return { displayText, type, config, validation };
      
    case QuestionType.NUMERO:
      // Ejemplo: numero|min:0|max:120|placeholder:Ingrese su edad
      params.forEach(param => {
        const [key, value] = param.split(':');
        if (key === 'min') config.min = parseInt(value);
        if (key === 'max') config.max = parseInt(value);
        if (key === 'placeholder') config.placeholder = value;
      });
      validation.pattern = '^\\d+(\\.\\d+)?$';
      return { displayText, type, config, validation };
      
    case QuestionType.MULTIPLE:
      // Ejemplo: multiple|Opción 1|Opción 2|Opción 3
      config.options = params.filter(param => param.trim().length > 0);
      return { displayText, type, config, validation };
      
    case QuestionType.ESCALA:
      // Ejemplo: escala|min:1|max:10|label_min:Muy malo|label_max:Excelente
      const scale = { min: 1, max: 5, labels: [] as string[] };
      params.forEach(param => {
        const [key, value] = param.split(':');
        if (key === 'min') scale.min = parseInt(value);
        if (key === 'max') scale.max = parseInt(value);
        if (key === 'label_min') scale.labels[0] = value;
        if (key === 'label_max') scale.labels[1] = value;
      });
      config.scale = scale;
      return { displayText, type, config, validation };
      
    case QuestionType.TEXTO_LARGO:
      config.multiline = true;
      validation.maxLength = 1000;
      return { displayText, type, config, validation };
      
    case QuestionType.FECHA:
      return { displayText, type, config, validation };
      
    default: // TEXTO por defecto
      validation.maxLength = 255;
      return { displayText, type, config, validation };
  }
}

/**
 * Convierte una pregunta parseada de vuelta a formato de texto
 * @param question Pregunta parseada
 * @returns Texto en formato optimizado
 */
export function stringifyQuestion(question: ParsedQuestion): string {
  let configLine: string = question.type.toLowerCase();
  
  // Agregar parámetros específicos del tipo
  switch (question.type) {
    case QuestionType.NUMERO:
      if (question.config.min !== undefined) configLine += `|min:${question.config.min}`;
      if (question.config.max !== undefined) configLine += `|max:${question.config.max}`;
      if (question.config.placeholder) configLine += `|placeholder:${question.config.placeholder}`;
      break;
      
    case QuestionType.MULTIPLE:
      if (question.config.options && question.config.options.length > 0) {
        configLine += '|' + question.config.options.join('|');
      }
      break;
      
    case QuestionType.ESCALA:
      if (question.config.scale) {
        const s = question.config.scale;
        configLine += `|min:${s.min}|max:${s.max}`;
        if (s.labels?.[0]) configLine += `|label_min:${s.labels[0]}`;
        if (s.labels?.[1]) configLine += `|label_max:${s.labels[1]}`;
      }
      break;
  }
  
  // Agregar modificador de detalle requerido
  if (question.config.requiresDetail) {
    configLine += '*';
  }
  
  return `${question.displayText}\n${configLine}`;
}

/**
 * Valida el formato de una pregunta antes de guardar
 * @param rawText Texto de la pregunta
 * @returns true si es válido, lanza error si no
 */
export function validateQuestionFormat(rawText: string): boolean {
  try {
    const parsed = parseQuestion(rawText);
    
    // Validaciones básicas
    if (parsed.displayText.length < 5) {
      throw new Error('La pregunta debe tener al menos 5 caracteres');
    }
    
    if (parsed.displayText.length > 500) {
      throw new Error('La pregunta no puede exceder 500 caracteres');
    }
    
    // Validar opciones múltiples
    if (parsed.type === QuestionType.MULTIPLE) {
      if (!parsed.config.options || parsed.config.options.length < 2) {
        throw new Error('Las preguntas de opción múltiple deben tener al menos 2 opciones');
      }
      
      if (parsed.config.options.length > 10) {
        throw new Error('Las preguntas de opción múltiple no pueden tener más de 10 opciones');
      }
      
      // Validar que no haya opciones duplicadas
      const uniqueOptions = new Set(parsed.config.options.map(o => o.toLowerCase().trim()));
      if (uniqueOptions.size !== parsed.config.options.length) {
        throw new Error('No puede haber opciones duplicadas');
      }
    }
    
    // Validar rangos numéricos
    if (parsed.type === QuestionType.NUMERO || parsed.type === QuestionType.ESCALA) {
      const min = parsed.config.min || parsed.config.scale?.min;
      const max = parsed.config.max || parsed.config.scale?.max;
      
      if (min !== undefined && max !== undefined && min >= max) {
        throw new Error('El valor mínimo debe ser menor que el máximo');
      }
      
      if (parsed.type === QuestionType.ESCALA) {
        const scaleMin = parsed.config.scale?.min || 1;
        const scaleMax = parsed.config.scale?.max || 5;
        
        if (scaleMin < 1 || scaleMax > 10) {
          throw new Error('La escala debe estar entre 1 y 10');
        }
        
        if ((scaleMax - scaleMin + 1) > 10) {
          throw new Error('La escala no puede tener más de 10 opciones');
        }
      }
    }
    
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Convierte el enum TipoPregunta de Prisma al nuevo QuestionType
 * @param tipoOriginal Tipo original de Prisma
 * @returns QuestionType equivalente
 */
export function convertirTipoOriginal(tipoOriginal: string): QuestionType {
  switch (tipoOriginal) {
    case 'VERDADERO_FALSO':
      return QuestionType.SI_NO;
    case 'OPCION_MULTIPLE':
      return QuestionType.MULTIPLE;
    case 'NUMERO':
      return QuestionType.NUMERO;
    case 'FECHA':
      return QuestionType.FECHA;
    case 'TEXTO_LARGO':
      return QuestionType.TEXTO_LARGO;
    case 'TEXTO':
    default:
      return QuestionType.TEXTO;
  }
}

/**
 * Detecta si una pregunta usa el formato nuevo o el antiguo
 * @param texto Texto de la pregunta
 * @returns true si usa el formato nuevo
 */
export function esFormatoNuevo(texto: string): boolean {
  if (!texto) return false;
  
  // El formato nuevo siempre tiene al menos una línea de separación
  const lines = texto.split('\n');
  
  if (lines.length < 2) return false;
  
  // La segunda línea debe contener uno de los tipos válidos
  const configLine = lines[1].trim().toLowerCase();
  const tiposValidos = ['si_no', 'numero', 'texto', 'texto_largo', 'multiple', 'fecha', 'escala'];
  
  return tiposValidos.some(tipo => configLine.startsWith(tipo));
}

/**
 * Migra una pregunta del formato antiguo al nuevo
 * @param textoOriginal Texto original
 * @param tipoOriginal Tipo original de Prisma
 * @param obligatoria Si es obligatoria
 * @returns Texto en formato nuevo
 */
export function migrarFormatoAntiguo(
  textoOriginal: string, 
  tipoOriginal: string, 
  obligatoria: boolean = false
): string {
  const displayText = textoOriginal.trim();
  const newType = convertirTipoOriginal(tipoOriginal);
  
  let configLine = newType.toLowerCase();
  
  // Agregar configuraciones por defecto para algunos tipos
  if (newType === QuestionType.NUMERO) {
    configLine += '|min:0|max:999';
  } else if (newType === QuestionType.ESCALA) {
    configLine += '|min:1|max:5|label_min:Muy bajo|label_max:Muy alto';
  }
  
  return `${displayText}\n${configLine}`;
}

/**
 * Obtiene información resumida de una pregunta parseada para logs y debugging
 * @param question Pregunta parseada
 * @returns String con información resumida
 */
export function getQuestionSummary(question: ParsedQuestion): string {
  let summary = `Tipo: ${question.type}, Texto: "${question.displayText.substring(0, 50)}${question.displayText.length > 50 ? '...' : ''}"`;
  
  if (question.config.requiresDetail) summary += ', RequiereDetalle: Sí';
  if (question.config.options) summary += `, Opciones: ${question.config.options.length}`;
  if (question.config.min !== undefined || question.config.max !== undefined) {
    summary += `, Rango: ${question.config.min || 'sin mín'}-${question.config.max || 'sin máx'}`;
  }
  
  return summary;
}
