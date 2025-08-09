/**
 * Funciones de validación para diferentes tipos de documentos
 */

/**
 * Valida una cédula ecuatoriana usando el algoritmo del módulo 10
 */
export function validateCedula(cedula: string): boolean {
  if (!cedula || cedula.length !== 10) {
    return false
  }

  // Solo números
  if (!/^\d+$/.test(cedula)) {
    return false
  }

  // Las dos primeras cifras corresponden al código de la provincia (01-24)
  const provincia = parseInt(cedula.substring(0, 2))
  if (provincia < 1 || provincia > 24) {
    return false
  }

  // El tercer dígito debe ser menor a 6 (0-5) para personas naturales
  const tercerDigito = parseInt(cedula.charAt(2))
  if (tercerDigito >= 6) {
    return false
  }

  // Algoritmo de validación del módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0

  for (let i = 0; i < 9; i++) {
    let resultado = parseInt(cedula.charAt(i)) * coeficientes[i]
    if (resultado >= 10) {
      resultado = resultado - 9
    }
    suma += resultado
  }

  const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10)
  const ultimoDigito = parseInt(cedula.charAt(9))

  return digitoVerificador === ultimoDigito
}

/**
 * Valida un RUC ecuatoriano
 */
export function validateRUC(ruc: string): boolean {
  if (!ruc || ruc.length !== 13) {
    return false
  }

  // Solo números
  if (!/^\d+$/.test(ruc)) {
    return false
  }

  // Las dos primeras cifras corresponden al código de la provincia (01-24)
  const provincia = parseInt(ruc.substring(0, 2))
  if (provincia < 1 || provincia > 24) {
    return false
  }

  const tercerDigito = parseInt(ruc.charAt(2))

  // RUC de persona natural (tercer dígito < 6)
  if (tercerDigito < 6) {
    // Debe terminar en 001
    if (!ruc.endsWith('001')) {
      return false
    }
    // Validar los primeros 10 dígitos como cédula
    return validateCedula(ruc.substring(0, 10))
  }
  // RUC de sociedad privada (tercer dígito = 9)
  else if (tercerDigito === 9) {
    // Debe terminar en 001
    if (!ruc.endsWith('001')) {
      return false
    }
    
    // Algoritmo de validación para sociedades privadas
    const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2]
    let suma = 0

    for (let i = 0; i < 9; i++) {
      suma += parseInt(ruc.charAt(i)) * coeficientes[i]
    }

    const residuo = suma % 11
    const digitoVerificador = residuo === 0 ? 0 : 11 - residuo
    const decimoDigito = parseInt(ruc.charAt(9))

    return digitoVerificador === decimoDigito
  }
  // RUC de entidad pública (tercer dígito = 6)
  else if (tercerDigito === 6) {
    // Debe terminar en 0001
    if (!ruc.endsWith('0001')) {
      return false
    }

    // Algoritmo de validación para entidades públicas
    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2]
    let suma = 0

    for (let i = 0; i < 8; i++) {
      suma += parseInt(ruc.charAt(i)) * coeficientes[i]
    }

    const residuo = suma % 11
    const digitoVerificador = residuo === 0 ? 0 : 11 - residuo
    const novenoDigito = parseInt(ruc.charAt(8))

    return digitoVerificador === novenoDigito
  }

  return false
}

/**
 * Valida un número de pasaporte (formato general)
 */
export function validatePassport(passport: string): boolean {
  if (!passport || passport.length < 6 || passport.length > 20) {
    return false
  }

  // Puede contener letras y números
  return /^[A-Za-z0-9]+$/.test(passport)
}

/**
 * Valida un teléfono ecuatoriano
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return true // Opcional

  // Formato: 0999999999 (10 dígitos) o 999999999 (9 dígitos)
  return /^0?[0-9]{9}$/.test(phone)
}

/**
 * Valida un email
 */
export function validateEmail(email: string): boolean {
  if (!email) return true // Opcional

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida la edad mínima para ser representante legal
 */
export function validateRepresentanteAge(fechaNacimiento: string): boolean {
  if (!fechaNacimiento) return true

  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  const edad = hoy.getFullYear() - nacimiento.getFullYear()

  // Verificar si ya cumplió años este año
  const cumplioAños = hoy.getMonth() > nacimiento.getMonth() || 
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate())

  const edadFinal = cumplioAños ? edad : edad - 1

  return edadFinal >= 18 // Mayoría de edad en Ecuador
}

/**
 * Determina si un paciente necesita representante legal basado en su edad
 */
export function needsRepresentante(fechaNacimiento: string): boolean {
  if (!fechaNacimiento) return false

  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  const edad = hoy.getFullYear() - nacimiento.getFullYear()

  // Verificar si ya cumplió años este año
  const cumplioAños = hoy.getMonth() > nacimiento.getMonth() || 
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate())

  const edadFinal = cumplioAños ? edad : edad - 1

  return edadFinal < 18 // Menor de edad necesita representante
}
