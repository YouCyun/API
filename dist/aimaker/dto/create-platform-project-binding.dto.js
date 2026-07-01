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
exports.CreatePlatformProjectBindingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePlatformProjectBindingDto {
}
exports.CreatePlatformProjectBindingDto = CreatePlatformProjectBindingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '平台專案名稱', example: '水果偵測平台專案' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlatformProjectBindingDto.prototype, "platformProjectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AIMaker 專案 ID', example: 20 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlatformProjectBindingDto.prototype, "aimakerProjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AIMaker 版本 ID', example: 37 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlatformProjectBindingDto.prototype, "aimakerVersionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AIMaker 使用者 ID（creatorId）', example: 2 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlatformProjectBindingDto.prototype, "aimakerUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '類別檔名', example: 'classes_project20_v37.json' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlatformProjectBindingDto.prototype, "classFilename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '步驟檔名', example: 'steps_project20_v37.json' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlatformProjectBindingDto.prototype, "stepFilename", void 0);
//# sourceMappingURL=create-platform-project-binding.dto.js.map