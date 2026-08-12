import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class MoveCardDto {
  @ApiProperty({ example: 'uuid-of-task' })
  @IsUUID()
  taskId: string;

  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  newStatus: TaskStatus;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  newPosition?: number;

  @ApiPropertyOptional({ description: 'User performing the move' })
  @IsOptional()
  @IsUUID()
  actorUserId?: string;
}
