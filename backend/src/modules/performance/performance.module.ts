import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { PerformanceRepository } from './performance.repository';
import { InterventionsModule } from '../interventions/interventions.module';

@Module({
  imports: [PrismaModule, InterventionsModule],
  controllers: [PerformanceController],
  providers: [PerformanceService, PerformanceRepository],
  exports: [PerformanceService],
})
export class PerformanceModule {}
