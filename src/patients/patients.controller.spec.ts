import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { MOCK_PATIENTS } from './mocks/patients.mock';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';

const mockPatientsService = mockDeep<PatientsService>();

describe('PatientsController', () => {
  let controller: PatientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [{ provide: PatientsService, useValue: mockPatientsService }],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    jest.spyOn(controller['logger'], 'log');
  });

  afterEach(jest.clearAllMocks);

  describe('create', () => {
    const createPatientDto = {
      name: MOCK_PATIENTS[0].name,
      age: MOCK_PATIENTS[0].age,
      gender: MOCK_PATIENTS[0].gender,
      contact: MOCK_PATIENTS[0].contact,
    };

    beforeEach(() => {
      mockPatientsService.findOne.mockResolvedValue(null);
      mockPatientsService.create.mockResolvedValue(MOCK_PATIENTS[0]);
    });

    it('calls logger with correct arguments', async () => {
      await controller.create(createPatientDto);
      expect(controller['logger'].log).toHaveBeenCalledTimes(1);
      expect(controller['logger'].log).toHaveBeenCalledWith(
        'Received request to create a new patient',
      );
    });

    it('calls PatientsService.create with correct arguments', async () => {
      await controller.create(createPatientDto);
      expect(mockPatientsService.create).toHaveBeenCalledTimes(1);
      expect(mockPatientsService.create).toHaveBeenCalledWith(createPatientDto);
    });

    it('returns correct response', async () => {
      expect(await controller.create(createPatientDto)).toStrictEqual(
        MOCK_PATIENTS[0],
      );
    });
  });

  describe('findAll', () => {
    it('calls logger with correct arguments', async () => {
      await controller.findAll();
      expect(controller['logger'].log).toHaveBeenCalledTimes(1);
      expect(controller['logger'].log).toHaveBeenCalledWith(
        'Received request to retrieve all patients',
      );
    });

    it('calls PatientsService.findAll with correct arguments', async () => {
      await controller.findAll();
      expect(mockPatientsService.findAll).toHaveBeenCalledTimes(1);
      expect(mockPatientsService.findAll).toHaveBeenCalledWith();
    });

    it('returns correct response', async () => {
      mockPatientsService.findAll.mockResolvedValueOnce(MOCK_PATIENTS);
      expect(await controller.findAll()).toStrictEqual(MOCK_PATIENTS);
    });
  });

  describe('findOne', () => {
    const mockId = 123;

    it('calls logger with correct arguments', async () => {
      await controller.findOne(mockId);
      expect(controller['logger'].log).toHaveBeenCalledTimes(1);
      expect(controller['logger'].log).toHaveBeenCalledWith(
        `Received request to retrieve a patient with id: ${mockId}`,
      );
    });

    it('calls PatientsService.findOne with correct arguments', async () => {
      await controller.findOne(mockId);
      expect(mockPatientsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockPatientsService.findOne).toHaveBeenCalledWith(mockId);
    });

    it('returns correct response', async () => {
      mockPatientsService.findOne.mockResolvedValueOnce(MOCK_PATIENTS[0]);
      expect(await controller.findOne(mockId)).toStrictEqual(MOCK_PATIENTS[0]);
    });
  });
});
