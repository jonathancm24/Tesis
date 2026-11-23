import { INestApplication, Injectable } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { PassportModule, PassportStrategy } from '@nestjs/passport'
import { Test } from '@nestjs/testing'
import { ExtractJwt, Strategy } from 'passport-jwt'
import * as request from 'supertest'
import { CitasController } from '../src/modules/Citas/citas.controller'
import { CitasService } from '../src/modules/Citas/citas.service'
import { OdontogramaController } from '../src/modules/Odontograma/odontograma.controller'
import { OdontogramaService } from '../src/modules/Odontograma/odontograma.service'
import { RolesGuard } from '../src/guards/roles.guard'
import { RoleEnum } from '../src/common/enums/roles.enum'

const secret = 'jwt-clinicos-http-pruebas'

@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }

  validate(payload: { sub: number; role: RoleEnum }) {
    return { id: payload.sub, role: { nombre: payload.role } }
  }
}

describe('HTTP de citas y odontograma', () => {
  let app: INestApplication
  let jwt: JwtService
  const citas = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 5 }),
    create: jest.fn().mockResolvedValue({ id: 5 }),
    update: jest.fn().mockResolvedValue({ id: 5 }),
    cancelar: jest.fn().mockResolvedValue({ id: 5 }),
  }
  const odontograma = {
    findByCaso: jest.fn().mockResolvedValue({ casoClinicoId: 7, registros: [] }),
    save: jest.fn().mockResolvedValue({ casoClinicoId: 7, registros: [] }),
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret })],
      controllers: [CitasController, OdontogramaController],
      providers: [
        RolesGuard,
        TestJwtStrategy,
        { provide: CitasService, useValue: citas },
        { provide: OdontogramaService, useValue: odontograma },
      ],
    }).compile()

    app = module.createNestApplication()
    jwt = module.get(JwtService)
    await app.init()
  })

  afterAll(async () => app.close())

  const token = (role: RoleEnum, id: number) =>
    jwt.sign({ sub: id, role })

  it('devuelve 401 sin JWT', async () => {
    await request(app.getHttpServer()).get('/citas').expect(401)
    await request(app.getHttpServer()).get('/odontograma/caso/7').expect(401)
  })

  it.each([
    [RoleEnum.ADMIN, 1],
    [RoleEnum.PROFESOR, 21],
    [RoleEnum.ESTUDIANTE, 11],
  ])('permite consultar recursos al rol %s', async (role, id) => {
    await request(app.getHttpServer())
      .get('/citas')
      .set('Authorization', `Bearer ${token(role, id)}`)
      .expect(200)
  })

  it('rechaza al secretario en citas y odontograma', async () => {
    await request(app.getHttpServer())
      .get('/citas')
      .set('Authorization', `Bearer ${token(RoleEnum.SECRETARIO, 31)}`)
      .expect(403)
    await request(app.getHttpServer())
      .post('/odontograma')
      .set('Authorization', `Bearer ${token(RoleEnum.SECRETARIO, 31)}`)
      .send({ casoClinicoId: 7, estudianteId: 11, dientes: [] })
      .expect(403)
  })
})
