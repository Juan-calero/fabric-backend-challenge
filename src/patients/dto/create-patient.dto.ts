import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { PatientGenderEnum } from '../entities/patient.entity';

export class CreatePatientDto {
  @Matches(/^\D*$/, { message: 'Name should not contain digits.' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Max(120, { message: 'Age cannot be greater than 120.' })
  @Min(0, { message: 'Age cannot be less than 0.' })
  @IsInt()
  age: number;

  @IsNotEmpty()
  @IsEnum(PatientGenderEnum)
  gender: PatientGenderEnum;

  @Matches(/^(\+|\d|-|\(|\))*$/, {
    message:
      'Contact should only contain digits, parenthesis, hyphens and a plus sign.',
  })
  @IsNotEmpty()
  @IsString()
  contact: string;
}
