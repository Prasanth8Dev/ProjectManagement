import { PartialType } from '@nestjs/swagger';
import { CreateBugDto } from './create-bug.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBugDto extends PartialType(CreateBugDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
