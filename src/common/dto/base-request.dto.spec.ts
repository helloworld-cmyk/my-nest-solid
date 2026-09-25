import { Type, plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { BaseRequestDto, RequestMetadataDto } from './base-request.dto.js';

class EchoPayloadDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

class EchoRequestDto extends BaseRequestDto<EchoPayloadDto> {
  @ValidateNested()
  @Type(() => EchoPayloadDto)
  declare data: EchoPayloadDto;
}

describe('BaseRequestDto', () => {
  it('accepts a valid envelope with metadata.lang', () => {
    const dto = plainToInstance(EchoRequestDto, {
      metadata: { lang: 'vi' },
      data: { productId: 1, name: 'notebook' },
    });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.metadata).toBeInstanceOf(RequestMetadataDto);
    expect(dto.metadata?.lang).toBe('vi');
    expect(dto.data.productId).toBe(1);
  });

  it('accepts a valid envelope without metadata', () => {
    const dto = plainToInstance(EchoRequestDto, {
      data: { productId: 2, name: 'pen' },
    });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.metadata).toBeUndefined();
  });

  it('rejects an envelope missing data', () => {
    const errors = validateSync(plainToInstance(EchoRequestDto, {}));

    expect(errors.map((error) => error.property)).toContain('data');
    const dataErrors = errors.filter((error) => error.property === 'data');
    expect(dataErrors).toHaveLength(1);
    expect(dataErrors[0].constraints).toHaveProperty(
      'isDefined',
      'data should not be null or undefined',
    );
  });

  it('rejects an invalid metadata.lang value', () => {
    const errors = validateSync(
      plainToInstance(EchoRequestDto, {
        metadata: { lang: 'ja' },
        data: { productId: 1, name: 'notebook' },
      }),
    );

    const metadataError = errors.find((error) => error.property === 'metadata');
    expect(metadataError).toBeDefined();
    expect(metadataError?.children.map((child) => child.property)).toContain(
      'lang',
    );
    const langError = metadataError?.children.find(
      (child) => child.property === 'lang',
    );
    expect(langError?.constraints).toHaveProperty('isIn');
  });

  it('rejects an invalid nested data payload', () => {
    const errors = validateSync(
      plainToInstance(EchoRequestDto, {
        data: { productId: 0, name: '' },
      }),
    );

    const dataError = errors.find((error) => error.property === 'data');
    expect(dataError).toBeDefined();
    expect(dataError?.children.map((child) => child.property).sort()).toEqual([
      'name',
      'productId',
    ]);
  });
});
