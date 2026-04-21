/**
 * 带认证的 API 客户端
 * 自动从 StorageService 读取 token，未登录或 token 过期时引导重新登录
 */

import { ApiClientService } from "./api-client.service.js";
import { createStorageService } from "../storage/index.js";
import { AuthError } from "../../errors/index.js";

export class AuthenticatedApiClient {
  private client: ApiClientService;
  private tokenLoaded = false;

  constructor() {
    this.client = new ApiClientService();
  }

  /**
   * 确保已加载 token，未登录则抛出 AuthError
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.tokenLoaded && this.client.isTokenSet()) return;

    const storage = createStorageService();
    const token = await storage.getToken();

    if (!token) {
      throw new AuthError("请先运行 r2 auth login 登录");
    }

    this.client.setToken(token);
    this.tokenLoaded = true;
  }

  /**
   * 401 后清除本地凭证，提示重新登录
   */
  private async onAuthExpired(): Promise<void> {
    this.tokenLoaded = false;
    this.client.setToken(null);
    const storage = createStorageService();
    await storage.clearCredentials();
  }

  async get<T = unknown>(path: string, params?: URLSearchParams): Promise<T> {
    await this.ensureAuthenticated();
    try {
      return await this.client.get<T>(path, params);
    } catch (error) {
      if (error instanceof AuthError) {
        await this.onAuthExpired();
        throw new AuthError("登录已过期，请运行 r2 auth login 重新登录");
      }
      throw error;
    }
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    await this.ensureAuthenticated();
    try {
      return await this.client.post<T>(path, body);
    } catch (error) {
      if (error instanceof AuthError) {
        await this.onAuthExpired();
        throw new AuthError("登录已过期，请运行 r2 auth login 重新登录");
      }
      throw error;
    }
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    await this.ensureAuthenticated();
    try {
      return await this.client.put<T>(path, body);
    } catch (error) {
      if (error instanceof AuthError) {
        await this.onAuthExpired();
        throw new AuthError("登录已过期，请运行 r2 auth login 重新登录");
      }
      throw error;
    }
  }

  async delete<T = unknown>(path: string): Promise<T> {
    await this.ensureAuthenticated();
    try {
      return await this.client.delete<T>(path);
    } catch (error) {
      if (error instanceof AuthError) {
        await this.onAuthExpired();
        throw new AuthError("登录已过期，请运行 r2 auth login 重新登录");
      }
      throw error;
    }
  }
}
