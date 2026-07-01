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
exports.AiMakerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const aimaker_auth_service_1 = require("./aimaker-auth.service");
const aimaker_proxy_service_1 = require("./aimaker-proxy.service");
const project_binding_service_1 = require("./project-binding.service");
const aimaker_login_dto_1 = require("./dto/aimaker-login.dto");
const aimaker_login_response_dto_1 = require("./dto/aimaker-login-response.dto");
const aimaker_project_query_dto_1 = require("./dto/aimaker-project-query.dto");
const aimaker_project_dto_1 = require("./dto/aimaker-project.dto");
const aimaker_version_dto_1 = require("./dto/aimaker-version.dto");
const aimaker_class_ap_dto_1 = require("./dto/aimaker-class-ap.dto");
const create_platform_project_binding_dto_1 = require("./dto/create-platform-project-binding.dto");
let AiMakerController = class AiMakerController {
    constructor(authService, proxyService, bindingService) {
        this.authService = authService;
        this.proxyService = proxyService;
        this.bindingService = bindingService;
    }
    async login(dto) {
        const result = await this.authService.loginAndCreateSession(dto.email, dto.password);
        return {
            sessionToken: result.sessionToken,
            expiresAt: result.expiresAt.toISOString(),
        };
    }
    async getProjects(sessionToken, query) {
        return this.proxyService.getProjects(query, sessionToken);
    }
    async getVersions(sessionToken, projectId) {
        return this.proxyService.getVersionsByProject(projectId, sessionToken);
    }
    async getClassReport(sessionToken, versionId) {
        return this.proxyService.getClassApByVersion(versionId, sessionToken);
    }
    async bindProject(sessionToken, dto) {
        return this.bindingService.createProjectAndBinding(dto, sessionToken);
    }
};
exports.AiMakerController = AiMakerController;
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, swagger_1.ApiOperation)({ summary: '前端提供 AIMaker 帳密，由後端建立代理 session' }),
    (0, swagger_1.ApiBody)({ type: aimaker_login_dto_1.AiMakerLoginDto }),
    (0, swagger_1.ApiResponse)({ status: 201, type: aimaker_login_response_dto_1.AiMakerLoginResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [aimaker_login_dto_1.AiMakerLoginDto]),
    __metadata("design:returntype", Promise)
], AiMakerController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('projects'),
    (0, swagger_1.ApiOperation)({ summary: '取得 AIMaker 專案列表' }),
    (0, swagger_1.ApiHeader)({ name: 'x-aimaker-session', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [aimaker_project_dto_1.AiMakerProjectDto] }),
    __param(0, (0, common_1.Headers)('x-aimaker-session')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, aimaker_project_query_dto_1.AiMakerProjectQueryDto]),
    __metadata("design:returntype", Promise)
], AiMakerController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/versions'),
    (0, swagger_1.ApiOperation)({ summary: '取得指定專案版本列表' }),
    (0, swagger_1.ApiHeader)({ name: 'x-aimaker-session', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [aimaker_version_dto_1.AiMakerVersionDto] }),
    __param(0, (0, common_1.Headers)('x-aimaker-session')),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AiMakerController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Get)('versions/:versionId/reports/all-class-ap'),
    (0, swagger_1.ApiOperation)({ summary: '取得指定版本所有類別 AP 指標' }),
    (0, swagger_1.ApiHeader)({ name: 'x-aimaker-session', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, type: aimaker_class_ap_dto_1.AiMakerClassApDto }),
    __param(0, (0, common_1.Headers)('x-aimaker-session')),
    __param(1, (0, common_1.Param)('versionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AiMakerController.prototype, "getClassReport", null);
__decorate([
    (0, common_1.Post)('platform-projects/bind'),
    (0, swagger_1.ApiOperation)({ summary: '建立平台專案並綁定 AIMaker 版本，同步類別清單' }),
    (0, swagger_1.ApiHeader)({ name: 'x-aimaker-session', required: true }),
    (0, swagger_1.ApiBody)({ type: create_platform_project_binding_dto_1.CreatePlatformProjectBindingDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '綁定成功' }),
    __param(0, (0, common_1.Headers)('x-aimaker-session')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_platform_project_binding_dto_1.CreatePlatformProjectBindingDto]),
    __metadata("design:returntype", Promise)
], AiMakerController.prototype, "bindProject", null);
exports.AiMakerController = AiMakerController = __decorate([
    (0, swagger_1.ApiTags)('aimaker-proxy'),
    (0, common_1.Controller)('aimaker'),
    __metadata("design:paramtypes", [aimaker_auth_service_1.AiMakerAuthService,
        aimaker_proxy_service_1.AiMakerProxyService,
        project_binding_service_1.ProjectBindingService])
], AiMakerController);
//# sourceMappingURL=aimaker.controller.js.map