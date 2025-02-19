import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import RedisMock from 'ioredis-mock';
import { BullModule } from '@nestjs/bullmq';
import {
  Appointment,
  AppointmentSchema,
} from '../src/appointments/entities/appointment.entity';
import {
  Patient,
  PatientSchema,
} from '../src/patients/entities/patient.entity';
import { AppService } from '../src/app.service';
import { AppController } from '../src/app.controller';
import { AppointmentsModule } from '../src/appointments/appointments.module';
import { PatientsModule } from '../src/patients/patients.module';
import { MOCK_PATIENTS } from '../src/patients/mocks/patients.mock';
import { MOCK_APPOINTMENTS } from '../src/appointments/mocks/appointments.mock';
import { AppointmentsService } from '../src/appointments/appointments.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let appointmentsService: AppointmentsService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({ instance: { port: 27018 } });
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: Appointment.name, schema: AppointmentSchema },
          { name: Patient.name, schema: PatientSchema },
        ]),
        BullModule.forRoot({ connection: new RedisMock() }),
        BullModule.registerQueue({ name: 'appointments' }),
        PatientsModule,
        AppointmentsModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    appointmentsService =
      moduleFixture.get<AppointmentsService>(AppointmentsService);
    await app.init();
  });

  afterAll(async () => {
    await mongoServer.stop({ doCleanup: true });
    await app.close();
  });

  beforeEach(async () => {
    if (mongoServer.state !== 'running') await mongoServer.start(true);
    await request(app.getHttpServer()).post('/patients').send(MOCK_PATIENTS[0]);
    await appointmentsService.createMany([MOCK_APPOINTMENTS[0]]);
  });

  afterEach(async () => await mongoServer.stop({ doCleanup: true }));

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Welcome to the Fabric Backend Challenge!');
  });

  describe('/patients', () => {
    it('/patients (POST)', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send(MOCK_PATIENTS[1])
        .expect(201)
        .expect({
          id: MOCK_PATIENTS[1].id,
          name: MOCK_PATIENTS[1].name,
          age: MOCK_PATIENTS[1].age,
          gender: MOCK_PATIENTS[1].gender,
          contact: MOCK_PATIENTS[1].contact,
        });
    });

    it('/patients (GET)', () => {
      return request(app.getHttpServer())
        .get('/patients')
        .expect(200)
        .expect([
          {
            id: MOCK_PATIENTS[0].id,
            name: MOCK_PATIENTS[0].name,
            age: MOCK_PATIENTS[0].age,
            gender: MOCK_PATIENTS[0].gender,
            contact: MOCK_PATIENTS[0].contact,
          },
        ]);
    });

    it('/patients/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/patients/${MOCK_PATIENTS[0].id}`)
        .expect(200)
        .expect({
          id: MOCK_PATIENTS[0].id,
          name: MOCK_PATIENTS[0].name,
          age: MOCK_PATIENTS[0].age,
          gender: MOCK_PATIENTS[0].gender,
          contact: MOCK_PATIENTS[0].contact,
        });
    });

    it('/patients/:id (GET) - 404: fails when patient is not found', () => {
      return request(app.getHttpServer())
        .get(`/patients/21`)
        .expect(404)
        .expect({
          message: 'No patient found',
          error: 'Not Found',
          statusCode: 404,
        });
    });
  });

  describe('/appointments', () => {
    it('/appointments (GET)', () => {
      return request(app.getHttpServer())
        .get('/appointments')
        .expect(200)
        .expect([
          {
            id: MOCK_APPOINTMENTS[0].id,
            doctor: MOCK_APPOINTMENTS[0].doctor,
            patient_id: MOCK_APPOINTMENTS[0].patient_id,
            reason: MOCK_APPOINTMENTS[0].reason,
            appointment_date: MOCK_APPOINTMENTS[0].appointment_date,
          },
        ]);
    });

    it('/appointments (GET) - with patient_id', () => {
      return request(app.getHttpServer())
        .get(`/appointments?patient_id=${MOCK_APPOINTMENTS[0].patient_id}`)
        .expect(200)
        .expect([
          {
            id: MOCK_APPOINTMENTS[0].id,
            doctor: MOCK_APPOINTMENTS[0].doctor,
            patient_id: MOCK_APPOINTMENTS[0].patient_id,
            reason: MOCK_APPOINTMENTS[0].reason,
            appointment_date: MOCK_APPOINTMENTS[0].appointment_date,
          },
        ]);
    });

    it('/appointments (GET) - with doctor', () => {
      return request(app.getHttpServer())
        .get(`/appointments?doctor=${MOCK_APPOINTMENTS[0].doctor}`)
        .expect(200)
        .expect([
          {
            id: MOCK_APPOINTMENTS[0].id,
            doctor: MOCK_APPOINTMENTS[0].doctor,
            patient_id: MOCK_APPOINTMENTS[0].patient_id,
            reason: MOCK_APPOINTMENTS[0].reason,
            appointment_date: MOCK_APPOINTMENTS[0].appointment_date,
          },
        ]);
    });

    it('/appointments/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/appointments/${MOCK_APPOINTMENTS[0].id}`)
        .expect(200)
        .expect({
          id: MOCK_APPOINTMENTS[0].id,
          doctor: MOCK_APPOINTMENTS[0].doctor,
          patient_id: MOCK_APPOINTMENTS[0].patient_id,
          reason: MOCK_APPOINTMENTS[0].reason,
          appointment_date: MOCK_APPOINTMENTS[0].appointment_date,
        });
    });

    it('/appointments/:id (GET) - 404: fails when appointment is not found', () => {
      return request(app.getHttpServer())
        .get(`/appointments/21`)
        .expect(404)
        .expect({
          message: 'No appointment found',
          error: 'Not Found',
          statusCode: 404,
        });
    });
  });
});
