import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding de datos de prueba...')

  // Limpiar datos existentes si es necesario (opcional)
  // await prisma.preguntaClinica.deleteMany()
  // await prisma.usuario.deleteMany()
  // await prisma.especialidad.deleteMany()

  try {
    // 1. Crear especialidades
    console.log('📋 Creando especialidades...')
    const especialidades = await Promise.all([
      prisma.especialidad.upsert({
        where: { nombre: 'Cirugía Oral' },
        update: {},
        create: {
          nombre: 'Cirugía Oral',
          descripcion: 'Especialidad enfocada en procedimientos quirúrgicos bucales y maxilofaciales'
        }
      }),
      prisma.especialidad.upsert({
        where: { nombre: 'Endodoncia' },
        update: {},
        create: {
          nombre: 'Endodoncia',
          descripcion: 'Tratamiento de conductos radiculares y patologías pulpares'
        }
      }),
      prisma.especialidad.upsert({
        where: { nombre: 'Ortodoncia' },
        update: {},
        create: {
          nombre: 'Ortodoncia',
          descripcion: 'Corrección de malposiciones dentarias y maloclusiones'
        }
      }),
      prisma.especialidad.upsert({
        where: { nombre: 'Periodoncia' },
        update: {},
        create: {
          nombre: 'Periodoncia',
          descripcion: 'Tratamiento de enfermedades de las encías y tejidos de soporte'
        }
      }),
      prisma.especialidad.upsert({
        where: { nombre: 'Odontopediatría' },
        update: {},
        create: {
          nombre: 'Odontopediatría',
          descripcion: 'Atención odontológica especializada en niños y adolescentes'
        }
      })
    ])
    console.log(`✅ ${especialidades.length} especialidades creadas`)

    // 2. Crear roles si no existen
    console.log('👥 Verificando roles...')
    const roles = await Promise.all([
      prisma.role.upsert({
        where: { nombre: 'admin' },
        update: {},
        create: {
          nombre: 'admin',
          description: 'Administrador del sistema'
        }
      }),
      prisma.role.upsert({
        where: { nombre: 'profesor' },
        update: {},
        create: {
          nombre: 'profesor',
          description: 'Profesor de la facultad'
        }
      }),
      prisma.role.upsert({
        where: { nombre: 'estudiante' },
        update: {},
        create: {
          nombre: 'estudiante',
          description: 'Estudiante de odontología'
        }
      }),
      prisma.role.upsert({
        where: { nombre: 'secretario' },
        update: {},
        create: {
          nombre: 'secretario',
          description: 'Secretario de la facultad'
        }
      })
    ])
    console.log(`✅ ${roles.length} roles verificados`)

    // 3. Crear usuarios de prueba
    console.log('👤 Creando usuarios de prueba...')
    const hashedPassword = await bcrypt.hash('123456', 10)

    // Admin
    const admin = await prisma.usuario.upsert({
      where: { numeroDocumento: '1234567890' },
      update: {},
      create: {
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@odonto.edu',
        password: hashedPassword,
        numeroDocumento: '1234567890',
        telefono: '0999999999',
        activo: true,
        fechaNacimiento: new Date('1980-01-01'),
        tipoDocumento: 'CEDULA',
        roleId: roles.find(r => r.nombre === 'admin')!.id
      }
    })

    // Profesores
    const profesor1 = await prisma.usuario.upsert({
      where: { numeroDocumento: '1234567891' },
      update: {},
      create: {
        nombre: 'Dr. Carlos',
        apellido: 'Mendoza',
        email: 'prof.cirugia@odonto.edu',
        password: hashedPassword,
        numeroDocumento: '1234567891',
        telefono: '0988888888',
        activo: true,
        fechaNacimiento: new Date('1975-05-15'),
        tipoDocumento: 'CEDULA',
        roleId: roles.find(r => r.nombre === 'profesor')!.id
      }
    })

    const profesor2 = await prisma.usuario.upsert({
      where: { numeroDocumento: '1234567892' },
      update: {},
      create: {
        nombre: 'Dra. María',
        apellido: 'González',
        email: 'prof.endodoncia@odonto.edu',
        password: hashedPassword,
        numeroDocumento: '1234567892',
        telefono: '0977777777',
        activo: true,
        fechaNacimiento: new Date('1978-03-20'),
        tipoDocumento: 'CEDULA',
        roleId: roles.find(r => r.nombre === 'profesor')!.id
      }
    })

    // Estudiante
    const estudiante = await prisma.usuario.upsert({
      where: { numeroDocumento: '1234567893' },
      update: {},
      create: {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'estudiante@odonto.edu',
        password: hashedPassword,
        numeroDocumento: '1234567893',
        telefono: '0966666666',
        activo: true,
        fechaNacimiento: new Date('2000-01-01'),
        tipoDocumento: 'CEDULA',
        roleId: roles.find(r => r.nombre === 'estudiante')!.id
      }
    })

    console.log('✅ Usuarios de prueba creados')

    // 4. Asignar especialidades a profesores
    console.log('🔗 Asignando especialidades a profesores...')
    
    // Profesor 1: Cirugía Oral
    try {
      await prisma.usuarioEspecialidad.create({
        data: {
          usuarioId: profesor1.id,
          especialidadId: especialidades.find(e => e.nombre === 'Cirugía Oral')!.id
        }
      })
    } catch (error) {
      console.log('Relación Profesor 1 - Cirugía Oral ya existe')
    }

    // Profesor 2: Endodoncia y Periodoncia
    try {
      await prisma.usuarioEspecialidad.create({
        data: {
          usuarioId: profesor2.id,
          especialidadId: especialidades.find(e => e.nombre === 'Endodoncia')!.id
        }
      })
    } catch (error) {
      console.log('Relación Profesor 2 - Endodoncia ya existe')
    }

    try {
      await prisma.usuarioEspecialidad.create({
        data: {
          usuarioId: profesor2.id,
          especialidadId: especialidades.find(e => e.nombre === 'Periodoncia')!.id
        }
      })
    } catch (error) {
      console.log('Relación Profesor 2 - Periodoncia ya existe')
    }

    console.log('✅ Especialidades asignadas a profesores')

    // 5. Crear preguntas de ejemplo usando el nuevo formato
    console.log('❓ Creando preguntas de ejemplo con formato optimizado...')
    
    const preguntasCirugia = [
      {
        texto: '¿Presenta dolor postoperatorio?\nsi_no*',
        tipo: 'OPCION_MULTIPLE' as const,
        obligatoria: true,
        especialidadId: especialidades.find(e => e.nombre === 'Cirugía Oral')!.id
      },
      {
        texto: '¿Qué edad tiene el paciente?\nnumero|min:0|max:120',
        tipo: 'NUMERICO' as const,
        obligatoria: true,
        especialidadId: especialidades.find(e => e.nombre === 'Cirugía Oral')!.id
      },
      {
        texto: '¿Ha tomado antibióticos previamente?\nsi_no',
        tipo: 'SI_NO' as const,
        obligatoria: false,
        especialidadId: especialidades.find(e => e.nombre === 'Cirugía Oral')!.id
      },
      {
        texto: 'Describa los síntomas principales\ntexto|min:10|max:500',
        tipo: 'TEXTO' as const,
        obligatoria: true,
        especialidadId: especialidades.find(e => e.nombre === 'Cirugía Oral')!.id
      }
    ]

    const preguntasEndodoncia = [
      {
        texto: '¿Siente dolor al contacto con frío?\nsi_no*',
        tipo: 'SI_NO' as const,
        obligatoria: true,
        especialidadId: especialidades.find(e => e.nombre === 'Endodoncia')!.id
      },
      {
        texto: '¿Cuándo comenzó el dolor?\nfecha|formato:dd/mm/yyyy',
        tipo: 'FECHA' as const,
        obligatoria: true,
        especialidadId: especialidades.find(e => e.nombre === 'Endodoncia')!.id
      },
      {
        texto: 'Intensidad del dolor (1-10)\nnumero|min:1|max:10',
        tipo: 'NUMERICO' as const,
        obligatoria: true,
        especialidadId: especialidades.find(e => e.nombre === 'Endodoncia')!.id
      },
      {
        texto: 'Observaciones adicionales del endodoncista\ntexto|opcional',
        tipo: 'TEXTO' as const,
        obligatoria: false,
        especialidadId: especialidades.find(e => e.nombre === 'Endodoncia')!.id
      }
    ]

    const preguntasPerio = [
      {
        texto: '¿Presenta sangrado de encías?\nsi_no*',
        tipo: 'SI_NO' as const,
        obligatoria: true,
        especialidadId: especialidades.find(e => e.nombre === 'Periodoncia')!.id
      },
      {
        texto: 'Profundidad de sondaje promedio\nnumero|min:0|max:15|decimales:1',
        tipo: 'NUMERICO' as const,
        obligatoria: true,
        especialidadId: especialidades.find(e => e.nombre === 'Periodoncia')!.id
      }
    ]

    // Crear todas las preguntas
    const todasLasPreguntas = [...preguntasCirugia, ...preguntasEndodoncia, ...preguntasPerio]
    
    for (const pregunta of todasLasPreguntas) {
      try {
        await prisma.preguntaClinica.create({
          data: pregunta
        })
      } catch (error) {
        console.log(`Pregunta ya existe: ${pregunta.texto.split('\n')[0]}`)
      }
    }

    console.log(`✅ ${todasLasPreguntas.length} preguntas de ejemplo creadas`)

    console.log('\n🎉 ¡Seeding completado exitosamente!')
    console.log('\n📊 Resumen de datos creados:')
    console.log(`   • ${especialidades.length} especialidades`)
    console.log(`   • ${roles.length} roles`)
    console.log(`   • 4 usuarios (admin, 2 profesores, 1 estudiante)`)
    console.log(`   • ${todasLasPreguntas.length} preguntas con formato optimizado`)
    console.log('\n🔑 Credenciales de acceso:')
    console.log('   • Admin: admin@odonto.edu / 123456')
    console.log('   • Profesor Cirugía: prof.cirugia@odonto.edu / 123456')
    console.log('   • Profesor Endodoncia: prof.endodoncia@odonto.edu / 123456')
    console.log('   • Estudiante: estudiante@odonto.edu / 123456')

  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
