import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
interface LoginSessionResult {
    sessionToken: string;
    expiresAt: Date;
}
export declare class AiMakerAuthService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly cookieCache;
    private systemCookieCache;
    private readonly ongoingAuthPromise;
    constructor(httpService: HttpService, configService: ConfigService);
    loginAndCreateSession(email: string, password: string): Promise<LoginSessionResult>;
    getAuthenticatedCookie(sessionToken?: string): Promise<string>;
    invalidateCache(sessionToken?: string): void;
    private isCacheValid;
    private performAuthentication;
    private fetchCsrfToken;
    private loginWithCredentials;
    private extractCookieHeader;
    private throwServiceError;
}
export {};
