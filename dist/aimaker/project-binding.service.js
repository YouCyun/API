"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectBindingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const aimaker_proxy_service_1 = require("./aimaker-proxy.service");
let ProjectBindingService = class ProjectBindingService {
    constructor(projectRepo, aiMakerProxyService) {
        this.projectRepo = projectRepo;
        this.aiMakerProxyService = aiMakerProxyService;
    }
    async createProjectAndBinding(dto, sessionToken) {
        const aimakerProjects = await this.aiMakerProxyService.getProjects({ page: 1, limit: 100, taskType: 'Object Detection' }, sessionToken);
        const targetProject = aimakerProjects.find((p) => p.id === dto.aimakerProjectId);
        if (!targetProject) {
            throw new common_1.NotFoundException(`AIMaker project ${dto.aimakerProjectId} not found`);
        }
        const versions = await this.aiMakerProxyService.getVersionsByProject(dto.aimakerProjectId, sessionToken);
        const targetVersion = versions.find((v) => v.id === dto.aimakerVersionId);
        if (!targetVersion) {
            throw new common_1.NotFoundException(`AIMaker version ${dto.aimakerVersionId} not found`);
        }
        const project = await this.projectRepo.save(this.projectRepo.create({
            name: dto.platformProjectName,
            aimakerUserId: dto.aimakerUserId,
            aimakerVersionId: dto.aimakerVersionId,
            classFilename: dto.classFilename ?? null,
            stepFilename: dto.stepFilename ?? null,
        }));
        const classReport = await this.aiMakerProxyService.getClassApByVersion(dto.aimakerVersionId, sessionToken);
        const classCount = Object.keys(classReport.metrics).length;
        return {
            projectId: project.id,
            bindingId: project.id,
            aimakerProjectId: targetProject.id,
            aimakerVersionId: targetVersion.id,
            classCount,
        };
    }
};
exports.ProjectBindingService = ProjectBindingService;
exports.ProjectBindingService = ProjectBindingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        aimaker_proxy_service_1.AiMakerProxyService])
], ProjectBindingService);
//# sourceMappingURL=project-binding.service.js.map