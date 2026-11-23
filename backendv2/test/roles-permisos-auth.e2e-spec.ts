import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PermisoEnum } from '../src/common/enums/permisos.enum';
import { RoleEnum } from '../src/common/enums/roles.enum';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { PermisosController } from '../src/modules/permisos/permisos.controller';
import { PermisosService } from '../src/modules/permisos/permisos.service';
import { RolesController } from '../src/modules/roles/roles.controller';
import { RolesService } from '../src/modules/roles/roles.service';

const secret = 'jwt-exclusivo-de-pruebas-de-roles';
const ver = PermisoEnum.VER_ROLES;
const gestionar = PermisoEnum.GESTIONAR_ROLES;

describe('Autorización HTTP de roles y permisos (servicios simulados)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const rolesService = {
    findAll: jest.fn().mockResolvedValue([]),
    obtenerTodos: jest.fn().mockResolvedValue([]),
    obtenerRolPorId: jest.fn().mockResolvedValue({ id: 1 }),
    crearRol: jest.fn().mockResolvedValue({ id: 2 }),
    asignarPermisos: jest.fn().mockResolvedValue({ id: 1 }),
    actualizarRol: jest.fn().mockResolvedValue({ id: 1 }),
    eliminarRol: jest.fn().mockResolvedValue({ id: 1, eliminado: true }),
  };
  const permisosService = {
    obtenerTodosLosPermisos: jest.fn().mockResolvedValue([]),
    obtenerPermisosOrganizados: jest.fn().mockResolvedValue({}),
    obtenerModulosDePermisos: jest.fn().mockResolvedValue([]),
  };
  const concesion = (nombre: PermisoEnum) => ({ permiso: { nombre } });
  const actor = (nombre: RoleEnum, permisos: PermisoEnum[] = [], individuales: PermisoEnum[] = []) => ({
    activo: true,
    role: { nombre, permisos: permisos.map(concesion) },
    permisosIndividuales: individuales.map((permiso) => ({ activo: true, ...concesion(permiso) })),
  });
  const cuentas = {
    lector: actor(RoleEnum.ADMIN, [ver]),
    gestor: actor(RoleEnum.ADMIN, [gestionar]),
    sinPermiso: actor(RoleEnum.ADMIN),
    profesor: actor(RoleEnum.PROFESOR, [ver, gestionar]),
    estudiante: actor(RoleEnum.ESTUDIANTE, [], [ver, gestionar]),
  };
  const buscarIdentidad = jest.fn((email: string) => cuentas[email as keyof typeof cuentas] ?? null);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret })],
      controllers: [RolesController, PermisosController],
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: () => secret } },
        { provide: AuthService, useValue: { obtenerUsuarioCompleto: buscarIdentidad } },
        { provide: RolesService, useValue: rolesService },
        { provide: PermisosService, useValue: permisosService },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, forbidNonWhitelisted: true, transform: true,
    }));
    jwt = module.get(JwtService);
    await app.init();
  });

  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => app?.close());

  // El rol de la petición debe provenir de la cuenta cargada y no del claim firmado.
  const token = (email: keyof typeof cuentas) => jwt.sign({ email, role: RoleEnum.ADMIN });

  const rutas = [
    { metodo: 'get', url: '/roles/todos', servicio: 'findAll', permitido: 'lector', denegado: 'gestor', status: 200, args: [] },
    { metodo: 'get', url: '/roles/todos/con-permisos', servicio: 'obtenerTodos', permitido: 'lector', denegado: 'gestor', status: 200, args: [] },
    { metodo: 'get', url: '/roles/1', servicio: 'obtenerRolPorId', permitido: 'lector', denegado: 'gestor', status: 200, args: [1] },
    { metodo: 'post', url: '/roles', servicio: 'crearRol', permitido: 'gestor', denegado: 'lector', status: 201, args: [{ nombre: 'Rol ficticio' }] },
    { metodo: 'put', url: '/roles/1/permisos', servicio: 'asignarPermisos', permitido: 'gestor', denegado: 'lector', status: 200, args: [1, { permisos: [2] }] },
    { metodo: 'put', url: '/roles/1', servicio: 'actualizarRol', permitido: 'gestor', denegado: 'lector', status: 200, args: [1, { descripcion: 'Descripción ficticia' }] },
    { metodo: 'delete', url: '/roles/1', servicio: 'eliminarRol', permitido: 'gestor', denegado: 'lector', status: 200, args: [1] },
  ] as const;

  describe.each(rutas)('$metodo $url', (ruta) => {
    function peticion(bearer?: string) {
      const consulta = request(app.getHttpServer())[ruta.metodo](ruta.url);
      if (bearer) consulta.set('Authorization', `Bearer ${bearer}`);
      const cuerpo = ruta.args.at(-1);
      if (typeof cuerpo === 'object') consulta.send(cuerpo);
      return consulta;
    }

    it('devuelve 401 sin JWT o con JWT malformado o con firma inválida', async () => {
      await peticion().expect(401);
      await peticion('malformado').expect(401);
      await peticion(jwt.sign({ email: ruta.permitido }, { secret: 'otra-firma' })).expect(401);
      expect(buscarIdentidad).not.toHaveBeenCalled();
      for (const metodo of Object.values(rolesService)) expect(metodo).not.toHaveBeenCalled();
    });

    it('devuelve 403 si el administrador no tiene el permiso correcto', async () => {
      await peticion(token('sinPermiso')).expect(403);
      await peticion(token(ruta.denegado)).expect(403);
      for (const metodo of Object.values(rolesService)) expect(metodo).not.toHaveBeenCalled();
    });

    it('devuelve 403 al profesor y al estudiante aun con los permisos', async () => {
      await peticion(token('profesor')).expect(403);
      await peticion(token('estudiante')).expect(403);
      for (const metodo of Object.values(rolesService)) expect(metodo).not.toHaveBeenCalled();
    });

    it('invoca el servicio con el administrador y el permiso correspondiente', async () => {
      await peticion(token(ruta.permitido)).expect(ruta.status);
      const metodo = rolesService[ruta.servicio];
      expect(metodo).toHaveBeenCalledTimes(1);
      expect(metodo).toHaveBeenCalledWith(...ruta.args);
    });
  });

  it.each([
    ['/permisos', 'obtenerTodosLosPermisos'],
    ['/permisos/organizados', 'obtenerPermisosOrganizados'],
    ['/permisos/modulos', 'obtenerModulosDePermisos'],
  ] as const)('conserva el contrato de autorización de %s', async (url, metodo) => {
    const get = () => request(app.getHttpServer()).get(url);
    await get().expect(401);
    await get().set('Authorization', `Bearer ${token('gestor')}`).expect(403);
    for (const servicio of Object.values(permisosService)) expect(servicio).not.toHaveBeenCalled();
    await get().set('Authorization', `Bearer ${token('profesor')}`).expect(200);
    expect(permisosService[metodo]).toHaveBeenCalledTimes(1);
  });
});
