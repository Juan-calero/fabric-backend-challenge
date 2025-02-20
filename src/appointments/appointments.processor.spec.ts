import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { Job } from 'bullmq';
import * as Papa from 'papaparse';
import { validate } from 'class-validator';
import { AppointmentsProcessor } from './appointments.processor';
import { AppointmentsService } from './appointments.service';

jest.mock('./dto/create-appointments.dto', () => ({
  CreateAppointmentsDto: 'mockCreateAppointmentsDto',
}));

jest.mock('fs/promises', () => ({
  readFile: jest.fn(() => 'csvFile'),
}));

jest.mock('papaparse', () => ({
  parse: jest.fn(() => ({ errors: [] })),
}));

jest.mock('class-transformer', () => ({
  plainToInstance: jest.fn(() => 'mockAppointmentsDto'),
}));

jest.mock('class-validator', () => ({
  validate: jest.fn(() => ({ errors: [] })),
}));

const mockAppointmentsService = mockDeep<AppointmentsService>();

const mockJob = {
  name: 'process-appointments-file',
  id: 'mockJobId',
  token: 'mockJobToken',
  data: { filepath: 'mockFilePath.csv' },
  moveToFailed: jest.fn(),
} as unknown as Job<{ filepath: string }, any, string>;

describe('AppointmentsProcessor', () => {
  let processor: AppointmentsProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsProcessor,
        { provide: AppointmentsService, useValue: mockAppointmentsService },
      ],
    }).compile();

    processor = module.get<AppointmentsProcessor>(AppointmentsProcessor);
    jest.spyOn(processor['logger'], 'log');
    jest.spyOn(processor['logger'], 'error');
  });

  afterEach(jest.clearAllMocks);

  describe('process', () => {
    it('calls logger with correct arguments', async () => {
      await processor.process(mockJob);
      expect(processor['logger'].log).toHaveBeenCalledTimes(1);
      expect(processor['logger'].log).toHaveBeenCalledWith(
        `Processing job "${mockJob.name}" with id: ${mockJob.id}`,
      );
    });

    describe('"process-appointments-file" job', () => {
      it('calls moveToFailed with correct arguments if the filepath is not an csv', async () => {
        await processor.process({
          ...mockJob,
          data: { filepath: 'mockFilePath.txt' },
        } as unknown as Job<{ filepath: string }, any, string>);

        expect(mockJob.moveToFailed).toHaveBeenCalledTimes(1);
        expect(mockJob.moveToFailed).toHaveBeenCalledWith(
          Error('Invalid file format'),
          mockJob.token,
        );
      });

      it('calls moveToFailed with correct arguments if the CSV file has failed to parse', async () => {
        (Papa.parse as jest.Mock).mockReturnValueOnce({
          errors: ['mockError'],
        });

        await processor.process(mockJob);

        expect(mockJob.moveToFailed).toHaveBeenCalledTimes(1);
        expect(mockJob.moveToFailed).toHaveBeenCalledWith(
          Error('Invalid CSV file'),
          mockJob.token,
        );
      });

      it('calls moveToFailed with correct arguments if the field validation has failed', async () => {
        (validate as jest.Mock).mockReturnValueOnce(['mockError']);
        await processor.process(mockJob);

        expect(mockJob.moveToFailed).toHaveBeenCalledTimes(1);
        expect(mockJob.moveToFailed).toHaveBeenCalledWith(
          Error('Validation failed'),
          mockJob.token,
        );
      });

      it('calls createMany with correct arguments on success', async () => {
        await processor.process(mockJob);

        expect(mockAppointmentsService.createMany).toHaveBeenCalledTimes(1);
        expect(mockAppointmentsService.createMany).toHaveBeenCalledWith(
          'mockAppointmentsDto',
        );
      });
    });
  });
});
