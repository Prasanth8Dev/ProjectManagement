import { IsString, IsOptional, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BugStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  REOPENED = 'REOPENED',
  CLOSED = 'CLOSED',
  WONT_FIX = 'WONT_FIX',
}

export enum BugSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum BugPlatform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  BACKEND = 'BACKEND',
  FRONTEND = 'FRONTEND',
}

export enum BugPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateBugDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stepsToReproduce?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedBehavior?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actualBehavior?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  environment?: string;

  @ApiPropertyOptional({ enum: BugStatus, default: BugStatus.OPEN })
  @IsOptional()
  @IsEnum(BugStatus)
  status?: BugStatus;

  @ApiPropertyOptional({ enum: BugSeverity, default: BugSeverity.MEDIUM })
  @IsOptional()
  @IsEnum(BugSeverity)
  severity?: BugSeverity;

  @ApiPropertyOptional({ enum: BugPriority, default: BugPriority.MEDIUM })
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reporterId: string;
}
