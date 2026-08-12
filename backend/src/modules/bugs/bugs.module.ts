import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BugsController } from './bugs.controller';
import { BugsService } from './bugs.service';
import { BugsRepository } from './bugs.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BugsController],
  providers: [BugsService, BugsRepository],
  exports: [BugsService],
})
export class BugsModule {}
