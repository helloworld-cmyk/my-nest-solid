import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddressResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsString()
  id!: string;

  @ApiProperty({ example: 'Theresa Webb' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '3517 W. Gray St. Utica, Pennsylvania 57867' })
  @IsString()
  address!: string;

  @ApiProperty({
    example: 'Willie.Jennings@example.com',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  email!: string | null;

  @ApiProperty({ example: '(480) 555-0103' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isDefault!: boolean;
}
