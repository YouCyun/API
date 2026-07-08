import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class UpdateProjectVersionFileDto {
  @ApiProperty({
    description: '要儲存的 JSON 內容',
    example: {
      classes: [{ id: 1, name: 'apple' }],
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
