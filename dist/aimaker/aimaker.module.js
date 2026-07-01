"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiMakerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiMakerModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const aimaker_auth_service_1 = require("./aimaker-auth.service");
const aimaker_proxy_service_1 = require("./aimaker-proxy.service");
const aimaker_controller_1 = require("./aimaker.controller");
const project_binding_service_1 = require("./project-binding.service");
const entities_1 = require("../database/entities");
let AiMakerModule = AiMakerModule_1 = class AiMakerModule {
    static forRoot() {
        const imports = [
            axios_1.HttpModule.registerAsync({
                useFactory: () => ({
                    timeout: 30_000,
                    headers: {
                        Accept: 'application/json',
                    },
                }),
            }),
            config_1.ConfigModule,
        ];
        const dbType = process.env.DB_TYPE;
        if (dbType !== 'disabled') {
            imports.push(typeorm_1.TypeOrmModule.forFeature([entities_1.Project]));
        }
        const providers = [aimaker_auth_service_1.AiMakerAuthService, aimaker_proxy_service_1.AiMakerProxyService];
        if (dbType !== 'disabled') {
            providers.push(project_binding_service_1.ProjectBindingService);
        }
        return {
            module: AiMakerModule_1,
            imports,
            controllers: [aimaker_controller_1.AiMakerController],
            providers,
            exports: [aimaker_proxy_service_1.AiMakerProxyService],
        };
    }
};
exports.AiMakerModule = AiMakerModule;
exports.AiMakerModule = AiMakerModule = AiMakerModule_1 = __decorate([
    (0, common_1.Module)({})
], AiMakerModule);
//# sourceMappingURL=aimaker.module.js.map