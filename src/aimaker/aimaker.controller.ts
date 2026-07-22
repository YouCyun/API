import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
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
import { UpdateProjectVersionFileDto } from './dto/update-project-version-file.dto';
import { UpdateProjectVersionFlowDto } from './dto/update-project-version-flow.dto';

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
      xAimakerSession: result.sessionToken,
      userId: result.userId,
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

  @Get('platform-projects/user/:userId')
  @ApiOperation({ summary: '取得指定使用者的專案選單列表' })
  @ApiResponse({ status: 200, description: '專案列表' })
  async getUserProjects(@Param('userId', ParseIntPipe) userId: number) {
    return this.bindingService.listProjectsByUser(userId);
  }

  @Get('platform-projects/:id/versions')
  @ApiOperation({ summary: '取得指定專案的所有版本與流程資料' })
  @ApiResponse({ status: 200, description: '版本列表' })
  async getProjectVersions(@Param('id', ParseIntPipe) projectId: number) {
    return this.bindingService.getVersionsByProjectId(projectId);
  }

  @Patch('platform-projects/versions/:versionId/flow')
  @ApiOperation({ summary: '更新指定版本的流程 JSON' })
  @ApiBody({ type: UpdateProjectVersionFlowDto })
  @ApiResponse({ status: 200, description: '流程更新成功' })
  async updateProjectVersionFlow(
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() dto: UpdateProjectVersionFlowDto,
  ) {
    return this.bindingService.updateVersionFlow(versionId, dto.flowData);
  }

  @Patch('platform-projects/versions/:versionId/class')
  @ApiOperation({ summary: '更新指定版本的 class JSON 資料' })
  @ApiBody({ type: UpdateProjectVersionFileDto })
  @ApiResponse({ status: 200, description: 'class 資料更新成功' })
  async updateProjectVersionClass(
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() dto: UpdateProjectVersionFileDto,
  ) {
    return this.bindingService.updateVersionClassData(versionId, dto.data);
  }

  @Patch('platform-projects/versions/:versionId/step')
  @ApiOperation({ summary: '更新指定版本的 step JSON 資料' })
  @ApiBody({ type: UpdateProjectVersionFileDto })
  @ApiResponse({ status: 200, description: 'step 資料更新成功' })
  async updateProjectVersionStep(
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() dto: UpdateProjectVersionFileDto,
  ) {
    return this.bindingService.updateVersionStepData(versionId, dto.data);
  }
}
