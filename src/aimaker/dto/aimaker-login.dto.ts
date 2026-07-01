import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AiMakerLoginDto {
  @ApiProperty({ example: 'device@hsnl.cs.nthu.edu.tw' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1qaz@WSX3edc' })
  @IsString()
  @MinLength(1)
  password: string;
}
