import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { BugStatus, BugSeverity, BugPriority, BugPlatform } from './create-bug.dto';

export class BugFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BugStatus })
  @IsOptional()
  @IsEnum(BugStatus)
  status?: BugStatus;

  @ApiPropertyOptional({ enum: BugSeverity })
  @IsOptional()
  @IsEnum(BugSeverity)
  severity?: BugSeverity;

  @ApiPropertyOptional({ enum: BugPriority })
  @IsOptional()
  @IsEnum(BugPriority)
  priority?: BugPriority;

  @ApiPropertyOptional({ enum: BugPlatform })
  @IsOptional()
  @IsEnum(BugPlatform)
  platform?: BugPlatform;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reporterId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isArchived?: boolean;
}

export class AssignBugDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}

export class ChangeBugStatusDto {
  @ApiPropertyOptional({ enum: BugStatus })
  @IsEnum(BugStatus)
  status: BugStatus;
}
