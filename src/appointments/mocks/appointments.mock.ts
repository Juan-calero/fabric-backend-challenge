import { Types } from 'mongoose';

export const MOCK_APPOINTMENTS = [
  {
    _id: new Types.ObjectId(),
    id: 1,
    patient_id: 101,
    doctor: 'mockDoctor1',
    appointment_date: '2024-10-22T14:30:00Z',
    reason: 'mockReason1',
    __v: 1,
    toObject: jest.fn().mockReturnThis(),
  },
  {
    _id: new Types.ObjectId(),
    id: 2,
    patient_id: 102,
    doctor: 'mockDoctor2',
    appointment_date: '2024-11-23T14:30:00Z',
    reason: 'mockReason2',
    __v: 1,
    toObject: jest.fn().mockReturnThis(),
  },
];
