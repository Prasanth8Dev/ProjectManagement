import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDto {
  @ApiProperty({ example: 'authentication' })
  @IsString()
  q: string;

  @ApiPropertyOptional({ enum: ['all', 'tasks', 'projects', 'members'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'tasks', 'projects', 'members'])
  type?: string = 'all';

  @ApiPropertyOptional({ default: 20, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
