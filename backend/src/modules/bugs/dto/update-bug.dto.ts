import { PartialType } from '@nestjs/swagger';
import { CreateBugDto } from './create-bug.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBugDto extends PartialType(CreateBugDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiPropertyOptional({ description: 'Link this bug to an existing task (or null to unlink)' })
  @IsOptional()
  @IsUUID()
  linkedTaskId?: string;
}
