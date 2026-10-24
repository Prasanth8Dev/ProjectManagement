import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';
import { MeetingType } from '@prisma/client';

export class CreateMeetingDto {
  @ApiProperty({ example: 'Sprint 14 Planning' })
  @IsString()
  @MaxLength(300)
  title: string;

  @ApiPropertyOptional({ enum: MeetingType, default: MeetingType.GENERAL })
  @IsOptional()
  @IsEnum(MeetingType)
  type?: MeetingType;

  @ApiProperty({ example: '2026-09-30T10:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ example: 'uuid-of-organizer' })
  @IsOptional()
  @IsUUID()
  organizerId?: string;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];

  @ApiPropertyOptional({ example: 'Review sprint backlog and commit to sprint 14 scope.' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMeetingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ enum: MeetingType })
  @IsOptional()
  @IsEnum(MeetingType)
  type?: MeetingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  momSummary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discussionPoints?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  decisionsMade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  risksBlockers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
