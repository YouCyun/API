import { ApiProperty } from '@nestjs/swagger';

/**
 * AIMaker 平台回傳的「專案」資料結構
 * 對應 GET /api/projects?taskType=Object+Detection 的單筆項目
 *
 * 注意：實際欄位名稱請依 AIMaker API 實際回應調整
 */
export class AiMakerProjectDto {
  @ApiProperty({ description: 'AIMaker 專案 ID', example: 20 })
  id: number;

  @ApiProperty({ description: '專案名稱', example: 'HSNL_Fruits' })
  name: string;

  @ApiProperty({ description: '建立者 ID', example: 2 })
  creatorId: number;

  @ApiProperty({ description: '組織 ID', example: 1 })
  organizationId: number;

  @ApiProperty({
    description: '任務類型',
    example: 'Object Detection',
  })
  taskType: string;

  @ApiProperty({ description: 'CVAT Organization ID', example: 15, required: false })
  CVATOrganizationId?: number | null;

  @ApiProperty({ description: 'CVAT Organization Slug', example: '7b3u9bvky8jbpl7a', required: false })
  CVATOrganizationSlug?: string | null;

  @ApiProperty({ description: '聲音平台專案 ID', example: null, required: false })
  soundPlatformProjectId?: number | null;

  @ApiProperty({ description: '建立時間 (ISO 8601)', example: '2024-01-15T08:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: '最後更新時間 (ISO 8601)', example: '2024-06-01T12:00:00.000Z' })
  updatedAt: string;
}
