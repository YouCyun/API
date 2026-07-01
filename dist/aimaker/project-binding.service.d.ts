import { Repository } from 'typeorm';
import { Project } from '../database/entities';
import { AiMakerProxyService } from './aimaker-proxy.service';
import { CreatePlatformProjectBindingDto } from './dto/create-platform-project-binding.dto';
export declare class ProjectBindingService {
    private readonly projectRepo;
    private readonly aiMakerProxyService;
    constructor(projectRepo: Repository<Project>, aiMakerProxyService: AiMakerProxyService);
    createProjectAndBinding(dto: CreatePlatformProjectBindingDto, sessionToken: string): Promise<{
        projectId: number;
        bindingId: number;
        aimakerProjectId: number;
        aimakerVersionId: number;
        classCount: number;
    }>;
}
