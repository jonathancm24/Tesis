import { PrismaClient } from '@prisma/client';
import { datosGeograficos } from './data';

const prisma = new PrismaClient();

/**
 * Función para capitalizar nombres (ej: "CUENCA" -> "Cuenca")
 * Maneja nombres compuestos como "SAN BLAS" -> "San Blas"
 */
function capitalizarNombre(nombre: string): string {
  if (!nombre) return '';
  return nombre
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

async function main() {
  console.log('🌱 Iniciando el script de seeding...');

  const paisIdEcuador = 1; // ID de Ecuador, como se especificó.

  // Verificar que Ecuador existe
  const ecuador = await prisma.pais.findUnique({
    where: { id: paisIdEcuador },
  });

  if (!ecuador || ecuador.nombre.toUpperCase() !== 'ECUADOR') {
    console.error(`❌ Error: No se encontró el país "Ecuador" con id ${paisIdEcuador}.`);
    console.error('Asegúrate de que la base de datos contenga: INSERT INTO "Paises" (id, nombre) VALUES (1, \'Ecuador\');');
    return;
  }

  console.log(`🇪🇨 País Ecuador encontrado con ID: ${paisIdEcuador}`);

  // Usaremos mapas para cachear los IDs y evitar consultas repetidas a la BD
  const provinciasCache = new Map<string, number>();
  const cantonesCache = new Map<string, number>();

  let provinciasCreadas = 0;
  let cantonesCreados = 0;
  let parroquiasCreadas = 0;

  for (const dato of datosGeograficos) {
    const nombreProvincia = capitalizarNombre(dato.provincia);
    const nombreCanton = capitalizarNombre(dato.canton);
    const nombreParroquia = capitalizarNombre(dato.parroquia);

    // --- PROVINCIA ---
    let provinciaId = provinciasCache.get(nombreProvincia);
    if (!provinciaId) {
      const provincia = await prisma.provincia.upsert({
        where: { nombre: nombreProvincia },
        update: {},
        create: {
          nombre: nombreProvincia,
          paisId: paisIdEcuador,
        },
      });
      provinciaId = provincia.id;
      provinciasCache.set(nombreProvincia, provinciaId);
      provinciasCreadas++;
      console.log(`  -> Provincia creada o encontrada: ${nombreProvincia}`);
    }

    // --- CANTÓN ---
    const cacheKeyCanton = `${nombreCanton}-${provinciaId}`;
    let cantonId = cantonesCache.get(cacheKeyCanton);
    if (!cantonId) {
      const canton = await prisma.canton.upsert({
        where: { nombre: nombreCanton },
        update: {},
        create: {
          nombre: nombreCanton,
          provinciaId: provinciaId,
        },
      });
      cantonId = canton.id;
      cantonesCache.set(cacheKeyCanton, cantonId);
      cantonesCreados++;
      console.log(`    -> Cantón creado o encontrado: ${nombreCanton}`);
    }

    // --- PARROQUIA ---
    await prisma.parroquia.upsert({
      where: { nombre: nombreParroquia },
      update: {},
      create: {
        nombre: nombreParroquia,
        cantonId: cantonId,
      },
    });
    parroquiasCreadas++;
  }

  console.log('\n🎉 Seeding completado!');
  console.log(`  - Provincias nuevas (o verificadas): ${provinciasCreadas}`);
  console.log(`  - Cantones nuevos (o verificados): ${cantonesCreados}`);
  console.log(`  - Parroquias nuevas (o verificadas): ${parroquiasCreadas}`);
}

main()
  .catch(e => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });