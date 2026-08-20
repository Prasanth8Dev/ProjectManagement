import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MinLength, IsArray } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'This task needs more details in the description.' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-comment' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ example: 'uuid-of-author' })
  @IsUUID()
  authorId: string;

  @ApiPropertyOptional({
    example: ['uuid-of-mentioned-user'],
    description: 'IDs of users @mentioned in the comment content',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mentions?: string[];
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment content' })
  @IsString()
  @MinLength(1)
  content: string;
}
