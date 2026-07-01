import { ApiProperty } from '@nestjs/swagger';

export class AiMakerLoginResponseDto {
  @ApiProperty({ description: '後端保存的 AIMaker session token', example: '2f4d9b1b-ef6d-4cce-9b6f-94318fa4e90d' })
  sessionToken: string;

  @ApiProperty({ description: 'session 過期時間', example: '2026-06-25T03:00:00.000Z' })
  expiresAt: string;
}
