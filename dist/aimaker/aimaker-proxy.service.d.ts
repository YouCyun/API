import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AiMakerAuthService } from './aimaker-auth.service';
import { AiMakerProjectDto } from './dto/aimaker-project.dto';
import { AiMakerVersionDto } from './dto/aimaker-version.dto';
import { AiMakerClassApDto } from './dto/aimaker-class-ap.dto';
export declare class AiMakerProxyService {
    private readonly httpService;
    private readonly authService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, authService: AiMakerAuthService, configService: ConfigService);
    getProjects(params: {
        page?: number;
        limit?: number;
        taskType?: string;
    }, sessionToken?: string): Promise<AiMakerProjectDto[]>;
    getVersionsByProject(projectId: number | string, sessionToken?: string): Promise<AiMakerVersionDto[]>;
    getClassApByVersion(versionId: number | string, sessionToken?: string): Promise<AiMakerClassApDto>;
    private makeAuthenticatedRequest;
    private executeRequest;
    private isAuthError;
    private throwProxyError;
}
