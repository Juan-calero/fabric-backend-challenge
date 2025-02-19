import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Model } from 'mongoose';
import { Appointment } from './entities/appointment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { CreateAppointmentsDto } from './dto/create-appointments.dto';
import { FindAppointmentsDto } from './dto/find-appointments.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectQueue('appointments') private appointmentsQueue: Queue,
  ) {}

  async enqueueAppointments(createAppointmentDto: CreateAppointmentDto) {
    const job = await this.appointmentsQueue.add(
      'process-appointments-file',
      createAppointmentDto,
      { attempts: 3 },
    );

    if (!job.id)
      throw new InternalServerErrorException(
        'Failed to add the appointment to the queue',
      );

    return { message: 'Appointment file added to the queue' };
  }

  async createMany(createAppointmentsDto: CreateAppointmentsDto[]) {
    const operations = createAppointmentsDto.map((appointment) => ({
      updateOne: {
        filter: {
          doctor: appointment.doctor,
          patient_id: appointment.patient_id,
          appointment_date: appointment.appointment_date,
        },
        update: { $setOnInsert: appointment },
        upsert: true,
      },
    }));

    const { upsertedCount } = await this.appointmentModel.bulkWrite(operations);

    return {
      message: `${upsertedCount} appointments created out of ${createAppointmentsDto.length}`,
    };
  }

  async findAll(query: FindAppointmentsDto) {
    const appointments = await this.appointmentModel
      .find(query)
      .select('id patient_id doctor appointment_date reason -_id')
      .exec();

    return appointments.map((appointment) =>
      appointment.toObject({ versionKey: false }),
    );
  }

  async findOne(id: number) {
    const singleAppointment = await this.appointmentModel
      .findOne({ id })
      .select('id patient_id doctor appointment_date reason -_id')
      .exec();

    if (!singleAppointment) throw new NotFoundException('No appointment found');
    return singleAppointment.toObject({ versionKey: false });
  }
}
