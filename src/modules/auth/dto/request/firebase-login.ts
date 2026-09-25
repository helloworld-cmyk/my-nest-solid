import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class FirebaseLoginDto {
  @ApiProperty({
    description: 'Firebase ID token obtained from client SDK (getIdToken)',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class FirebaseLoginRequestDto extends BaseRequestDto<FirebaseLoginDto> {
  @ApiProperty({ type: () => FirebaseLoginDto })
  @ValidateNested()
  @Type(() => FirebaseLoginDto)
  declare data: FirebaseLoginDto;
}
