import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('patients')
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name);

  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createPatientDto: CreatePatientDto) {
    this.logger.log('Received request to create a new patient');
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  findAll() {
    this.logger.log('Received request to retrieve all patients');
    return this.patientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    this.logger.log(`Received request to retrieve a patient with id: ${id}`);
    return this.patientsService.findOne(id);
  }
}
