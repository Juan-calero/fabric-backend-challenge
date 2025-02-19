import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { MOCK_APPOINTMENTS } from './mocks/appointments.mock';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

const mockAppointmentsService = mockDeep<AppointmentsService>();

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        { provide: AppointmentsService, useValue: mockAppointmentsService },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    jest.spyOn(controller['logger'], 'log');
  });

  afterEach(jest.clearAllMocks);

  describe('create', () => {
    const createAppointmentDto = {
      filepath: 'mockFilePath',
    };

    beforeEach(() => {
      mockAppointmentsService.findOne.mockResolvedValue(null);
      mockAppointmentsService.enqueueAppointments.mockResolvedValue({
        message: 'Appointment file added to the queue',
      });
    });

    it('calls logger with correct arguments', async () => {
      await controller.enqueueAppointments(createAppointmentDto);
      expect(controller['logger'].log).toHaveBeenCalledTimes(1);
      expect(controller['logger'].log).toHaveBeenCalledWith(
        'Received request to enqueue a new appointments file for processing',
      );
    });

    it('calls AppointmentsService.create with correct arguments', async () => {
      await controller.enqueueAppointments(createAppointmentDto);
      expect(mockAppointmentsService.enqueueAppointments).toHaveBeenCalledTimes(
        1,
      );
      expect(mockAppointmentsService.enqueueAppointments).toHaveBeenCalledWith(
        createAppointmentDto,
      );
    });

    it('returns correct response', async () => {
      expect(
        await controller.enqueueAppointments(createAppointmentDto),
      ).toStrictEqual({ message: 'Appointment file added to the queue' });
    });
  });

  describe('findAll', () => {
    it('calls logger with correct arguments', async () => {
      await controller.findAll({});
      expect(controller['logger'].log).toHaveBeenCalledTimes(1);
      expect(controller['logger'].log).toHaveBeenCalledWith(
        'Received request to retrieve all appointments',
      );
    });

    it('calls AppointmentsService.findAll with correct arguments when there are query params', async () => {
      await controller.findAll({ patient_id: 101, doctor: 'mockDoctor' });
      expect(mockAppointmentsService.findAll).toHaveBeenCalledTimes(1);
      expect(mockAppointmentsService.findAll).toHaveBeenCalledWith({
        doctor: 'mockDoctor',
        patient_id: 101,
      });
    });

    it('calls AppointmentsService.findAll with correct arguments when there are no query params', async () => {
      await controller.findAll({});
      expect(mockAppointmentsService.findAll).toHaveBeenCalledTimes(1);
      expect(mockAppointmentsService.findAll).toHaveBeenCalledWith({});
    });

    it('returns correct response', async () => {
      mockAppointmentsService.findAll.mockResolvedValueOnce(MOCK_APPOINTMENTS);
      expect(await controller.findAll({})).toStrictEqual(MOCK_APPOINTMENTS);
    });
  });

  describe('findOne', () => {
    const mockId = 123;

    it('calls logger with correct arguments', async () => {
      await controller.findOne(mockId);
      expect(controller['logger'].log).toHaveBeenCalledTimes(1);
      expect(controller['logger'].log).toHaveBeenCalledWith(
        `Received request to retrieve an appointment with id: ${mockId}`,
      );
    });

    it('calls AppointmentsService.findOne with correct arguments', async () => {
      await controller.findOne(mockId);
      expect(mockAppointmentsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockAppointmentsService.findOne).toHaveBeenCalledWith(mockId);
    });

    it('returns correct response', async () => {
      mockAppointmentsService.findOne.mockResolvedValueOnce(
        MOCK_APPOINTMENTS[0],
      );
      expect(await controller.findOne(mockId)).toStrictEqual(
        MOCK_APPOINTMENTS[0],
      );
    });
  });
});
