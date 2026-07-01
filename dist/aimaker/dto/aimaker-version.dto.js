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
exports.AiMakerVersionDto = exports.AiMakerVersionCreatorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AiMakerVersionCreatorDto {
}
exports.AiMakerVersionCreatorDto = AiMakerVersionCreatorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], AiMakerVersionCreatorDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Admin HSNL' }),
    __metadata("design:type", String)
], AiMakerVersionCreatorDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'device@hsnl.cs.nthu.edu.tw' }),
    __metadata("design:type", String)
], AiMakerVersionCreatorDto.prototype, "email", void 0);
class AiMakerVersionDto {
}
exports.AiMakerVersionDto = AiMakerVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AIMaker 版本 ID', example: 37 }),
    __metadata("design:type", Number)
], AiMakerVersionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所屬 AIMaker 專案 ID', example: 20 }),
    __metadata("design:type", Number)
], AiMakerVersionDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本編號', example: 7 }),
    __metadata("design:type", Number)
], AiMakerVersionDto.prototype, "versionNum", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '建立者 ID', example: 1 }),
    __metadata("design:type", Number)
], AiMakerVersionDto.prototype, "creatorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID', example: 101, required: false }),
    __metadata("design:type", Object)
], AiMakerVersionDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dataset ID', example: 118 }),
    __metadata("design:type", Number)
], AiMakerVersionDto.prototype, "datasetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '訓練狀態',
        example: 'Finish',
    }),
    __metadata("design:type", String)
], AiMakerVersionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本建立時間 (ISO 8601)', example: '2024-03-10T09:30:00.000Z' }),
    __metadata("design:type", String)
], AiMakerVersionDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本更新時間 (ISO 8601)', example: '2024-03-10T12:00:00.000Z' }),
    __metadata("design:type", String)
], AiMakerVersionDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AiMakerVersionCreatorDto, required: false }),
    __metadata("design:type", AiMakerVersionCreatorDto)
], AiMakerVersionDto.prototype, "creator", void 0);
//# sourceMappingURL=aimaker-version.dto.js.map