import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ProjectMemberRole } from '@prisma/client';

export class AddProjectMemberDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ enum: ProjectMemberRole, default: ProjectMemberRole.DEVELOPER })
  @IsOptional()
  @IsEnum(ProjectMemberRole)
  role?: ProjectMemberRole = ProjectMemberRole.DEVELOPER;
}
