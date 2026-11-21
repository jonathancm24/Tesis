import { INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as request from 'supertest';
import { UsuariosController } from '../src/modules/usuarios/usuarios.controller';
import { UsuariosService } from '../src/modules/usuarios/usuarios.service';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { RolesGuard } from '../src/guards/roles.guard';
import { RoleEnum } from '../src/common/enums/roles.enum';

const TEST_SECRET = 'usuarios-access-test-secret';

@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: TEST_SECRET,
    });
  }

  validate(payload: { sub: number; role: string }) {
    return { id: payload.sub, role: { nombre: payload.role } };
  }
}

describe('UsuariosController access (e2e, isolated)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const service = {
    create: jest.fn().mockResolvedValue({ id: 5 }),
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findOne: jest.fn().mockResolvedValue({ id: 5 }),
    update: jest.fn().mockResolvedValue({ id: 5 }),
    changePassword: jest.fn().mockResolvedValue({ message: 'ok' }),
    toggleActive: jest.fn().mockResolvedValue({ id: 5 }),
    remove: jest.fn().mockResolvedValue({ message: 'ok' }),
    generateImportTemplate: jest.fn().mockResolvedValue(Buffer.from('template')),
    importFromExcel: jest.fn().mockResolvedValue({ creados: 1, actualizados: 0, detalles: [] }),
    exportToExcel: jest.fn().mockResolvedValue(Buffer.from('export')),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: TEST_SECRET })],
      controllers: [UsuariosController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        TestJwtStrategy,
        { provide: UsuariosService, useValue: service },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  afterAll(async () => app.close());

  const tokenFor = (role: RoleEnum) => jwt.sign({ sub: 10, role });

  it('returns 401 without a token', async () => {
    await request(app.getHttpServer()).get('/usuarios').expect(401);
  });

  it('allows an administrator to list, consult, create, edit, activate, deactivate, and delete users', async () => {
    const authorization = `Bearer ${tokenFor(RoleEnum.ADMIN)}`;
    await request(app.getHttpServer()).get('/usuarios').set('Authorization', authorization).expect(200);
    await request(app.getHttpServer()).get('/usuarios/5').set('Authorization', authorization).expect(200);
    await request(app.getHttpServer())
      .post('/usuarios')
      .set('Authorization', authorization)
      .send({ roleId: 1 })
      .expect(201);
    await request(app.getHttpServer())
      .patch('/usuarios/5')
      .set('Authorization', authorization)
      .send({ roleId: 2 })
      .expect(200);
    await request(app.getHttpServer())
      .patch('/usuarios/5/activate')
      .set('Authorization', authorization)
      .expect(200);
    await request(app.getHttpServer())
      .patch('/usuarios/5/deactivate')
      .set('Authorization', authorization)
      .expect(200);
    await request(app.getHttpServer())
      .delete('/usuarios/5')
      .set('Authorization', authorization)
      .expect(200);
  });

  it('allows a professor to consult the student list', async () => {
    await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${tokenFor(RoleEnum.PROFESOR)}`)
      .expect(200);
  });

  it('allows a professor to register a student through the protected endpoint', async () => {
    await request(app.getHttpServer())
      .post('/usuarios')
      .set('Authorization', `Bearer ${tokenFor(RoleEnum.PROFESOR)}`)
      .send({ roleId: 3 })
      .expect(201);
  });

  it.each([RoleEnum.ESTUDIANTE, RoleEnum.SECRETARIO])(
    'returns 403 when %s tries to list users',
    async (role) => {
      await request(app.getHttpServer())
        .get('/usuarios')
        .set('Authorization', `Bearer ${tokenFor(role)}`)
        .expect(403);
    },
  );

  it('returns 403 when a professor tries to deactivate a user', async () => {
    await request(app.getHttpServer())
      .patch('/usuarios/5/deactivate')
      .set('Authorization', `Bearer ${tokenFor(RoleEnum.PROFESOR)}`)
      .expect(403);
  });
});
