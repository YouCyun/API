import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreatePlatformProjectBindingDto {
  @ApiProperty({ description: '平台專案名稱', example: '水果偵測平台專案' })
  @IsString()
  platformProjectName: string;

  @ApiProperty({ description: 'AIMaker 專案 ID', example: 20 })
  @IsInt()
  @Min(1)
  aimakerProjectId: number;

  @ApiProperty({ description: 'AIMaker 版本 ID', example: 37 })
  @IsInt()
  @Min(1)
  aimakerVersionId: number;

  @ApiProperty({ description: 'AIMaker 使用者 ID（creatorId）', example: 2 })
  @IsInt()
  @Min(1)
  aimakerUserId: number;
}
