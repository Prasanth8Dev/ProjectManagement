import { Module } from '@nestjs/common';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { LabelsRepository } from './labels.repository';

@Module({
  controllers: [LabelsController],
  providers: [LabelsService, LabelsRepository],
  exports: [LabelsService],
})
export class LabelsModule {}
