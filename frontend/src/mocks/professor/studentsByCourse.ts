// src/mocks/professor/studentsByCourse.ts

/**
 * Lista de cursos disponibles en el sistema
 */
const courses: string[] = [
  'Anatomía Dental',
  'Patología Oral',
  'Radiología Odontológica',
  'Odontología Preventiva',
  'Endodoncia',
  'Periodoncia'
]

/** Retardo simulado para emular llamada a API */
function delay(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}

/**
 * Devuelve la lista de cursos.
 * @returns Promise<string[]> arreglo de nombres de cursos
 */
export async function fetchCoursesMock(): Promise<string[]> {
  await delay(150)
  // devolvemos copia para evitar mutaciones externas
  return [...courses]
}
