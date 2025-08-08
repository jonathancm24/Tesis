import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Poblando base de datos con información geográfica...');

  try {
    // 1. Crear o verificar País Ecuador
    let ecuador = await prisma.pais.findUnique({
      where: { nombre: 'Ecuador' }
    });

    if (!ecuador) {
      ecuador = await prisma.pais.create({
        data: {
          nombre: 'Ecuador'
        }
      });
      console.log('✅ País Ecuador creado');
    } else {
      console.log('ℹ️ País Ecuador ya existe');
    }

    // 2. Crear o verificar Provincia Manabí
    let manabi = await prisma.provincia.findUnique({
      where: { nombre: 'Manabí' }
    });

    if (!manabi) {
      manabi = await prisma.provincia.create({
        data: {
          nombre: 'Manabí',
          paisId: ecuador.id
        }
      });
      console.log('✅ Provincia Manabí creada');
    } else {
      console.log('ℹ️ Provincia Manabí ya existe');
    }

    // 3. Crear o verificar Cantón Manta
    let manta = await prisma.canton.findUnique({
      where: { nombre: 'Manta' }
    });

    if (!manta) {
      manta = await prisma.canton.create({
        data: {
          nombre: 'Manta',
          provinciaId: manabi.id
        }
      });
      console.log('✅ Cantón Manta creado');
    } else {
      console.log('ℹ️ Cantón Manta ya existe');
    }

    // 4. Crear o verificar Parroquia Manta
    let parroquiaManta = await prisma.parroquia.findUnique({
      where: { nombre: 'Manta' }
    });

    if (!parroquiaManta) {
      parroquiaManta = await prisma.parroquia.create({
        data: {
          nombre: 'Manta',
          cantonId: manta.id
        }
      });
      console.log('✅ Parroquia Manta creada');
    } else {
      console.log('ℹ️ Parroquia Manta ya existe');
    }

    // Crear parroquias adicionales de Manta (parroquias urbanas y rurales)
    const parroquiasAdicionales = [
      'Los Esteros',
      'Manta (Cabecera Cantonal)',
      'San Mateo',
      'Tarqui'
    ];

    for (const nombreParroquia of parroquiasAdicionales) {
      const parroquiaExistente = await prisma.parroquia.findUnique({
        where: { nombre: nombreParroquia }
      });

      if (!parroquiaExistente) {
        await prisma.parroquia.create({
          data: {
            nombre: nombreParroquia,
            cantonId: manta.id
          }
        });
        console.log(`✅ Parroquia ${nombreParroquia} creada`);
      } else {
        console.log(`ℹ️ Parroquia ${nombreParroquia} ya existe`);
      }
    }

    console.log('\n🎉 Información geográfica poblada exitosamente!');
    console.log('📍 Estructura creada:');
    console.log('   🌍 País: Ecuador');
    console.log('   🏞️ Provincia: Manabí');
    console.log('   🏙️ Cantón: Manta');
    console.log('   📍 Parroquias: Manta, Los Esteros, Manta (Cabecera Cantonal), San Mateo, Tarqui');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada exitosamente');
  })
  .catch(async (e) => {
    console.error('❌ Error fatal:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
