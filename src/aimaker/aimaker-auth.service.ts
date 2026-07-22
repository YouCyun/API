import {
  Injectable,
  Logger,
  InternalServerErrorException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { UserMapping } from '../database/entities/user-mapping.entity';

// ------------------------------------------------------------------
// 內部型別定義
// ------------------------------------------------------------------

/** 後端記憶體中保存的 AIMaker Session 快取結構 */
interface CookieCache {
  /** 串接好的 Cookie header 字串，可直接放入 `Cookie: ...` header */
  cookieString: string;
  /** 快取過期時間（含 60 秒安全緩衝） */
  expiresAt: Date;
}

interface LoginSessionResult {
  sessionToken: string;
  expiresAt: Date;
}

// ------------------------------------------------------------------
// Service
// ------------------------------------------------------------------

/**
 * AiMakerAuthService
 *
 * 職責：
 *   1. 向 AIMaker (NextAuth.js) 完成兩步驟登入流程
 *      - Step 1: GET  /api/auth/csrf         → 取得 CSRF Token + CSRF Cookie
 *      - Step 2: POST /api/auth/callback/credentials → 取得 Session Cookie
 *   2. 將 Session Cookie 保存在後端記憶體，作為後續所有代理請求的身份憑證
 *   3. 自動偵測過期並重新驗證（含 Concurrent 並發保護）
 *
 * 安全考量：
 *   - 帳密僅從環境變數讀取，不可寫死或暴露於 Log
 *   - Cookie 字串不記錄在 Log 中
 */
@Injectable()
export class AiMakerAuthService {
  private readonly logger = new Logger(AiMakerAuthService.name);

  private readonly baseUrl: string;

  /** 多使用者 session 快取（sessionToken -> cookie） */
  private readonly cookieCache = new Map<string, CookieCache>();

  /** 預設帳密模式快取（當 sessionToken 未提供時使用） */
  private systemCookieCache: CookieCache | null = null;

  /**
   * 並發保護：若已有驗證請求正在進行，
   * 後續進來的請求會等待同一個 Promise，而非同時發起多次登入。
   */
  private readonly ongoingAuthPromise = new Map<string, Promise<string>>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Optional() @InjectRepository(UserMapping)
    private readonly userMappingRepo: Repository<UserMapping> | undefined,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('AIMAKER_BASE_URL');
  }

  // ----------------------------------------------------------------
  // 公開方法
  // ----------------------------------------------------------------

  /**
   * 取得有效的 AIMaker Session Cookie 字串。
   *
   * - 快取有效時直接回傳，不發任何 HTTP 請求
   * - 快取過期或不存在時自動重新驗證
   * - 並發請求會共用同一次驗證流程（避免重複登入）
   */
  async loginAndCreateSession(email: string, password: string): Promise<LoginSessionResult & { userId: number }> {
    const cache = await this.performAuthentication(email, password);
    const sessionToken = randomUUID();

    const userInfo = await this.fetchAIMakerUserInfo(cache.cookieString);
    const userId = await this.syncUserMapping(userInfo);

    this.cookieCache.set(sessionToken, cache);
    this.logger.log(`[Cache] Stored session token: ${sessionToken}`);
    this.logger.log(`[Cache] Current cache size: ${this.cookieCache.size}`);
    return {
      sessionToken,
      expiresAt: cache.expiresAt,
      userId,
    };
  }

  async getAuthenticatedCookie(sessionToken?: string): Promise<string> {
    if (sessionToken) {
      this.logger.log(`[Cache] Looking up session token: ${sessionToken}`);
      this.logger.log(`[Cache] Cache size: ${this.cookieCache.size}, Contains token: ${this.cookieCache.has(sessionToken)}`);
      const cached = this.cookieCache.get(sessionToken);
      if (!cached) {
        this.logger.error(`[Cache] Session token not found in cache`);
        throw new UnauthorizedException('AIMaker session is missing or expired. Please login again.');
      }
      if (!this.isCacheValid(cached)) {
        this.logger.error(`[Cache] Session token expired. ExpiresAt: ${cached.expiresAt.toISOString()}, Now: ${new Date().toISOString()}`);
        throw new UnauthorizedException('AIMaker session is missing or expired. Please login again.');
      }
      this.logger.log(`[Cache] Session token valid, returning cookie`);
      return cached.cookieString;
    }

    if (this.systemCookieCache && this.isCacheValid(this.systemCookieCache)) {
      return this.systemCookieCache.cookieString;
    }

    const email = this.configService.get<string>('AIMAKER_EMAIL');
    const password = this.configService.get<string>('AIMAKER_PASSWORD');
    if (!email || !password) {
      throw new UnauthorizedException('Missing AIMAKER_EMAIL/AIMAKER_PASSWORD. Please login via /aimaker/auth/login.');
    }

    const cache = await this.performAuthentication(email, password);
    this.systemCookieCache = cache;
    return cache.cookieString;
  }

  invalidateCache(sessionToken?: string): void {
    if (sessionToken) {
      this.cookieCache.delete(sessionToken);
      this.ongoingAuthPromise.delete(sessionToken);
      return;
    }
    this.systemCookieCache = null;
    this.logger.warn('AIMaker session cache invalidated. Will re-authenticate on next request.');
  }

  private ensureUserMappingAvailable(): void {
    if (!this.userMappingRepo) {
      throw new InternalServerErrorException(
        'User mapping repository is not available. Ensure DB_TYPE is not disabled.',
      );
    }
  }

  private async syncUserMapping(userInfo: { aimakerUserId: number; username: string }): Promise<number> {
    this.ensureUserMappingAvailable();

    let mapping = await this.userMappingRepo!.findOne({
      where: { aimakerUserId: userInfo.aimakerUserId },
    });

    if (!mapping) {
      mapping = this.userMappingRepo!.create({
        aimakerUserId: userInfo.aimakerUserId,
        username: userInfo.username,
      });
      mapping = await this.userMappingRepo!.save(mapping);
    }

    return mapping.userId;
  }

  private async fetchAIMakerUserInfo(cookie: string): Promise<{ aimakerUserId: number; username: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ user?: Record<string, any> }>(
          `${this.baseUrl}/api/auth/session`,
          {
            headers: {
              Cookie: cookie,
            },
          },
        ),
      );

      const user = response.data?.user;
      if (!user) {
        throw new InternalServerErrorException(
          'Unable to resolve AIMaker user info from /api/auth/session response.',
        );
      }

      const rawUserId = user.id ?? user.userId ?? user.creatorId;
      const aimakerUserId = Number(rawUserId);
      if (!Number.isFinite(aimakerUserId) || aimakerUserId <= 0) {
        throw new InternalServerErrorException(
          'AIMaker user id is missing or invalid in session response.',
        );
      }

        const username = String(user.email ?? user.name ?? user.username ?? aimakerUserId);
      return {
        aimakerUserId,
        username,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('[AiMakerAuthService] Failed to fetch AIMaker user info from session.', error as Error);
      throw new InternalServerErrorException(
        'Failed to retrieve AIMaker user information after login.',
      );
    }
  }

  // ----------------------------------------------------------------
  // 私有方法
  // ----------------------------------------------------------------

  private isCacheValid(cache: CookieCache): boolean {
    // 提前 60 秒視為過期，避免邊界條件下 Cookie 恰好失效
    const BUFFER_MS = 60_000;
    return new Date(cache.expiresAt.getTime() - BUFFER_MS) > new Date();
  }

  /**
   * 執行完整的 AIMaker 兩步驟登入流程
   */
  private async performAuthentication(email: string, password: string): Promise<CookieCache> {
    this.logger.log('Starting AIMaker authentication (NextAuth.js credentials flow)...');

    // Step 1: 取得 CSRF Token
    const { csrfToken, csrfCookie } = await this.fetchCsrfToken();

    // Step 2: 使用帳密 + CSRF Token 登入，取得 Session Cookie
    const fullCookie = await this.loginWithCredentials(csrfToken, csrfCookie, email, password);

    // 寫入快取
    const ttlMs = parseInt(
      this.configService.get<string>(
        'AIMAKER_SESSION_TTL_MS',
        String(23 * 60 * 60 * 1000), // 預設 23 小時
      ),
      10,
    );
    const cache: CookieCache = {
      cookieString: fullCookie,
      expiresAt: new Date(Date.now() + ttlMs),
    };

    this.logger.log(
      `AIMaker authentication successful. Session cached until ${cache.expiresAt.toISOString()}`,
    );
    return cache;
  }

  /**
   * Step 1: GET /api/auth/csrf
   * 回傳 csrfToken（放入後續 POST body）以及 CSRF Cookie（放入後續 POST Cookie header）
   */
  private async fetchCsrfToken(): Promise<{ csrfToken: string; csrfCookie: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ csrfToken: string }>(`${this.baseUrl}/api/auth/csrf`),
      );

      const csrfToken = response.data?.csrfToken;
      if (!csrfToken) {
        throw new InternalServerErrorException(
          'csrfToken field missing from AIMaker /api/auth/csrf response',
        );
      }

      const csrfCookie = this.extractCookieHeader(response.headers['set-cookie']);
      this.logger.debug('Step 1/2: CSRF token acquired successfully.');
      return { csrfToken, csrfCookie };
    } catch (error) {
      // 若是我們自己拋的 NestJS 例外，直接向上傳播
      if (error instanceof InternalServerErrorException) throw error;
      return this.throwServiceError(error, 'Step 1 - fetch CSRF token');
    }
  }

  /**
   * Step 2: POST /api/auth/callback/credentials
   *
   * NextAuth.js Credentials Provider 登入流程：
   *   - Content-Type: application/x-www-form-urlencoded
  *   - Body 含 csrfToken、email、password、redirect、json、callbackUrl
   *   - 需帶上 Step 1 取得的 CSRF Cookie
   *   - 設定 maxRedirects: 0 以直接擷取 302 回應中的 Set-Cookie header
   *     （若 AIMaker 設定回傳 JSON 而非重導向，此處仍可正常取得 Cookie）
   */
  private async loginWithCredentials(
    csrfToken: string,
    csrfCookie: string,
    email: string,
    password: string,
  ): Promise<string> {
    // 使用 URLSearchParams 確保特殊字元正確 URL 編碼
    const formBody = new URLSearchParams({
      csrfToken,
      email,
      password,
      redirect: 'false',
      json: 'true', // 告知 NextAuth 回傳 JSON，避免 HTML 重導向
      callbackUrl: this.baseUrl,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/api/auth/callback/credentials`,
          formBody.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Cookie: csrfCookie,
            },
            // 不自動跟隨重導向，以便直接讀取 302 回應的 Set-Cookie header
            maxRedirects: 0,
            // 允許 2xx 與 302（NextAuth 成功後會 302 重導向）
            validateStatus: (status) =>
              (status >= 200 && status < 300) || status === 302,
          },
        ),
      );

      // 檢查回應 body 是否包含錯誤訊息（NextAuth 在某些設定下會回傳 JSON error）
      if (
        response.data &&
        typeof response.data === 'object' &&
        'error' in response.data &&
        response.data.error
      ) {
        throw new UnauthorizedException(
          `AIMaker authentication rejected: ${String(response.data.error)}`,
        );
      }

      const sessionCookies = this.extractCookieHeader(response.headers['set-cookie']);
      if (!sessionCookies) {
        throw new UnauthorizedException(
          'No Set-Cookie header in AIMaker login response. ' +
            'Please verify AIMAKER_EMAIL and AIMAKER_PASSWORD.',
        );
      }

      // 合併 CSRF Cookie + Session Cookie，後續請求一起帶上
      const fullCookie = [csrfCookie, sessionCookies].filter(Boolean).join('; ');
      this.logger.debug('Step 2/2: Session cookie acquired successfully.');
      return fullCookie;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      return this.throwServiceError(error, 'Step 2 - login with credentials');
    }
  }

  /**
   * 從 Set-Cookie response header 組合成可直接使用的 Cookie request header 字串。
   *
   * Set-Cookie 格式範例：
   *   "next-auth.csrf-token=abc|hash; Path=/; HttpOnly; SameSite=Lax"
   * 只取 name=value 部分，捨棄 Path/Expires/HttpOnly 等屬性。
   */
  private extractCookieHeader(setCookieHeader: string | string[] | undefined): string {
    if (!setCookieHeader) return '';

    const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

    return headers
      .map((header) => header.split(';')[0].trim()) // 只保留 name=value
      .filter(Boolean)
      .join('; ');
  }

  /**
   * 統一的 Axios 錯誤處理，轉換為 NestJS 例外並記錄 Log。
   * 回傳型別 `never` 表示此函式一定會拋出例外。
   */
  private throwServiceError(error: unknown, context: string): never {
    const axiosError = error as AxiosError;
    if (axiosError?.isAxiosError) {
      const status = axiosError.response?.status ?? 'network error';
      // 刻意不記錄 Cookie 或密碼相關資訊
      this.logger.error(`[AiMakerAuthService] ${context} failed: HTTP ${status}`);
      throw new InternalServerErrorException(
        `AIMaker service unreachable during ${context} (HTTP ${status})`,
      );
    }
    this.logger.error(`[AiMakerAuthService] ${context} failed: ${String(error)}`);
    throw new InternalServerErrorException(`Unexpected error during AIMaker ${context}`);
  }
}
