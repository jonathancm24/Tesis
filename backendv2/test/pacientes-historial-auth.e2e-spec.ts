import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { RoleEnum } from '../src/common/enums/roles.enum';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { RolesGuard } from '../src/guards/roles.guard';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { PacientesController } from '../src/modules/Pacientes/pacientes.controller';
import { PacientesService } from '../src/modules/Pacientes/pacientes.service';

describe('GET /pacientes/:id/historial-completo (HTTP aislado)', () => {
  const secret = 'jwt-solo-pruebas-de-historial';
  let app: INestApplication;
  let jwt: JwtService;
  const fecha = new Date('2025-01-01T00:00:00Z');
  const crearCaso = (id: number, profesorId: number, estudianteId: number) => ({
    id, profesorId, estudianteId,
    observaciones: [{ descripcion: `observacion-${id}` }],
    odontograma: [{ diente: '16', conclusion: `odontograma-${id}` }],
    tratamientos: [{ descripcion: `tratamiento-${id}` }],
    prescripciones: [{ medicamento: `prescripcion-${id}` }],
  });
  const casos = [
    crearCaso(101, 21, 11),
    crearCaso(102, 21, 12),
    crearCaso(103, 22, 11),
    crearCaso(104, 22, 12),
  ];

  const findUnique = jest.fn(({ where, include }: {
    where: { id: number };
    include: {
      casosClinicos: { where?: { profesorId?: number; estudianteId?: number } };
      EncuestaTamizaje: false | object;
    };
  }) => {
    if (where.id !== 7 && where.id !== 8) return null;
    const filtro = include.casosClinicos.where;
    const visibles = where.id === 8 ? [] : casos.filter((caso) =>
      (filtro?.profesorId === undefined || filtro.profesorId === caso.profesorId) &&
      (filtro?.estudianteId === undefined || filtro.estudianteId === caso.estudianteId),
    );
    return {
      id: where.id, nombre: 'Paciente ficticio', fechaNacimiento: fecha, casosClinicos: visibles,
      ...(include.EncuestaTamizaje && {
        EncuestaTamizaje: where.id === 8 ? [] : [{ id: 501, pacienteId: where.id, fecha }],
      }),
    };
  });
  const respuestas = jest.fn().mockResolvedValue([{ respuesta: 'tamizaje-clinico-privado' }]);
  const preguntas = jest.fn().mockResolvedValue([{ id: 1, soloMujer: false }]);
  const identidades = new Map<number, RoleEnum>([
    [1, RoleEnum.ADMIN],
    [21, RoleEnum.PROFESOR],
    [23, RoleEnum.PROFESOR],
    [11, RoleEnum.ESTUDIANTE],
    [13, RoleEnum.ESTUDIANTE],
    [31, RoleEnum.SECRETARIO],
  ]);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret })],
      controllers: [PacientesController],
      providers: [
        PacientesService, JwtAuthGuard, RolesGuard, JwtStrategy,
        { provide: ConfigService, useValue: { get: () => secret } },
        {
          provide: AuthService,
          useValue: {
            obtenerUsuarioCompleto: (email: string) => {
              const id = Number(email.split('@')[0]);
              const rol = identidades.get(id);
              return rol ? { id, activo: true, role: { nombre: rol } } : null;
            },
          },
        },
        {
          provide: PrismaService,
          useValue: {
            paciente: { findUnique },
            preguntaTamizaje: { findMany: preguntas },
            respuestaTamizaje: { findMany: respuestas },
          },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    jwt = module.get(JwtService);
    await app.init();
  });

  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => app.close());

  function historial(pacienteId: number, actorId?: number) {
    const peticion = request(app.getHttpServer()).get(`/pacientes/${pacienteId}/historial-completo`);
    return actorId === undefined ? peticion : peticion.set('Authorization', `Bearer ${jwt.sign({
      email: `${actorId}@example.invalid`,
      sub: 999,
      role: RoleEnum.ADMIN,
    })}`);
  }

  it('permite al administrador ver todos los casos y el tamizaje', async () => {
    const { body } = await historial(7, 1).expect(200);
    expect(body.casosClinicos).toEqual(casos);
    expect(body.resumen.totalCasosClinicos).toBe(4);
    expect(body.resumen.totalEncuestas).toBe(1);
    expect(body.encuestas[0].respuestas).toEqual([{ respuesta: 'tamizaje-clinico-privado' }]);
  });

  it.each([
    [21, 'profesorId', [101, 102]],
    [11, 'estudianteId', [101, 103]],
  ] as const)('limita casos y datos agregados al actor %i', async (actor, campo, ids) => {
    const { body } = await historial(7, actor).expect(200);
    const autorizados = casos.filter((caso) => ids.some((id) => id === caso.id));
    expect(body.casosClinicos).toEqual(autorizados);
    expect(body.paciente).not.toHaveProperty('casosClinicos');
    expect(body.paciente).not.toHaveProperty('EncuestaTamizaje');
    expect(body.resumen).toEqual({
      totalCasosClinicos: 2,
      totalObservaciones: 2,
      totalTratamientos: 2,
      totalPrescripciones: 2,
      totalEncuestas: 0,
    });
    expect(body.encuestas).toEqual([]);
    expect(body).not.toHaveProperty('notaVersionado');
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        casosClinicos: expect.objectContaining({ where: { [campo]: actor } }),
        EncuestaTamizaje: false,
      }),
    }));
    expect(respuestas).not.toHaveBeenCalled();
    expect(preguntas).not.toHaveBeenCalled();
  });

  it.each([23, 13])('deniega al profesor o estudiante ajeno %i', async (actor) => {
    const { body } = await historial(7, actor).expect(403);
    expect(body).not.toHaveProperty('casosClinicos');
    expect(body).not.toHaveProperty('paciente');
    expect(respuestas).not.toHaveBeenCalled();
  });

  it('devuelve 401 sin JWT, antes de consultar el paciente', async () => {
    await historial(7).expect(401);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('deniega al secretario aunque el JWT declare otro rol', async () => {
    await historial(7, 31).expect(403);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('devuelve un historial vacío al administrador si el paciente no tiene casos', async () => {
    const { body } = await historial(8, 1).expect(200);
    expect(body.casosClinicos).toEqual([]);
    expect(body.encuestas).toEqual([]);
    expect(Object.values(body.resumen)).toEqual([0, 0, 0, 0, 0]);
    await historial(8, 21).expect(403);
    await historial(8, 11).expect(403);
  });

  it('devuelve 404 si el paciente no existe', async () => {
    await historial(999, 1).expect(404);
  });
});
