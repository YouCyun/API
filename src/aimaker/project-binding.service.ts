import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectVersion } from '../database/entities';
import { AiMakerProxyService } from './aimaker-proxy.service';
import { CreatePlatformProjectBindingDto } from './dto/create-platform-project-binding.dto';

@Injectable()
export class ProjectBindingService {
  constructor(
    @Optional() @InjectRepository(Project)
    private readonly projectRepo: Repository<Project> | undefined,
    @Optional() @InjectRepository(ProjectVersion)
    private readonly projectVersionRepo: Repository<ProjectVersion> | undefined,
    private readonly aiMakerProxyService: AiMakerProxyService,
  ) {}

  private ensureDatabaseReady(): void {
    if (!this.projectRepo || !this.projectVersionRepo) {
      throw new InternalServerErrorException('Database repositories are not available');
    }
  }

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
    this.ensureDatabaseReady();

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

    let project = await this.projectRepo!.findOne({
      where: { aimakerProjectId: dto.aimakerProjectId },
    });

    if (!project) {
      project = await this.projectRepo!.save(
        this.projectRepo!.create({
          name: dto.platformProjectName,
          aimakerUserId: dto.aimakerUserId,
          aimakerProjectId: dto.aimakerProjectId,
        }),
      );
    }

    const savedVersion = await this.projectVersionRepo!.save(
      this.projectVersionRepo!.create({
        aimakerVersionId: dto.aimakerVersionId,
        classData: null,
        stepData: null,
        flowData: {},
        project,
      }),
    );

    const classReport = await this.aiMakerProxyService.getClassApByVersion(
      dto.aimakerVersionId,
      sessionToken,
    );
    const classCount = Object.keys(classReport.metrics).length;

    return {
      projectId: project.id,
      bindingId: savedVersion.id,
      aimakerProjectId: targetProject.id,
      aimakerVersionId: targetVersion.id,
      classCount,
    };
  }

  async listProjectsByUser(userId: number): Promise<
    Array<{
      id: number;
      name: string;
      aimakerUserId: number;
      aimakerProjectId: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    this.ensureDatabaseReady();

    return this.projectRepo!.find({
      where: { aimakerUserId: userId },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'aimakerUserId', 'aimakerProjectId', 'createdAt', 'updatedAt'],
    });
  }

  async getVersionsByProjectId(projectId: number): Promise<
    Array<{
      id: number;
      aimakerVersionId: number;
      classData: Record<string, any> | null;
      stepData: Record<string, any> | null;
      flowData: Record<string, any>;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    this.ensureDatabaseReady();

    return this.projectVersionRepo!.find({
      where: { project: { id: projectId } },
      order: { createdAt: 'DESC' },
      select: ['id', 'aimakerVersionId', 'classData', 'stepData', 'flowData', 'createdAt', 'updatedAt'],
    });
  }

  async updateVersionFlow(versionId: number, flowData: Record<string, any>): Promise<ProjectVersion> {
    this.ensureDatabaseReady();

    const version = await this.projectVersionRepo!.findOne({ where: { id: versionId } });
    if (!version) {
      throw new NotFoundException(`ProjectVersion ${versionId} not found`);
    }

    version.flowData = flowData;
    return this.projectVersionRepo!.save(version);
  }

  async updateVersionClassData(versionId: number, data: Record<string, any>): Promise<ProjectVersion> {
    this.ensureDatabaseReady();

    const version = await this.projectVersionRepo!.findOne({ where: { id: versionId } });
    if (!version) {
      throw new NotFoundException(`ProjectVersion ${versionId} not found`);
    }

    version.classData = data;
    return this.projectVersionRepo!.save(version);
  }

  async updateVersionStepData(versionId: number, data: Record<string, any>): Promise<ProjectVersion> {
    this.ensureDatabaseReady();

    const version = await this.projectVersionRepo!.findOne({ where: { id: versionId } });
    if (!version) {
      throw new NotFoundException(`ProjectVersion ${versionId} not found`);
    }

    version.stepData = data;
    return this.projectVersionRepo!.save(version);
  }
}
