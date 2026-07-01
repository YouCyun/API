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
exports.AiMakerClassApDto = exports.AiMakerClassMetricDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AiMakerClassMetricDto {
}
exports.AiMakerClassMetricDto = AiMakerClassMetricDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '精確率 (Precision)', example: 0.955 }),
    __metadata("design:type", Number)
], AiMakerClassMetricDto.prototype, "precision", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '召回率 (Recall)', example: 1 }),
    __metadata("design:type", Number)
], AiMakerClassMetricDto.prototype, "recall", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'F1', example: 0.977 }),
    __metadata("design:type", Number)
], AiMakerClassMetricDto.prototype, "f1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'mAP',
        example: 0.995,
    }),
    __metadata("design:type", Number)
], AiMakerClassMetricDto.prototype, "mAP", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'conf threshold（僅 all 類別通常會有）',
        example: 0.393,
        required: false,
    }),
    __metadata("design:type", Number)
], AiMakerClassMetricDto.prototype, "conf_threshold", void 0);
class AiMakerClassApDto {
}
exports.AiMakerClassApDto = AiMakerClassApDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'object',
        additionalProperties: {
            type: 'object',
            properties: {
                precision: { type: 'number' },
                recall: { type: 'number' },
                f1: { type: 'number' },
                mAP: { type: 'number' },
                conf_threshold: { type: 'number' },
            },
        },
        example: {
            pen: { precision: 1, recall: 0.96, f1: 0.98, mAP: 0.995 },
            all: { precision: 0.95, recall: 0.92, f1: 0.93, mAP: 0.929, conf_threshold: 0.393 },
        },
    }),
    __metadata("design:type", Object)
], AiMakerClassApDto.prototype, "metrics", void 0);
//# sourceMappingURL=aimaker-class-ap.dto.js.map