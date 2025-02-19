import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Patient } from './entities/patient.entity';
import { Model } from 'mongoose';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const newPatient = new this.patientModel(createPatientDto);
    const result = await newPatient.save();
    const { id, name, age, gender, contact } = result;

    return { id, name, age, gender, contact };
  }

  async findAll() {
    const patients = await this.patientModel
      .find()
      .select('id name age gender contact -_id')
      .exec();

    return patients.map((patient) => patient.toObject({ versionKey: false }));
  }

  async findOne(id: number) {
    const singlePatient = await this.patientModel
      .findOne({ id })
      .select('id name age gender contact -_id')
      .exec();

    if (!singlePatient) throw new NotFoundException('No patient found');
    return singlePatient.toObject({ versionKey: false });
  }
}
