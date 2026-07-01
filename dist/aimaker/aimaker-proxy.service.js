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
var AiMakerProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiMakerProxyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const aimaker_auth_service_1 = require("./aimaker-auth.service");
let AiMakerProxyService = AiMakerProxyService_1 = class AiMakerProxyService {
    constructor(httpService, authService, configService) {
        this.httpService = httpService;
        this.authService = authService;
        this.configService = configService;
        this.logger = new common_1.Logger(AiMakerProxyService_1.name);
        this.baseUrl = this.configService.getOrThrow('AIMAKER_BASE_URL');
    }
    async getProjects(params, sessionToken) {
        return this.makeAuthenticatedRequest({
            method: 'GET',
            url: `${this.baseUrl}/api/projects`,
            params: {
                page: params.page ?? 1,
                limit: params.limit ?? 100,
                taskType: params.taskType ?? 'Object Detection',
            },
        }, sessionToken);
    }
    async getVersionsByProject(projectId, sessionToken) {
        return this.makeAuthenticatedRequest({
            method: 'GET',
            url: `${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/versions`,
        }, sessionToken);
    }
    async getClassApByVersion(versionId, sessionToken) {
        const metrics = await this.makeAuthenticatedRequest({
            method: 'GET',
            url: `${this.baseUrl}/api/versions/${encodeURIComponent(versionId)}/reports/all-class-AP`,
        }, sessionToken);
        return { metrics };
    }
    async makeAuthenticatedRequest(config, sessionToken) {
        const cookie = await this.authService.getAuthenticatedCookie(sessionToken);
        try {
            return await this.executeRequest(config, cookie);
        }
        catch (error) {
            if (this.isAuthError(error)) {
                this.logger.warn(`AIMaker returned ${error.response?.status}, ` +
                    `session may be expired. Invalidating cache and retrying once...`);
                this.authService.invalidateCache(sessionToken);
                const freshCookie = await this.authService.getAuthenticatedCookie(sessionToken);
                return this.executeRequest(config, freshCookie);
            }
            this.throwProxyError(error, config.url ?? 'unknown endpoint');
        }
    }
    async executeRequest(config, cookie) {
        const mergedConfig = {
            ...config,
            headers: {
                ...(config.headers ?? {}),
                Cookie: cookie,
            },
        };
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request(mergedConfig));
        return response.data;
    }
    isAuthError(error) {
        const axiosError = error;
        if (!axiosError?.isAxiosError)
            return false;
        const status = axiosError.response?.status;
        return status === common_1.HttpStatus.UNAUTHORIZED || status === common_1.HttpStatus.FORBIDDEN;
    }
    throwProxyError(error, endpoint) {
        const axiosError = error;
        if (axiosError?.isAxiosError) {
            const upstreamStatus = axiosError.response?.status ?? common_1.HttpStatus.BAD_GATEWAY;
            this.logger.error(`[AiMakerProxyService] Request to ${endpoint} failed: ` +
                `HTTP ${upstreamStatus} - ${axiosError.message}`);
            throw new common_1.HttpException(`AIMaker upstream error on ${endpoint} (status: ${upstreamStatus})`, upstreamStatus);
        }
        this.logger.error(`[AiMakerProxyService] Unexpected error on ${endpoint}: ${String(error)}`);
        throw new common_1.InternalServerErrorException(`Unexpected error when proxying request to AIMaker (${endpoint})`);
    }
};
exports.AiMakerProxyService = AiMakerProxyService;
exports.AiMakerProxyService = AiMakerProxyService = AiMakerProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        aimaker_auth_service_1.AiMakerAuthService,
        config_1.ConfigService])
], AiMakerProxyService);
//# sourceMappingURL=aimaker-proxy.service.js.map