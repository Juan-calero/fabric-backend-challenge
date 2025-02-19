import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getModelToken } from '@nestjs/mongoose';
import { Appointment } from './entities/appointment.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MOCK_APPOINTMENTS } from './mocks/appointments.mock';

class MockedAppointmentModel {
  constructor(private _: any) {}
  save = jest.fn().mockResolvedValue(MOCK_APPOINTMENTS[0]);
  static find = jest.fn().mockReturnThis();
  static create = jest.fn().mockReturnValue(MOCK_APPOINTMENTS);
  static exec = jest.fn().mockReturnValue(MOCK_APPOINTMENTS);
  static bulkWrite = jest.fn().mockResolvedValue({ upsertedCount: 32 });
  static select = jest.fn().mockReturnThis();
  static findOne = jest.fn().mockReturnThis();
}

const MockedAppointmentsQueue = { add: jest.fn(() => ({ id: 'mockJobId' })) };

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getModelToken(Appointment.name),
          useValue: MockedAppointmentModel,
        },
        {
          provide: 'BullQueue_appointments',
          useValue: MockedAppointmentsQueue,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  afterEach(jest.clearAllMocks);

  describe('enqueueAppointments', () => {
    const mockCreateAppointmentDto = { filepath: 'mockFilepath' };

    it('returns correct data when job is successfully initiated', async () => {
      const result = await service.enqueueAppointments(
        mockCreateAppointmentDto,
      );
      expect(result).toStrictEqual({
        message: 'Appointment file added to the queue',
      });
    });

    it('throws InternalServerErrorException when job failed to be initiated', () => {
      MockedAppointmentsQueue.add.mockReturnValueOnce({ id: null });
      expect(
        service.enqueueAppointments(mockCreateAppointmentDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to add the appointment to the queue',
        ),
      );
    });

    it.each`
      callback                   | mockCallback                   | expectedResult
      ${'appointmentsQueue.add'} | ${MockedAppointmentsQueue.add} | ${['process-appointments-file', mockCreateAppointmentDto, { attempts: 3 }]}
    `(
      "calls AppointmentModel's $callback method with the correct arguments",
      async ({ mockCallback, expectedResult }) => {
        await service.enqueueAppointments(mockCreateAppointmentDto);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(...expectedResult);
      },
    );
  });

  describe('createMany', () => {
    it('returns correct data', async () => {
      MockedAppointmentModel.bulkWrite.mockResolvedValueOnce({
        upsertedCount: 32,
      });
      expect(await service.createMany(MOCK_APPOINTMENTS)).toStrictEqual({
        message: `32 appointments created out of ${MOCK_APPOINTMENTS.length}`,
      });
    });

    it.each`
      callback       | mockCallback                        | expectedResult
      ${'bulkWrite'} | ${MockedAppointmentModel.bulkWrite} | ${[{ updateOne: { filter: { doctor: MOCK_APPOINTMENTS[0].doctor, patient_id: MOCK_APPOINTMENTS[0].patient_id, appointment_date: MOCK_APPOINTMENTS[0].appointment_date }, update: { $setOnInsert: MOCK_APPOINTMENTS[0] }, upsert: true } }, { updateOne: { filter: { doctor: MOCK_APPOINTMENTS[1].doctor, patient_id: MOCK_APPOINTMENTS[1].patient_id, appointment_date: MOCK_APPOINTMENTS[1].appointment_date }, update: { $setOnInsert: MOCK_APPOINTMENTS[1] }, upsert: true } }]}
    `(
      "calls AppointmentModel's $callback method with the correct arguments",
      async ({ mockCallback, expectedResult }) => {
        MockedAppointmentModel.bulkWrite.mockResolvedValueOnce({
          upsertedCount: 32,
        });
        await service.createMany(MOCK_APPOINTMENTS);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(expectedResult);
      },
    );
  });

  describe('findAll', () => {
    const mockFindAppointmentsDto = { patient_id: 200, doctor: 'mockDoctor' };

    it('returns correct data', async () => {
      MockedAppointmentModel.exec.mockResolvedValueOnce(MOCK_APPOINTMENTS);
      expect(await service.findAll(mockFindAppointmentsDto)).toStrictEqual(
        MOCK_APPOINTMENTS,
      );
    });

    it.each`
      callback    | mockCallback                     | expectedResult
      ${'find'}   | ${MockedAppointmentModel.find}   | ${[{ doctor: 'mockDoctor', patient_id: 200 }]}
      ${'select'} | ${MockedAppointmentModel.select} | ${['id patient_id doctor appointment_date reason -_id']}
      ${'exec'}   | ${MockedAppointmentModel.exec}   | ${[]}
    `(
      "calls AppointmentModel's $callback method with the correct arguments",
      async ({ mockCallback, expectedResult }) => {
        MockedAppointmentModel.exec.mockResolvedValueOnce(MOCK_APPOINTMENTS);
        await service.findAll(mockFindAppointmentsDto);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(...expectedResult);
      },
    );
  });

  describe('findOne', () => {
    it('returns correct data when appointment is found', async () => {
      MockedAppointmentModel.exec.mockResolvedValueOnce(MOCK_APPOINTMENTS[0]);
      expect(await service.findOne(123)).toStrictEqual(MOCK_APPOINTMENTS[0]);
    });

    it('throws NotFoundException when no appointment is found', () => {
      MockedAppointmentModel.exec.mockResolvedValueOnce(null);
      expect(service.findOne(123)).rejects.toThrow(
        new NotFoundException('No appointment found'),
      );
    });

    it.each`
      callback     | mockCallback                      | expectedResult
      ${'findOne'} | ${MockedAppointmentModel.findOne} | ${[{ id: 123 }]}
      ${'select'}  | ${MockedAppointmentModel.select}  | ${['id patient_id doctor appointment_date reason -_id']}
      ${'exec'}    | ${MockedAppointmentModel.exec}    | ${[]}
    `(
      "calls AppointmentModel's $callback method with the correct arguments",
      async ({ mockCallback, expectedResult }) => {
        MockedAppointmentModel.exec.mockResolvedValueOnce(MOCK_APPOINTMENTS[0]);
        await service.findOne(123);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(...expectedResult);
      },
    );
  });
});
