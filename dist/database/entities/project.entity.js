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
exports.Project = void 0;
const typeorm_1 = require("typeorm");
let Project = class Project {
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ comment: '平台專案流水號 ID' }),
    __metadata("design:type", Number)
], Project.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        comment: '專案名稱',
    }),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'aimaker_user_id',
        type: 'int',
        comment: '此專案所屬 AIMaker user id',
    }),
    __metadata("design:type", Number)
], Project.prototype, "aimakerUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'aimaker_version_id',
        type: 'int',
        comment: '此專案綁定 AIMaker version id',
    }),
    __metadata("design:type", Number)
], Project.prototype, "aimakerVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'class_filename',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: 'AIMaker 下載後類別 json 檔名',
    }),
    __metadata("design:type", Object)
], Project.prototype, "classFilename", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'step_filename',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: 'AIMaker 下載後步驟 json 檔名',
    }),
    __metadata("design:type", Object)
], Project.prototype, "stepFilename", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)('project')
], Project);
//# sourceMappingURL=project.entity.js.map