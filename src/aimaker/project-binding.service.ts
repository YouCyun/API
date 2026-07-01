import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../database/entities';
import { AiMakerProxyService } from './aimaker-proxy.service';
import { CreatePlatformProjectBindingDto } from './dto/create-platform-project-binding.dto';

@Injectable()
export class ProjectBindingService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly aiMakerProxyService: AiMakerProxyService,
  ) {}

  async createProjectAndBinding(
    dto: CreatePlatformProjectBindingDto,
    sessionToken: string,
  ): Promise<{
    projectId: number;
    bindingId: number;
    aimakerProjectId: number;
    aimakerVersionId: number;
    classCount: number;
  }> {
    const aimakerProjects = await this.aiMakerProxyService.getProjects(
      { page: 1, limit: 100, taskType: 'Object Detection' },
      sessionToken,
    );
    const targetProject = aimakerProjects.find((p) => p.id === dto.aimakerProjectId);
    if (!targetProject) {
      throw new NotFoundException(`AIMaker project ${dto.aimakerProjectId} not found`);
    }

    const versions = await this.aiMakerProxyService.getVersionsByProject(
      dto.aimakerProjectId,
      sessionToken,
    );
    const targetVersion = versions.find((v) => v.id === dto.aimakerVersionId);
    if (!targetVersion) {
      throw new NotFoundException(`AIMaker version ${dto.aimakerVersionId} not found`);
    }

    const project = await this.projectRepo.save(
      this.projectRepo.create({
        name: dto.platformProjectName,
        aimakerUserId: dto.aimakerUserId,
        aimakerVersionId: dto.aimakerVersionId,
        classFilename: dto.classFilename ?? null,
        stepFilename: dto.stepFilename ?? null,
      }),
    );

    const classReport = await this.aiMakerProxyService.getClassApByVersion(
      dto.aimakerVersionId,
      sessionToken,
    );
    const classCount = Object.keys(classReport.metrics).length;

    return {
      projectId: project.id,
      bindingId: project.id,
      aimakerProjectId: targetProject.id,
      aimakerVersionId: targetVersion.id,
      classCount,
    };
  }
}
