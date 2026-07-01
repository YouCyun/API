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
exports.AiMakerLoginResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AiMakerLoginResponseDto {
}
exports.AiMakerLoginResponseDto = AiMakerLoginResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '後端保存的 AIMaker session token', example: '2f4d9b1b-ef6d-4cce-9b6f-94318fa4e90d' }),
    __metadata("design:type", String)
], AiMakerLoginResponseDto.prototype, "sessionToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'session 過期時間', example: '2026-06-25T03:00:00.000Z' }),
    __metadata("design:type", String)
], AiMakerLoginResponseDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=aimaker-login-response.dto.js.map