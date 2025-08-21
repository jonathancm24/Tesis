/**
 * Parser optimizado para preguntas clínicas con formato de texto plano
 * Interpreta configuraciones embebidas sin afectar el rendimiento
 * @author Sistema de Gestión Clínica
 * @version 2.0
 */

export interface ParsedQuestion {
  displayText: string;
  type: QuestionType;
  config: QuestionConfig;
  validation: ValidationRules;
}

export enum QuestionType {
  SI_NO = 'si_no',
  NUMERO = 'numero', 
  TEXTO = 'texto',
  TEXTO_LARGO = 'texto_largo',
  MULTIPLE = 'multiple',
  FECHA = 'fecha',
  ESCALA = 'escala'
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
  pattern?: RegExp;
}

/**
 * Parsea el texto de una pregunta en formato optimizado
 * @param rawText Texto completo de la pregunta (línea 1 + línea 2)
 * @returns Objeto ParsedQuestion con toda la configuración
 */
export function parseQuestion(rawText: string): ParsedQuestion {
  // Validar formato básico
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

  // Línea 2: Configuración (opcional)
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
  const type = parts[0].toLowerCase() as QuestionType;
  const params = parts.slice(1);
  
  const config: QuestionConfig = { requiresDetail };
  const validation: ValidationRules = { required: true };
  
  switch (type) {
    case QuestionType.SI_NO:
      return {
        displayText,
        type,
        config,
        validation
      };
      
    case QuestionType.NUMERO:
      // Ejemplo: numero|min:0|max:120|placeholder:Ingrese su edad
      params.forEach(param => {
        const [key, value] = param.split(':');
        if (key === 'min') config.min = parseInt(value);
        if (key === 'max') config.max = parseInt(value);
        if (key === 'placeholder') config.placeholder = value;
      });
      validation.pattern = /^\d+(\.\d+)?$/;
      return { displayText, type, config, validation };
      
    case QuestionType.MULTIPLE:
      // Ejemplo: multiple|Opción 1|Opción 2|Opción 3
      config.options = params;
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
      return { 
        displayText, 
        type: QuestionType.TEXTO, 
        config, 
        validation 
      };
  }
}

/**
 * Convierte una pregunta parseada de vuelta a formato de texto
 * @param question Pregunta parseada
 * @returns Texto en formato optimizado
 */
export function stringifyQuestion(question: ParsedQuestion): string {
  let configLine: string = question.type;
  
  // Agregar parámetros específicos del tipo
  switch (question.type) {
    case QuestionType.NUMERO:
      if (question.config.min !== undefined) configLine += `|min:${question.config.min}`;
      if (question.config.max !== undefined) configLine += `|max:${question.config.max}`;
      if (question.config.placeholder) configLine += `|placeholder:${question.config.placeholder}`;
      break;
      
    case QuestionType.MULTIPLE:
      if (question.config.options) {
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
    
    // Validaciones adicionales
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
    }
    
    // Validar rangos numéricos
    if (parsed.type === QuestionType.NUMERO || parsed.type === QuestionType.ESCALA) {
      const min = parsed.config.min || parsed.config.scale?.min;
      const max = parsed.config.max || parsed.config.scale?.max;
      
      if (min !== undefined && max !== undefined && min >= max) {
        throw new Error('El valor mínimo debe ser menor que el máximo');
      }
    }
    
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene ejemplos de formato para cada tipo de pregunta
 * @returns Objeto con ejemplos para la UI
 */
export function getQuestionExamples(): Record<QuestionType, string> {
  return {
    [QuestionType.SI_NO]: '¿Tiene dolor de muelas?\nsi_no*',
    [QuestionType.NUMERO]: '¿Cuál es su edad?\nnumero|min:0|max:120|placeholder:Años',
    [QuestionType.TEXTO]: '¿Cuál es su nombre completo?\ntexto',
    [QuestionType.TEXTO_LARGO]: 'Describa sus síntomas en detalle\ntexto_largo',
    [QuestionType.MULTIPLE]: 'Seleccione sus síntomas\nmultiple|Dolor|Inflamación|Sangrado|Sensibilidad',
    [QuestionType.FECHA]: '¿Cuándo comenzaron los síntomas?\nfecha',
    [QuestionType.ESCALA]: 'Califique su nivel de dolor\nescala|min:1|max:10|label_min:Sin dolor|label_max:Dolor extremo'
  };
}
