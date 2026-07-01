import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AiMakerAuthService } from './aimaker-auth.service';
import { AiMakerProxyService } from './aimaker-proxy.service';
import { ProjectBindingService } from './project-binding.service';
import { AiMakerLoginDto } from './dto/aimaker-login.dto';
import { AiMakerLoginResponseDto } from './dto/aimaker-login-response.dto';
import { AiMakerProjectQueryDto } from './dto/aimaker-project-query.dto';
import { AiMakerProjectDto } from './dto/aimaker-project.dto';
import { AiMakerVersionDto } from './dto/aimaker-version.dto';
import { AiMakerClassApDto } from './dto/aimaker-class-ap.dto';
import { CreatePlatformProjectBindingDto } from './dto/create-platform-project-binding.dto';

@ApiTags('aimaker-proxy')
@Controller('aimaker')
export class AiMakerController {
  constructor(
    private readonly authService: AiMakerAuthService,
    private readonly proxyService: AiMakerProxyService,
    private readonly bindingService: ProjectBindingService,
  ) {}

  @Post('auth/login')
  @ApiOperation({ summary: '前端提供 AIMaker 帳密，由後端建立代理 session' })
  @ApiBody({ type: AiMakerLoginDto })
  @ApiResponse({ status: 201, type: AiMakerLoginResponseDto })
  async login(@Body() dto: AiMakerLoginDto): Promise<AiMakerLoginResponseDto> {
    const result = await this.authService.loginAndCreateSession(dto.email, dto.password);
    return {
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  @Get('projects')
  @ApiOperation({ summary: '取得 AIMaker 專案列表' })
  @ApiHeader({ name: 'x-aimaker-session', required: true })
  @ApiResponse({ status: 200, type: [AiMakerProjectDto] })
  async getProjects(
    @Headers('x-aimaker-session') sessionToken: string,
    @Query() query: AiMakerProjectQueryDto,
  ): Promise<AiMakerProjectDto[]> {
    return this.proxyService.getProjects(query, sessionToken);
  }

  @Get('projects/:projectId/versions')
  @ApiOperation({ summary: '取得指定專案版本列表' })
  @ApiHeader({ name: 'x-aimaker-session', required: true })
  @ApiResponse({ status: 200, type: [AiMakerVersionDto] })
  async getVersions(
    @Headers('x-aimaker-session') sessionToken: string,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<AiMakerVersionDto[]> {
    return this.proxyService.getVersionsByProject(projectId, sessionToken);
  }

  @Get('versions/:versionId/reports/all-class-ap')
  @ApiOperation({ summary: '取得指定版本所有類別 AP 指標' })
  @ApiHeader({ name: 'x-aimaker-session', required: true })
  @ApiResponse({ status: 200, type: AiMakerClassApDto })
  async getClassReport(
    @Headers('x-aimaker-session') sessionToken: string,
    @Param('versionId', ParseIntPipe) versionId: number,
  ): Promise<AiMakerClassApDto> {
    return this.proxyService.getClassApByVersion(versionId, sessionToken);
  }

  @Post('platform-projects/bind')
  @ApiOperation({ summary: '建立平台專案並綁定 AIMaker 版本，同步類別清單' })
  @ApiHeader({ name: 'x-aimaker-session', required: true })
  @ApiBody({ type: CreatePlatformProjectBindingDto })
  @ApiResponse({ status: 201, description: '綁定成功' })
  async bindProject(
    @Headers('x-aimaker-session') sessionToken: string,
    @Body() dto: CreatePlatformProjectBindingDto,
  ) {
    return this.bindingService.createProjectAndBinding(dto, sessionToken);
  }
}
