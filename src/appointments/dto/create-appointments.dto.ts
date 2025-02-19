import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateAppointmentsDto {
  @IsPositive({ message: 'Patient ID must be a positive integer.' })
  @IsInt()
  patient_id: number;

  @Matches(/^\D*$/, { message: 'Name should not contain digits.' })
  @IsNotEmpty()
  @IsString()
  doctor: string;

  @IsNotEmpty()
  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: 'Appointment date must be in valid ISO 8601 format.' },
  )
  appointment_date: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
