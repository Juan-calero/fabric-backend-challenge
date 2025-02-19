import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class FindAppointmentsDto {
  @IsPositive({ message: 'Patient ID must be a positive integer.' })
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  patient_id?: number;

  @Matches(/^\D*$/, { message: 'Name should not contain digits.' })
  @IsString()
  @IsOptional()
  doctor?: string;
}
