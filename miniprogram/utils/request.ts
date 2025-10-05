import * as env from "./env";
import { checkAuthorization } from "./funcHelper";
import { getOpenID, getUserID } from "./auth";
import { loginPromise } from '../app';

// 从 env 获取基础 API 地址
const { apiHost } = env.getEnv();

/**
 * 通用请求入参类型
 */
export interface RequestOptions {
  url: string;
  data?: any;
  contentType?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  /**
   * 是否需要用户ID
   */
  needUser?: boolean;
  /**
   * 显式重试次数，默认不重试
   */
  retryCount?: number;
  /**
   * 是否跳过登录等待
   */
  skipLoginWait?: boolean;
}

/**
 * 构建请求头
 */
function buildHeaders(
  contentType: string = "application/json",
  customHeaders?: Record<string, string>
): Record<string, string> {
  const header: Record<string, string> = { "Content-Type": contentType };
  const token = wx.getStorageSync("ACCESS_TOKEN") || "";
  if (token) {
    header.Authorization = `Bearer ${token}`;
    header["api-access-token"] = token; // 添加 api-access-token 请求头
  }
  const open_id = getOpenID() || "";
  if (open_id) {
    header["verify-code"] = open_id;
  }
  if (customHeaders) Object.assign(header, customHeaders);
  return header;
}

/**
 * 基础 request 方法，支持 retryCount
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    data = {},
    contentType = "application/json",
    method = "GET",
    headers,
    retryCount = 0,
    needUser = true
  } = options;

  // 获取用户ID
  let userId = data?.userId ? data.userId : getUserID();
  // 如果用户已登录且有userId，将其添加到请求参数中
  let finalData = { ...data };
  if (userId && needUser) {
    if (method === "GET") {
      // 对于GET请求，将userId添加到URL中
      const separator = url.includes('?') ? '&' : '?';
      options.url = `${url}${separator}userId=${userId}`;
    } else if (needUser) {
      // 对于其他请求方法，将userId添加到请求体中
      finalData = { ...finalData, userId };
    }
  }

  const finalUrl = `${apiHost}${options.url}`;

  return new Promise(async (resolve, reject) => {
    // 等待登录完成 - 如果不是登录请求
    if (!options.skipLoginWait) {
      await loginPromise;
    }

    const attempt = (retriesLeft: number) => {
      // 请求前打印入参
      console.log('【请求开始】', {
        url: finalUrl,
        method,
        headers: buildHeaders(contentType, headers),
        data: finalData,
        timestamp: new Date().toISOString()
      });

      wx.request({
        url: finalUrl,
        data: finalData,
        method,
        header: buildHeaders(contentType, headers),
        success: (res) => {
          // 请求后打印出参
          console.log('【请求成功】', {
            url: finalUrl,
            method,
            statusCode: res.statusCode,
            responseData: res.data,
            timestamp: new Date().toISOString()
          });

          const { statusCode, data: resData } = res;
          if (statusCode === 200) {
            if (
              resData &&
              typeof resData === "object" &&
              (resData as any).code === 401
            ) {
              checkAuthorization({ needRedirect: true }).finally(() => {
                reject(new Error("Unauthorized"));
              });
            } else {
              resolve(resData as T);
            }
          } else if (statusCode === 401) {
            // 未授权自动跳转登录
            checkAuthorization({ needRedirect: true }).finally(() => {
              reject(new Error("Unauthorized"));
            });
          } else if (retriesLeft > 0) {
            attempt(retriesLeft - 1);
          } else {
            reject(new Error(`请求失败：${statusCode}`));
          }
        },
        fail: (err) => {
          if (retriesLeft > 0) {
            attempt(retriesLeft - 1);
          } else {
            wx.showToast({
              title: "网络异常，请检查后重试",
              icon: "none",
              duration: 2000,
            });
            reject(err.errMsg || err);
          }
        },
      });
    };
    attempt(retryCount);
  });
}

/**
 * 2.0: 通用带重试、超时和延迟机制的请求封装
 * @param requestConfig - 同 RequestOptions
 * @param options.maxRetries - 最大重试次数，默认 3
 * @param options.timeout - 单次请求超时时间 ms，默认 5000
 * @param options.delay - 重试等待时间 ms，默认 1000
 * @param options.mockApi - 若提供，将直接返回 mockApi
 */
export async function requestWithRetry<T = any>(
  requestConfig: RequestOptions,
  options: {
    maxRetries?: number;
    timeout?: number;
    delay?: number;
    mockApi?: T;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    timeout = 5000,
    delay = 1000,
    mockApi = null,
  } = options;
  if (mockApi != null) return mockApi;

  // 等待登录完成
  await loginPromise;

  // 超时包装
  const timeoutPromise = (p: Promise<any>) =>
    new Promise<any>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Request timed out")),
        timeout
      );
      p.then((res) => {
        clearTimeout(timer);
        resolve(res);
      }).catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await timeoutPromise(
        request<T>({ ...requestConfig, retryCount: 0 })
      );
      return res;
    } catch (error: any) {
      lastError = error;
      // 检测 401 未授权
      if (error.message === "Unauthorized") {
        await checkAuthorization({ needRedirect: true });
        throw error;
      }
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/**
 * 保持兼容：旧名称 http
 */
export const http = request;

// ========== 使用示例 ==========
// 1) 简单 GET 请求
// request<{ list: any[] }>({ url: '/items', method: 'GET' })
//   .then(res => console.log('列表数据：', res.list))
//   .catch(err => console.error('请求失败：', err));

// 2) 带重试和超时的 POST 请求
// const searchParams = { keyword: '示例' };//
// requestWithRetry<{ data: any[] }>(
//   { url: `/msh/coupon/search?pageNum=1&pageSize=10`, method: 'POST', data: searchParams },
//   { maxRetries: 3, timeout: 5000, delay: 1000 }
// )
//   .then(res => console.log('搜索结果：', res.data))
//   .catch(err => console.error('搜索失败：', err));
