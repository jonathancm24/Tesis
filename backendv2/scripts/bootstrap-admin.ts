import 'dotenv/config';
import { PrismaClient, TipoDocumento } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RoleEnum } from '../src/common/enums/roles.enum';

const prisma = new PrismaClient();

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable requerida ${name}`);
  return value;
}

async function main() {
  const email = requiredEnv('BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
  const password = requiredEnv('BOOTSTRAP_ADMIN_PASSWORD');
  const nombre = requiredEnv('BOOTSTRAP_ADMIN_NOMBRE');
  const apellido = requiredEnv('BOOTSTRAP_ADMIN_APELLIDO');
  const fechaNacimiento = requiredEnv('BOOTSTRAP_ADMIN_FECHA_NACIMIENTO');
  const tipoDocumento = requiredEnv('BOOTSTRAP_ADMIN_TIPO_DOCUMENTO');
  const numeroDocumento = requiredEnv('BOOTSTRAP_ADMIN_NUMERO_DOCUMENTO');

  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('El correo no tiene un formato válido');
  if (!Object.values(TipoDocumento).includes(tipoDocumento as TipoDocumento)) {
    throw new Error(`Tipo de documento inválido: ${tipoDocumento}`);
  }
  const birthDate = new Date(fechaNacimiento);
  if (Number.isNaN(birthDate.getTime())) {
    throw new Error('La fecha de nacimiento debe ser una fecha válida');
  }

  const adminRole = await prisma.role.findUnique({
    where: { nombre: RoleEnum.ADMIN },
    select: { id: true },
  });
  if (!adminRole) {
    throw new Error('No existe el rol Administrador. Inicie el backend para inicializar roles y permisos.');
  }

  const existingAdmin = await prisma.usuario.count({ where: { roleId: adminRole.id } });
  if (existingAdmin > 0) {
    throw new Error('Ya existe un administrador; el bootstrap de primer administrador está deshabilitado.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.usuario.create({
    data: {
      nombre,
      apellido,
      email,
      password: hashedPassword,
      fechaNacimiento: birthDate,
      tipoDocumento: tipoDocumento as TipoDocumento,
      numeroDocumento,
      roleId: adminRole.id,
      activo: true,
    },
  });

  console.log('Administrador inicial creado. Ya puede iniciar sesión y administrar usuarios.');
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'No se pudo crear el administrador inicial.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
