import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsUUID,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class DailyUpdateTaskDto {
  @ApiProperty({ example: 'uuid-of-task' })
  @IsUUID()
  taskId: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursSpent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateDailyUpdateDto {
  @ApiProperty({ example: '2024-01-15', description: 'Work date in ISO format' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Worked on authentication module and code review' })
  @IsString()
  summary: string;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(0.5)
  @Max(24)
  hoursWorked: number;

  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'Continue with payment integration' })
  @IsOptional()
  @IsString()
  tomorrowPlan?: string;

  @ApiPropertyOptional({ example: 'Waiting on API credentials from third party' })
  @IsOptional()
  @IsString()
  blockers?: string;

  @ApiPropertyOptional({ example: 4, description: 'Mood rating 1-5' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  mood?: number;

  @ApiPropertyOptional({ type: [DailyUpdateTaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyUpdateTaskDto)
  tasks?: DailyUpdateTaskDto[];

  @ApiPropertyOptional({ type: [String], description: 'Array of project IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  projectIds?: string[];
}

export class UpdateDailyUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(24)
  hoursWorked?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tomorrowPlan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blockers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  mood?: number;

  @ApiPropertyOptional({ type: [DailyUpdateTaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyUpdateTaskDto)
  tasks?: DailyUpdateTaskDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  projectIds?: string[];
}

export class DailyUpdateFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
