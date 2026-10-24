import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateInterventionDto {
  @ApiProperty({ example: 'uuid-of-employee', description: 'The employee this intervention is about' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    example: 'Had to step in and rewrite the API integration — the original approach missed the auth flow entirely.',
  })
  @IsString()
  @MinLength(1)
  note: string;
}
