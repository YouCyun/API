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
export declare class AiMakerController {
    private readonly authService;
    private readonly proxyService;
    private readonly bindingService;
    constructor(authService: AiMakerAuthService, proxyService: AiMakerProxyService, bindingService: ProjectBindingService);
    login(dto: AiMakerLoginDto): Promise<AiMakerLoginResponseDto>;
    getProjects(sessionToken: string, query: AiMakerProjectQueryDto): Promise<AiMakerProjectDto[]>;
    getVersions(sessionToken: string, projectId: number): Promise<AiMakerVersionDto[]>;
    getClassReport(sessionToken: string, versionId: number): Promise<AiMakerClassApDto>;
    bindProject(sessionToken: string, dto: CreatePlatformProjectBindingDto): Promise<{
        projectId: number;
        bindingId: number;
        aimakerProjectId: number;
        aimakerVersionId: number;
        classCount: number;
    }>;
}
