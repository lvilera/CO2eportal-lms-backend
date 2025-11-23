import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  providers: [EnrollmentService],
  controllers: [EnrollmentController],
})
export class EnrollmentModule {}
