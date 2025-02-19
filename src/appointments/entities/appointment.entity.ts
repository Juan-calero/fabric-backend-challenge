import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { HydratedDocument } from 'mongoose';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true })
export class Appointment {
  @Prop()
  id: number;

  @Prop({ required: true })
  patient_id: number;

  @Prop({ required: true })
  doctor: string;

  /* The date and time of the appointment in ISO 8601 format. */
  @Prop({ required: true })
  appointment_date: string;

  /* The reason for the appointment. */
  @Prop({ required: true })
  reason: string;
}

const GeneratedSchema = SchemaFactory.createForClass(Appointment);
GeneratedSchema.plugin(AutoIncrementID, { field: 'id', startAt: 1 });

export const AppointmentSchema = GeneratedSchema;
