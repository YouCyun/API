import { ApiProperty } from '@nestjs/swagger';

/**
 * AIMaker 平台回傳的「類別 AP 指標」資料結構
 * 對應 GET /api/versions/:versionId/reports/all-class-AP 的單筆項目
 *
 * 注意：實際欄位名稱請依 AIMaker API 實際回應調整
 */
export class AiMakerClassMetricDto {
  @ApiProperty({ description: '精確率 (Precision)', example: 0.955 })
  precision: number;

  @ApiProperty({ description: '召回率 (Recall)', example: 1 })
  recall: number;

  @ApiProperty({ description: 'F1', example: 0.977 })
  f1: number;

  @ApiProperty({
    description: 'mAP',
    example: 0.995,
  })
  mAP: number;

  @ApiProperty({
    description: 'conf threshold（僅 all 類別通常會有）',
    example: 0.393,
    required: false,
  })
  conf_threshold?: number;
}

export class AiMakerClassApDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        precision: { type: 'number' },
        recall: { type: 'number' },
        f1: { type: 'number' },
        mAP: { type: 'number' },
        conf_threshold: { type: 'number' },
      },
    },
    example: {
      pen: { precision: 1, recall: 0.96, f1: 0.98, mAP: 0.995 },
      all: { precision: 0.95, recall: 0.92, f1: 0.93, mAP: 0.929, conf_threshold: 0.393 },
    },
  })
  metrics: Record<string, AiMakerClassMetricDto>;
}
