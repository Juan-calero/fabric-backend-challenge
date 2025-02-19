import { Types } from 'mongoose';
import { PatientGenderEnum } from '../entities/patient.entity';

export const MOCK_PATIENTS = [
  {
    _id: new Types.ObjectId(),
    id: 1,
    name: 'John Doe',
    age: 30,
    gender: PatientGenderEnum.Male,
    contact: '555-123',
    __v: 1,
    toObject: jest.fn().mockReturnThis(),
  },
  {
    _id: new Types.ObjectId(),
    id: 2,
    name: 'Jane Doe',
    age: 15,
    gender: PatientGenderEnum.Female,
    contact: '555-3455',
    __v: 1,
    toObject: jest.fn().mockReturnThis(),
  },
];
