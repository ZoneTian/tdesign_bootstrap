/**
 * 防抖工具函数
 */

// 存储防抖定时器的Map
const debounceTimers = new Map<string, number>();

/**
 * 防抖函数 - 用于函数防抖
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @param key 唯一标识符，用于区分不同的防抖实例
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300,
  key?: string
): (...args: Parameters<T>) => void {
  const debounceKey = key || func.toString();
  
  return function(this: any, ...args: Parameters<T>) {
    // 清除之前的定时器
    const existingTimer = debounceTimers.get(debounceKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // 设置新的定时器
    const timer = setTimeout(() => {
      func.apply(this, args);
      debounceTimers.delete(debounceKey);
    }, delay);
    
    debounceTimers.set(debounceKey, timer);
  };
}

/**
 * 节流函数 - 用于函数节流
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @param key 唯一标识符
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300,
  key?: string
): (...args: Parameters<T>) => void {
  const throttleKey = key || func.toString();
  let lastExecTime = 0;
  
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastExecTime >= delay) {
      lastExecTime = now;
      func.apply(this, args);
    }
  };
}

/**
 * 防抖助手类
 * 提供基于键值的防抖管理
 */
export class DebounceHelper {
  private static timers = new Map<string, number>();

  /**
   * 执行防抖函数
   * @param key 唯一标识符
   * @param func 要执行的函数
   * @param delay 延迟时间，默认300ms
   */
  static execute(key: string, func: () => void | Promise<void>, delay: number = 300): void {
    // 清除之前的定时器
    const existingTimer = DebounceHelper.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的定时器
    const timer = setTimeout(async () => {
      try {
        await func();
      } catch (error) {
        console.error(`防抖执行错误 [${key}]:`, error);
      } finally {
        DebounceHelper.timers.delete(key);
      }
    }, delay);

    DebounceHelper.timers.set(key, timer);
  }

  /**
   * 清除指定键的防抖定时器
   * @param key 要清除的键
   */
  static clear(key: string): void {
    const timer = DebounceHelper.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      DebounceHelper.timers.delete(key);
    }
  }

  /**
   * 清除所有防抖定时器
   */
  static clearAll(): void {
    DebounceHelper.timers.forEach(timer => clearTimeout(timer));
    DebounceHelper.timers.clear();
  }

  /**
   * 获取当前活跃的防抖任务数量
   */
  static getActiveCount(): number {
    return DebounceHelper.timers.size;
  }

  /**
   * 检查指定键是否有活跃的防抖任务
   */
  static isActive(key: string): boolean {
    return DebounceHelper.timers.has(key);
  }
}

/**
 * 页面跳转防抖类
 * 专门用于处理页面跳转的防抖逻辑，包含页面栈管理
 */
export class NavigateDebounce {
  private static lastNavigateTime = 0;
  private static readonly DEFAULT_DELAY = 500; // 默认防抖延迟

  /**
   * 智能页面跳转（自动判断使用 navigateTo 还是 redirectTo）
   * @param url 跳转路径
   * @param delay 防抖延迟时间，默认500ms
   */
  static navigateTo(url: string, delay: number = NavigateDebounce.DEFAULT_DELAY): void {
    const now = Date.now();
    
    if (now - NavigateDebounce.lastNavigateTime < delay) {
      console.log(`页面跳转被防抖拦截: ${url}`);
      return;
    }
    
    NavigateDebounce.lastNavigateTime = now;
    
    // 检查页面栈，智能选择跳转方式
    const pages = getCurrentPages();
    const useRedirect = pages.length >= 8;
    
    if (useRedirect) {
      console.log(`页面栈接近限制(${pages.length}/10)，使用 redirectTo: ${url}`);
      wx.redirectTo({
        url,
        fail: (error) => {
          console.error('页面重定向失败:', error);
          NavigateDebounce.lastNavigateTime = 0;
        }
      });
    } else {
      wx.navigateTo({
        url,
        fail: (error) => {
          console.error('页面跳转失败:', error);
          // 如果 navigateTo 失败且是页面栈问题，尝试 redirectTo
          if (error.errMsg && error.errMsg.includes('limit exceed')) {
            console.log('页面栈溢出，尝试使用 redirectTo');
            wx.redirectTo({ url });
          }
          NavigateDebounce.lastNavigateTime = 0;
        }
      });
    }
  }

