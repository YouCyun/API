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
var AiMakerAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiMakerAuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const crypto_1 = require("crypto");
let AiMakerAuthService = AiMakerAuthService_1 = class AiMakerAuthService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(AiMakerAuthService_1.name);
        this.cookieCache = new Map();
        this.systemCookieCache = null;
        this.ongoingAuthPromise = new Map();
        this.baseUrl = this.configService.getOrThrow('AIMAKER_BASE_URL');
    }
    async loginAndCreateSession(email, password) {
        const cache = await this.performAuthentication(email, password);
        const sessionToken = (0, crypto_1.randomUUID)();
        this.cookieCache.set(sessionToken, cache);
        this.logger.log(`[Cache] Stored session token: ${sessionToken}`);
        this.logger.log(`[Cache] Current cache size: ${this.cookieCache.size}`);
        return {
            sessionToken,
            expiresAt: cache.expiresAt,
        };
    }
    async getAuthenticatedCookie(sessionToken) {
        if (sessionToken) {
            this.logger.log(`[Cache] Looking up session token: ${sessionToken}`);
            this.logger.log(`[Cache] Cache size: ${this.cookieCache.size}, Contains token: ${this.cookieCache.has(sessionToken)}`);
            const cached = this.cookieCache.get(sessionToken);
            if (!cached) {
                this.logger.error(`[Cache] Session token not found in cache`);
                throw new common_1.UnauthorizedException('AIMaker session is missing or expired. Please login again.');
            }
            if (!this.isCacheValid(cached)) {
                this.logger.error(`[Cache] Session token expired. ExpiresAt: ${cached.expiresAt.toISOString()}, Now: ${new Date().toISOString()}`);
                throw new common_1.UnauthorizedException('AIMaker session is missing or expired. Please login again.');
            }
            this.logger.log(`[Cache] Session token valid, returning cookie`);
            return cached.cookieString;
        }
        if (this.systemCookieCache && this.isCacheValid(this.systemCookieCache)) {
            return this.systemCookieCache.cookieString;
        }
        const email = this.configService.get('AIMAKER_EMAIL');
        const password = this.configService.get('AIMAKER_PASSWORD');
        if (!email || !password) {
            throw new common_1.UnauthorizedException('Missing AIMAKER_EMAIL/AIMAKER_PASSWORD. Please login via /aimaker/auth/login.');
        }
        const cache = await this.performAuthentication(email, password);
        this.systemCookieCache = cache;
        return cache.cookieString;
    }
    invalidateCache(sessionToken) {
        if (sessionToken) {
            this.cookieCache.delete(sessionToken);
            this.ongoingAuthPromise.delete(sessionToken);
            return;
        }
        this.systemCookieCache = null;
        this.logger.warn('AIMaker session cache invalidated. Will re-authenticate on next request.');
    }
    isCacheValid(cache) {
        const BUFFER_MS = 60_000;
        return new Date(cache.expiresAt.getTime() - BUFFER_MS) > new Date();
    }
    async performAuthentication(email, password) {
        this.logger.log('Starting AIMaker authentication (NextAuth.js credentials flow)...');
        const { csrfToken, csrfCookie } = await this.fetchCsrfToken();
        const fullCookie = await this.loginWithCredentials(csrfToken, csrfCookie, email, password);
        const ttlMs = parseInt(this.configService.get('AIMAKER_SESSION_TTL_MS', String(23 * 60 * 60 * 1000)), 10);
        const cache = {
            cookieString: fullCookie,
            expiresAt: new Date(Date.now() + ttlMs),
        };
        this.logger.log(`AIMaker authentication successful. Session cached until ${cache.expiresAt.toISOString()}`);
        return cache;
    }
    async fetchCsrfToken() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/auth/csrf`));
            const csrfToken = response.data?.csrfToken;
            if (!csrfToken) {
                throw new common_1.InternalServerErrorException('csrfToken field missing from AIMaker /api/auth/csrf response');
            }
            const csrfCookie = this.extractCookieHeader(response.headers['set-cookie']);
            this.logger.debug('Step 1/2: CSRF token acquired successfully.');
            return { csrfToken, csrfCookie };
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException)
                throw error;
            return this.throwServiceError(error, 'Step 1 - fetch CSRF token');
        }
    }
    async loginWithCredentials(csrfToken, csrfCookie, email, password) {
        const formBody = new URLSearchParams({
            csrfToken,
            email,
            password,
            redirect: 'false',
            json: 'true',
            callbackUrl: this.baseUrl,
        });
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/auth/callback/credentials`, formBody.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: csrfCookie,
                },
                maxRedirects: 0,
                validateStatus: (status) => (status >= 200 && status < 300) || status === 302,
            }));
            if (response.data &&
                typeof response.data === 'object' &&
                'error' in response.data &&
                response.data.error) {
                throw new common_1.UnauthorizedException(`AIMaker authentication rejected: ${String(response.data.error)}`);
            }
            const sessionCookies = this.extractCookieHeader(response.headers['set-cookie']);
            if (!sessionCookies) {
                throw new common_1.UnauthorizedException('No Set-Cookie header in AIMaker login response. ' +
                    'Please verify AIMAKER_EMAIL and AIMAKER_PASSWORD.');
            }
            const fullCookie = [csrfCookie, sessionCookies].filter(Boolean).join('; ');
            this.logger.debug('Step 2/2: Session cookie acquired successfully.');
            return fullCookie;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            return this.throwServiceError(error, 'Step 2 - login with credentials');
        }
    }
    extractCookieHeader(setCookieHeader) {
        if (!setCookieHeader)
            return '';
        const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
        return headers
            .map((header) => header.split(';')[0].trim())
            .filter(Boolean)
            .join('; ');
    }
    throwServiceError(error, context) {
        const axiosError = error;
        if (axiosError?.isAxiosError) {
            const status = axiosError.response?.status ?? 'network error';
            this.logger.error(`[AiMakerAuthService] ${context} failed: HTTP ${status}`);
            throw new common_1.InternalServerErrorException(`AIMaker service unreachable during ${context} (HTTP ${status})`);
        }
        this.logger.error(`[AiMakerAuthService] ${context} failed: ${String(error)}`);
        throw new common_1.InternalServerErrorException(`Unexpected error during AIMaker ${context}`);
    }
};
exports.AiMakerAuthService = AiMakerAuthService;
exports.AiMakerAuthService = AiMakerAuthService = AiMakerAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], AiMakerAuthService);
//# sourceMappingURL=aimaker-auth.service.js.map