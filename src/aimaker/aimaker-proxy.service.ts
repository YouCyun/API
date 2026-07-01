import {
  Injectable,
  Logger,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { AiMakerAuthService } from './aimaker-auth.service';
import { AiMakerProjectDto } from './dto/aimaker-project.dto';
import { AiMakerVersionDto } from './dto/aimaker-version.dto';
import { AiMakerClassApDto, AiMakerClassMetricDto } from './dto/aimaker-class-ap.dto';

/**
 * AiMakerProxyService
 *
 * 職責：
 *   作為平台後端對 AIMaker 的代理層，負責：
 *   1. 在每次請求前透過 AiMakerAuthService 取得有效 Session Cookie
 *   2. 攜帶 Cookie 向 AIMaker 發送 API 請求
 *   3. 若 AIMaker 回傳 401/403，自動清除快取並重試一次（Token Refresh）
 *   4. 統一處理上游錯誤，轉換為標準 NestJS HttpException
 *
 * 對外暴露的方法對應 AIMaker API：
 *   - getProjects()            → GET /api/projects?taskType=Object+Detection
 *   - getVersionsByProject()   → GET /api/projects/:projectId/versions
 *   - getClassApByVersion()    → GET /api/versions/:versionId/reports/all-class-AP
 */
@Injectable()
export class AiMakerProxyService {
  private readonly logger = new Logger(AiMakerProxyService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AiMakerAuthService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('AIMAKER_BASE_URL');
  }

  // ----------------------------------------------------------------
  // 公開代理方法
  // ----------------------------------------------------------------

  /**
   * 取得 AIMaker 的物件偵測專案列表
   * 對應：GET /api/projects?taskType=Object+Detection
   */
  async getProjects(
    params: { page?: number; limit?: number; taskType?: string },
    sessionToken?: string,
  ): Promise<AiMakerProjectDto[]> {
    return this.makeAuthenticatedRequest<AiMakerProjectDto[]>({
      method: 'GET',
      url: `${this.baseUrl}/api/projects`,
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        taskType: params.taskType ?? 'Object Detection',
      },
    }, sessionToken);
  }

  /**
   * 取得特定 AIMaker 專案的版本列表
   * 對應：GET /api/projects/:projectId/versions
   *
   * @param projectId  AIMaker 端的專案 ID（externalProjectId）
   */
  async getVersionsByProject(projectId: number | string, sessionToken?: string): Promise<AiMakerVersionDto[]> {
    return this.makeAuthenticatedRequest<AiMakerVersionDto[]>({
      method: 'GET',
      url: `${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/versions`,
    }, sessionToken);
  }

  /**
   * 取得特定版本的所有類別 AP 指標
   * 對應：GET /api/versions/:versionId/reports/all-class-AP
   *
   * @param versionId  AIMaker 端的版本 ID（externalVersionId）
   */
  async getClassApByVersion(versionId: number | string, sessionToken?: string): Promise<AiMakerClassApDto> {
    const metrics = await this.makeAuthenticatedRequest<Record<string, AiMakerClassMetricDto>>({
      method: 'GET',
      url: `${this.baseUrl}/api/versions/${encodeURIComponent(versionId)}/reports/all-class-AP`,
    }, sessionToken);
    return { metrics };
  }

  // ----------------------------------------------------------------
  // 核心私有方法
  // ----------------------------------------------------------------

  /**
   * 帶有 Session Cookie 的通用 HTTP 請求執行器。
   *
   * 重試策略：
   *   若 AIMaker 回傳 401 或 403，視為 Session 過期，
   *   自動讓 AuthService 清除快取後重新登入並重試一次。
   *   若重試仍失敗則拋出例外（不再重試，避免無限迴圈）。
   */
  private async makeAuthenticatedRequest<T>(
    config: AxiosRequestConfig,
    sessionToken?: string,
  ): Promise<T> {
    const cookie = await this.authService.getAuthenticatedCookie(sessionToken);

    try {
      return await this.executeRequest<T>(config, cookie);
    } catch (error) {
      if (this.isAuthError(error)) {
        this.logger.warn(
          `AIMaker returned ${(error as AxiosError).response?.status}, ` +
            `session may be expired. Invalidating cache and retrying once...`,
        );
        this.authService.invalidateCache(sessionToken);
        const freshCookie = await this.authService.getAuthenticatedCookie(sessionToken);
        // 第二次不再捕捉 auth 錯誤，直接向上拋出
        return this.executeRequest<T>(config, freshCookie);
      }
      this.throwProxyError(error, config.url ?? 'unknown endpoint');
    }
  }

  /**
   * 執行帶有 Cookie header 的單次 HTTP 請求
   */
  private async executeRequest<T>(config: AxiosRequestConfig, cookie: string): Promise<T> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...(config.headers ?? {}),
        Cookie: cookie,
      },
    };

    const response = await firstValueFrom(this.httpService.request<T>(mergedConfig));
    return response.data;
  }

  /**
   * 判斷 Axios 錯誤是否為身份驗證相關（401 Unauthorized / 403 Forbidden）
   */
  private isAuthError(error: unknown): boolean {
    const axiosError = error as AxiosError;
    if (!axiosError?.isAxiosError) return false;
    const status = axiosError.response?.status;
    return status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN;
  }

  /**
   * 將 Axios 上游錯誤轉換為 NestJS HttpException 並記錄 Log。
   * 回傳型別 `never` 表示此函式一定會拋出例外。
   */
  private throwProxyError(error: unknown, endpoint: string): never {
    const axiosError = error as AxiosError;

    if (axiosError?.isAxiosError) {
      const upstreamStatus = axiosError.response?.status ?? HttpStatus.BAD_GATEWAY;
      this.logger.error(
        `[AiMakerProxyService] Request to ${endpoint} failed: ` +
          `HTTP ${upstreamStatus} - ${axiosError.message}`,
      );
      // 以上游狀態碼回應，讓前端能判斷是 AIMaker 端的問題
      throw new HttpException(
        `AIMaker upstream error on ${endpoint} (status: ${upstreamStatus})`,
        upstreamStatus,
      );
    }

    this.logger.error(
      `[AiMakerProxyService] Unexpected error on ${endpoint}: ${String(error)}`,
    );
    throw new InternalServerErrorException(
      `Unexpected error when proxying request to AIMaker (${endpoint})`,
    );
  }
}
