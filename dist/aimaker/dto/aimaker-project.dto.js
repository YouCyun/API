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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiMakerProjectDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AiMakerProjectDto {
}
exports.AiMakerProjectDto = AiMakerProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AIMaker 專案 ID', example: 20 }),
    __metadata("design:type", Number)
], AiMakerProjectDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '專案名稱', example: 'HSNL_Fruits' }),
    __metadata("design:type", String)
], AiMakerProjectDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '建立者 ID', example: 2 }),
    __metadata("design:type", Number)
], AiMakerProjectDto.prototype, "creatorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '組織 ID', example: 1 }),
    __metadata("design:type", Number)
], AiMakerProjectDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '任務類型',
        example: 'Object Detection',
    }),
    __metadata("design:type", String)
], AiMakerProjectDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'CVAT Organization ID', example: 15, required: false }),
    __metadata("design:type", Object)
], AiMakerProjectDto.prototype, "CVATOrganizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'CVAT Organization Slug', example: '7b3u9bvky8jbpl7a', required: false }),
    __metadata("design:type", Object)
], AiMakerProjectDto.prototype, "CVATOrganizationSlug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '聲音平台專案 ID', example: null, required: false }),
    __metadata("design:type", Object)
], AiMakerProjectDto.prototype, "soundPlatformProjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '建立時間 (ISO 8601)', example: '2024-01-15T08:00:00.000Z' }),
    __metadata("design:type", String)
], AiMakerProjectDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '最後更新時間 (ISO 8601)', example: '2024-06-01T12:00:00.000Z' }),
    __metadata("design:type", String)
], AiMakerProjectDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=aimaker-project.dto.js.map