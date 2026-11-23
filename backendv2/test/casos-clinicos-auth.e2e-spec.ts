import { INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as request from 'supertest';
import { CasosClinicosController } from '../src/modules/CasosClinicos/casos-clinicos.controller';
import { CasosClinicosService } from '../src/modules/CasosClinicos/casos-clinicos.service';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { RolesGuard } from '../src/guards/roles.guard';
import { RoleEnum } from '../src/common/enums/roles.enum';

const TEST_SECRET = 'casos-clinicos-access-test-secret';

@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: TEST_SECRET,
    });
  }

  validate(payload: { sub: number; role: RoleEnum }) {
    return { id: payload.sub, role: { nombre: payload.role } };
  }
}

describe('CasosClinicosController auth (isolated e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const service = {
    create: jest.fn().mockResolvedValue({ id: 7 }),
    findByProfesor: jest.fn().mockResolvedValue([]),
    findByEstudiante: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 7 }),
    findAll: jest.fn().mockResolvedValue([]),
    updateEstado: jest.fn().mockResolvedValue({ id: 7 }),
    createObservacion: jest.fn().mockResolvedValue({ id: 9 }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: TEST_SECRET })],
      controllers: [CasosClinicosController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        TestJwtStrategy,
        { provide: CasosClinicosService, useValue: service },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  afterAll(async () => app.close());

  const tokenFor = (role: RoleEnum, id = 11) => jwt.sign({ sub: id, role });

  it('returns 401 for requests without a token', async () => {
    await request(app.getHttpServer()).get('/casos-clinicos').expect(401);
    await request(app.getHttpServer()).post('/casos-clinicos').send({}).expect(401);
  });

  it('allows a student to create a case and consult student cases', async () => {
    const authorization = `Bearer ${tokenFor(RoleEnum.ESTUDIANTE)}`;
    await request(app.getHttpServer())
      .post('/casos-clinicos')
      .set('Authorization', authorization)
      .send({ estudianteId: 999 })
      .expect(201);
    await request(app.getHttpServer())
      .get('/casos-clinicos/estudiante/11')
      .set('Authorization', authorization)
      .expect(200);
  });

  it('allows a professor to list assigned cases and review them', async () => {
    const authorization = `Bearer ${tokenFor(RoleEnum.PROFESOR, 21)}`;
    await request(app.getHttpServer())
      .get('/casos-clinicos/profesor/21')
      .set('Authorization', authorization)
      .expect(200);
    await request(app.getHttpServer())
      .patch('/casos-clinicos/7/estado')
      .set('Authorization', authorization)
      .send({ estado: 'APROBADO' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/casos-clinicos/observaciones')
      .set('Authorization', authorization)
      .send({ casoClinicoId: 7, docenteId: 999, contenido: 'Observación' })
      .expect(201);
  });

  it('keeps administrative case access for administrators', async () => {
    await request(app.getHttpServer())
      .get('/casos-clinicos')
      .set('Authorization', `Bearer ${tokenFor(RoleEnum.ADMIN, 1)}`)
      .expect(200);
    await request(app.getHttpServer())
      .patch('/casos-clinicos/7/estado')
      .set('Authorization', `Bearer ${tokenFor(RoleEnum.ADMIN, 1)}`)
      .send({ estado: 'APROBADO' })
      .expect(200);
  });

  it('does not grant the secretary access to status updates', async () => {
    await request(app.getHttpServer())
      .patch('/casos-clinicos/7/estado')
      .set('Authorization', `Bearer ${tokenFor(RoleEnum.SECRETARIO)}`)
      .send({ estado: 'APROBADO' })
      .expect(403);
  });

  it('returns 403 for the secretary role', async () => {
    await request(app.getHttpServer())
      .get('/casos-clinicos')
      .set('Authorization', `Bearer ${tokenFor(RoleEnum.SECRETARIO)}`)
      .expect(403);
  });
});
