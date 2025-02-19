import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  Logger,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsDto } from './dto/find-appointments.dto';

@Controller('appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(201)
  enqueueAppointments(@Body() createAppointmentDto: CreateAppointmentDto) {
    this.logger.log(
      'Received request to enqueue a new appointments file for processing',
    );
    return this.appointmentsService.enqueueAppointments(createAppointmentDto);
  }

  @Get()
  findAll(@Query() query: FindAppointmentsDto) {
    this.logger.log('Received request to retrieve all appointments');
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    this.logger.log(
      `Received request to retrieve an appointment with id: ${id}`,
    );
    return this.appointmentsService.findOne(id);
  }
}
