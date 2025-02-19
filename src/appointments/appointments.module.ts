import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Appointment, AppointmentSchema } from './entities/appointment.entity';
import { AppointmentsProcessor } from './appointments.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    BullModule.registerQueue({ name: 'appointments' }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsProcessor, AppointmentsService],
})
export class AppointmentsModule {}
