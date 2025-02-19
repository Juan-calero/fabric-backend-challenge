import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { HydratedDocument } from 'mongoose';

export type PatientDocument = HydratedDocument<Patient>;

export enum PatientGenderEnum {
  Male = 'Male',
  Female = 'Female',
  NotSpecified = 'NotSpecified',
  Other = 'Other',
}

@Schema({ timestamps: true })
export class Patient {
  @Prop()
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  contact: string;
}

const GeneratedSchema = SchemaFactory.createForClass(Patient);
GeneratedSchema.plugin(AutoIncrementID, { field: 'id', startAt: 1 });

export const PatientSchema = GeneratedSchema;
