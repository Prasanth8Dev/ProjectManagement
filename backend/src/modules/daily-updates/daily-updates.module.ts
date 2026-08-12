import { Module } from '@nestjs/common';
import { DailyUpdatesController } from './daily-updates.controller';
import { DailyUpdatesService } from './daily-updates.service';
import { DailyUpdatesRepository } from './daily-updates.repository';

@Module({
  controllers: [DailyUpdatesController],
  providers: [DailyUpdatesService, DailyUpdatesRepository],
  exports: [DailyUpdatesService],
})
export class DailyUpdatesModule {}
