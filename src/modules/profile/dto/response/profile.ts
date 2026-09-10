import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AuthProvider,
  Role,
} from '../../../../../prisma/generated/prisma/enums.js';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ProfileResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsString()
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '+84912345678' })
  @IsString()
  phoneNumber!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  avatarPath!: string | null;

  @ApiPropertyOptional({ example: 'firebase-uid-123', nullable: true })
  @IsOptional()
  @IsString()
  firebaseUid!: string | null;

  @ApiProperty({
    example: 'EMAIL_PASSWORD',
    enum: AuthProvider,
  })
  @IsEnum(AuthProvider)
  authProvider!: AuthProvider;

  @ApiProperty({ example: 'USER', enum: Role })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  updatedAt!: Date;
}
