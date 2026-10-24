import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PauseTaskDto {
  @ApiPropertyOptional({ example: 'Waiting on design sign-off' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class BlockTaskDto {
  @ApiPropertyOptional({ example: 'Blocked on API dependency from another team' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class CompleteTaskDto {
  @ApiPropertyOptional({ example: 'Deployed to staging, ready for QA' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class SendForReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class CompleteReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class CloseTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
