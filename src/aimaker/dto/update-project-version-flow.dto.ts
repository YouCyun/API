import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class UpdateProjectVersionFlowDto {
  @ApiProperty({
    description: '版本流程資料 JSON',
    example: {
      nodes: [{ id: '1', type: 'start' }],
      edges: [],
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsNotEmpty()
  flowData: Record<string, any>;
}
