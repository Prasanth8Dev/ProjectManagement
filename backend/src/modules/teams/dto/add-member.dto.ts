import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { TeamMemberRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ enum: TeamMemberRole, default: TeamMemberRole.MEMBER })
  @IsOptional()
  @IsEnum(TeamMemberRole)
  role?: TeamMemberRole = TeamMemberRole.MEMBER;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: TeamMemberRole })
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
