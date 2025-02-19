import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentsDto } from './dto/create-appointments.dto';

@Processor('appointments')
export class AppointmentsProcessor extends WorkerHost {
  private readonly logger = new Logger(AppointmentsProcessor.name);

  constructor(private readonly appointmentsService: AppointmentsService) {
    super();
  }

  async process(job: Job<{ filepath: string }, any, string>): Promise<any> {
    this.logger.log(`Processing job "${job.name}" with id: ${job.id}`);

    switch (job.name) {
      case 'process-appointments-file':
        {
          if (!job.data?.filepath?.endsWith('.csv')) {
            job.moveToFailed(Error('Invalid file format'), job.token);
            return;
          }

          try {
            const filepath = job.data.filepath.replace('~', '');
            const csvFile = fs.readFileSync(filepath, 'utf8');

            const parsedCsv = Papa.parse(csvFile, { header: true });
            if (parsedCsv.errors.length > 0) {
              job.moveToFailed(Error('Invalid CSV file'), job.token);
              return;
            }

            const appointmentsDto = plainToInstance(
              CreateAppointmentsDto,
              parsedCsv.data,
            );

            const errors = await validate(appointmentsDto);
            if (errors.length > 0) {
              this.logger.error('CSV Validation failed', { errors });
              job.moveToFailed(Error('Validation failed'), job.token);
              return;
            }

            const result =
              await this.appointmentsService.createMany(appointmentsDto);

            this.logger.log(result.message);
          } catch (error) {
            this.logger.error(error.message, error.stack);
          }
        }
        break;
    }
  }
}
