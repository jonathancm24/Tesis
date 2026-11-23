import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordDemo = process.env.DEMO_PASSWORD
  if (!passwordDemo || passwordDemo.length < 8) {
    throw new Error('Configure DEMO_PASSWORD con al menos 8 caracteres')
  }

  const password = await bcrypt.hash(passwordDemo, 12)

  for (const rol of ['Administrador', 'Profesor', 'Estudiante']) {
    await prisma.role.upsert({
      where: { nombre: rol },
      update: {},
      create: { nombre: rol },
    })
  }

  const [adminRole, profesorRole, estudianteRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { nombre: 'Administrador' } }),
    prisma.role.findUniqueOrThrow({ where: { nombre: 'Profesor' } }),
    prisma.role.findUniqueOrThrow({ where: { nombre: 'Estudiante' } }),
  ])

  await prisma.usuario.upsert({
    where: { email: 'demo.admin@odontologia.local' },
    update: { activo: true },
    create: {
      nombre: 'Admin',
      apellido: 'Demo',
      email: 'demo.admin@odontologia.local',
      fechaNacimiento: new Date('1990-01-01'),
      password,
      tipoDocumento: 'CEDULA',
      numeroDocumento: '9000000001',
      roleId: adminRole.id,
      activo: true,
    },
  })

  await prisma.usuario.upsert({
    where: { email: 'demo.profesor@odontologia.local' },
    update: { activo: true },
    create: {
      nombre: 'Profesor',
      apellido: 'Demo',
      email: 'demo.profesor@odontologia.local',
      fechaNacimiento: new Date('1985-01-01'),
      password,
      tipoDocumento: 'CEDULA',
      numeroDocumento: '9000000002',
      roleId: profesorRole.id,
      activo: true,
    },
  })

  await prisma.usuario.upsert({
    where: { email: 'demo.estudiante@odontologia.local' },
    update: { activo: true },
    create: {
      nombre: 'Estudiante',
      apellido: 'Demo',
      email: 'demo.estudiante@odontologia.local',
      fechaNacimiento: new Date('2002-01-01'),
      password,
      tipoDocumento: 'CEDULA',
      numeroDocumento: '9000000003',
      roleId: estudianteRole.id,
      activo: true,
    },
  })

  console.log('Datos demo creados o actualizados.')
  console.log('Admin: demo.admin@odontologia.local')
  console.log('Profesor: demo.profesor@odontologia.local')
  console.log('Estudiante: demo.estudiante@odontologia.local')
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'No se pudo preparar datos demo')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
