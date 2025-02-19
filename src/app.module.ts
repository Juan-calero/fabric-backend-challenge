import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL } }),
    PatientsModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
