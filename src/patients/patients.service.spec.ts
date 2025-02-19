import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { getModelToken } from '@nestjs/mongoose';
import { Patient } from './entities/patient.entity';
import { NotFoundException } from '@nestjs/common';
import { MOCK_PATIENTS } from './mocks/patients.mock';

class MockedPatientModel {
  constructor(private _: any) {}
  save = jest.fn().mockResolvedValue(MOCK_PATIENTS[0]);
  static find = jest.fn().mockReturnThis();
  static create = jest.fn().mockReturnValue(MOCK_PATIENTS);
  static exec = jest.fn().mockReturnValue(MOCK_PATIENTS);
  static select = jest.fn().mockReturnThis();
  static findOne = jest.fn().mockReturnThis();
}

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: getModelToken(Patient.name), useValue: MockedPatientModel },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  afterEach(jest.clearAllMocks);

  describe('create', () => {
    it('returns correct data', async () => {
      const mockCreatePatientDto = {
        name: MOCK_PATIENTS[0].name,
        age: MOCK_PATIENTS[0].age,
        gender: MOCK_PATIENTS[0].gender,
        contact: MOCK_PATIENTS[0].contact,
      };

      const result = await service.create(mockCreatePatientDto);
      expect(result).toStrictEqual({
        ...mockCreatePatientDto,
        id: MOCK_PATIENTS[0].id,
      });
    });
  });

  describe('findAll', () => {
    it('returns correct data', async () => {
      MockedPatientModel.exec.mockResolvedValueOnce(MOCK_PATIENTS);
      expect(await service.findAll()).toStrictEqual(MOCK_PATIENTS);
    });

    it.each`
      callback    | mockCallback                 | expectedResult
      ${'find'}   | ${MockedPatientModel.find}   | ${[]}
      ${'select'} | ${MockedPatientModel.select} | ${['id name age gender contact -_id']}
      ${'exec'}   | ${MockedPatientModel.exec}   | ${[]}
    `(
      "calls PatientModel's $callback method with the correct arguments",
      async ({ mockCallback, expectedResult }) => {
        MockedPatientModel.exec.mockResolvedValueOnce(MOCK_PATIENTS);
        await service.findAll();
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(...expectedResult);
      },
    );
  });

  describe('findOne', () => {
    it('returns correct data when patient is found', async () => {
      MockedPatientModel.exec.mockResolvedValueOnce(MOCK_PATIENTS[0]);
      expect(await service.findOne(123)).toStrictEqual(MOCK_PATIENTS[0]);
    });

    it('throws NotFoundException when no patient is found', () => {
      MockedPatientModel.exec.mockResolvedValueOnce(null);
      expect(service.findOne(123)).rejects.toThrow(
        new NotFoundException('No patient found'),
      );
    });

    it.each`
      callback     | mockCallback                  | expectedResult
      ${'findOne'} | ${MockedPatientModel.findOne} | ${[{ id: 123 }]}
      ${'select'}  | ${MockedPatientModel.select}  | ${['id name age gender contact -_id']}
      ${'exec'}    | ${MockedPatientModel.exec}    | ${[]}
    `(
      "calls PatientModel's $callback method with the correct arguments",
      async ({ mockCallback, expectedResult }) => {
        MockedPatientModel.exec.mockResolvedValueOnce(MOCK_PATIENTS[0]);
        await service.findOne(123);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(...expectedResult);
      },
    );
  });
});