  /**
   * 防抖页面重定向
   * @param url 跳转路径
   * @param delay 防抖延迟时间，默认500ms
   */
  static redirectTo(url: string, delay: number = NavigateDebounce.DEFAULT_DELAY): void {
    const now = Date.now();
    
    if (now - NavigateDebounce.lastNavigateTime < delay) {
      console.log(`页面重定向被防抖拦截: ${url}`);
      return;
    }
    
    NavigateDebounce.lastNavigateTime = now;
    
    wx.redirectTo({
      url,
      fail: (error) => {
        console.error('页面重定向失败:', error);
        NavigateDebounce.lastNavigateTime = 0;
      }
    });
  }

  /**
   * 防抖切换Tab页面
   * @param url 页面路径
   * @param delay 防抖延迟时间，默认500ms
   */
  static switchTab(url: string, delay: number = NavigateDebounce.DEFAULT_DELAY): void {
    const now = Date.now();
    
    if (now - NavigateDebounce.lastNavigateTime < delay) {
      console.log(`Tab切换被防抖拦截: ${url}`);
      return;
    }
    
    NavigateDebounce.lastNavigateTime = now;
    
    wx.switchTab({
      url,
      fail: (error) => {
        console.error('Tab切换失败:', error);
        NavigateDebounce.lastNavigateTime = 0;
      }
    });
  }

  /**
   * 防抖返回上一页
   * @param options 返回选项
   * @param delay 防抖延迟时间，默认500ms
   */
  static navigateBack(options?: WechatMiniprogram.NavigateBackOption, delay: number = NavigateDebounce.DEFAULT_DELAY): void {
    const now = Date.now();
    
    if (now - NavigateDebounce.lastNavigateTime < delay) {
      console.log('页面返回被防抖拦截');
      return;
    }
    
    NavigateDebounce.lastNavigateTime = now;
    
    wx.navigateBack({
      ...options,
      fail: (error) => {
        console.error('页面返回失败:', error);
        NavigateDebounce.lastNavigateTime = 0;
      }
    });
  }

  /**
   * 强制使用 navigateTo（不进行页面栈检查）
   * @param url 跳转路径
   * @param delay 防抖延迟时间，默认500ms
   */
  static forceNavigateTo(url: string, delay: number = NavigateDebounce.DEFAULT_DELAY): void {
    const now = Date.now();
    
    if (now - NavigateDebounce.lastNavigateTime < delay) {
      console.log(`强制页面跳转被防抖拦截: ${url}`);
      return;
    }
    
    NavigateDebounce.lastNavigateTime = now;
    
    wx.navigateTo({
      url,
      fail: (error) => {
        console.error('强制页面跳转失败:', error);
        NavigateDebounce.lastNavigateTime = 0;
      }
    });
  }

  /**
   * 获取当前页面栈信息
   */
  static getPageStackInfo(): { current: number; max: number; canNavigate: boolean } {
    const pages = getCurrentPages();
    return {
      current: pages.length,
      max: 10,
      canNavigate: pages.length < 8
    };
  }

  /**
   * 设置防抖延迟时间
   * @param delay 延迟时间（毫秒）
   */
  static setDelay(delay: number): void {
    // 这里可以设置全局默认延迟，但由于是静态只读属性，我们通过参数传递
    console.log(`防抖延迟时间建议设置为: ${delay}ms`);
  }

  /**
   * 重置防抖状态
   */
  static reset(): void {
    NavigateDebounce.lastNavigateTime = 0;
  }
}

/**
 * 防抖装饰器
 * @param delay 延迟时间
 * @param key 可选的唯一标识符
 */
export function DebounceDecorator(delay: number = 300, key?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const debounceKey = key || `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = debounce(method, delay, debounceKey);
    return descriptor;
  };
}

/**
 * 节流装饰器
 * @param delay 延迟时间
 * @param key 可选的唯一标识符
 */
export function ThrottleDecorator(delay: number = 300, key?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const throttleKey = key || `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = throttle(method, delay, throttleKey);
    return descriptor;
  };
}

/**
 * 清除所有防抖和节流定时器
 */
export function clearAllDebounceTimers(): void {
  debounceTimers.forEach(timer => clearTimeout(timer));
  debounceTimers.clear();
  DebounceHelper.clearAll();
}