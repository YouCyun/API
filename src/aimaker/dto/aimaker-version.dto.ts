import { ApiProperty } from '@nestjs/swagger';

export class AiMakerVersionCreatorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Admin HSNL' })
  name: string;

  @ApiProperty({ example: 'device@hsnl.cs.nthu.edu.tw' })
  email: string;
}

/**
 * AIMaker 平台回傳的「版本」資料結構
 * 對應 GET /api/projects/:projectId/versions 的單筆項目
 *
 * 注意：實際欄位名稱請依 AIMaker API 實際回應調整
 */
export class AiMakerVersionDto {
  @ApiProperty({ description: 'AIMaker 版本 ID', example: 37 })
  id: number;

  @ApiProperty({ description: '所屬 AIMaker 專案 ID', example: 20 })
  projectId: number;

  @ApiProperty({ description: '版本編號', example: 7 })
  versionNum: number;

  @ApiProperty({ description: '建立者 ID', example: 1 })
  creatorId: number;

  @ApiProperty({ description: 'Session ID', example: 101, required: false })
  sessionId?: number | null;

  @ApiProperty({ description: 'Dataset ID', example: 118 })
  datasetId: number;

  @ApiProperty({
    description: '訓練狀態',
    example: 'Finish',
  })
  status: string;

  @ApiProperty({ description: '版本建立時間 (ISO 8601)', example: '2024-03-10T09:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: '版本更新時間 (ISO 8601)', example: '2024-03-10T12:00:00.000Z' })
  updatedAt: string;

  @ApiProperty({ type: AiMakerVersionCreatorDto, required: false })
  creator?: AiMakerVersionCreatorDto;
}
