/**
 * 防抖工具单元测试
 */

import { debounce, throttle, DebounceHelper, NavigateDebounce } from '../../utils/debounce';

// 模拟微信小程序 API
const mockWx = {
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),
};

// 将 mockWx 挂载到全局
(global as any).wx = mockWx;

describe('防抖工具测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // 清理防抖定时器
    DebounceHelper.clearAll();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('debounce 函数测试', () => {
    test('应该在指定延迟后执行函数', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('应该取消之前的调用并重新计时', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn();
      jest.advanceTimersByTime(200);
      debouncedFn(); // 重新触发，应该重置计时器

      jest.advanceTimersByTime(200);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('应该传递正确的参数', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('应该保持正确的 this 上下文', () => {
      const obj = {
        value: 'test',
        method: function(this: any) {
          return this.value;
        }
      };

      const debouncedMethod = debounce(obj.method, 300);
      obj.debouncedMethod = debouncedMethod;

      let result: any;
      obj.method = function(this: any) {
        result = this.value;
      };
      obj.debouncedMethod = debounce(obj.method, 300);

      obj.debouncedMethod();
      jest.advanceTimersByTime(300);

      expect(result).toBe('test');
    });
  });

  describe('throttle 函数测试', () => {
    test('应该在指定时间间隔内只执行一次', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 300);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      throttledFn();
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(300);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    test('应该传递最新的参数', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 300);

      throttledFn('first');
      expect(mockFn).toHaveBeenCalledWith('first');

      jest.advanceTimersByTime(300);
      throttledFn('second');
      expect(mockFn).toHaveBeenCalledWith('second');
    });
  });

  describe('DebounceHelper 测试', () => {
    test('execute 方法应该正确防抖', () => {
      const mockFn = jest.fn();

      DebounceHelper.execute('test-key', mockFn, 300);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('相同 key 的多次调用应该重置计时器', () => {
      const mockFn = jest.fn();

      DebounceHelper.execute('test-key', mockFn, 300);
      jest.advanceTimersByTime(200);
      
      DebounceHelper.execute('test-key', mockFn, 300);
      jest.advanceTimersByTime(200);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('不同 key 的调用应该独立执行', () => {
      const mockFn1 = jest.fn();
      const mockFn2 = jest.fn();

      DebounceHelper.execute('key1', mockFn1, 300);
      DebounceHelper.execute('key2', mockFn2, 300);

      jest.advanceTimersByTime(300);
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledTimes(1);
    });

    test('clear 方法应该清除指定的防抖定时器', () => {
      const mockFn = jest.fn();

      DebounceHelper.execute('test-key', mockFn, 300);
      DebounceHelper.clear('test-key');

      jest.advanceTimersByTime(300);
      expect(mockFn).not.toHaveBeenCalled();
    });

    test('clearAll 方法应该清除所有防抖定时器', () => {
      const mockFn1 = jest.fn();
      const mockFn2 = jest.fn();

      DebounceHelper.execute('key1', mockFn1, 300);
      DebounceHelper.execute('key2', mockFn2, 300);
      DebounceHelper.clearAll();

      jest.advanceTimersByTime(300);
      expect(mockFn1).not.toHaveBeenCalled();
      expect(mockFn2).not.toHaveBeenCalled();
    });

    test('应该支持异步函数', async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue('result');

      DebounceHelper.execute('async-key', mockAsyncFn, 300);
      jest.advanceTimersByTime(300);

      // 等待异步函数执行
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('NavigateDebounce 测试', () => {
    test('navigateTo 应该防抖调用 wx.navigateTo', () => {
      NavigateDebounce.navigateTo('/pages/test/test');
      expect(mockWx.navigateTo).toHaveBeenCalledTimes(1);
      expect(mockWx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/test/test'
      });

      // 快速连续调用应该被防抖
      NavigateDebounce.navigateTo('/pages/test2/test2');
      expect(mockWx.navigateTo).toHaveBeenCalledTimes(1);
    });

    test('redirectTo 应该防抖调用 wx.redirectTo', () => {
      NavigateDebounce.redirectTo('/pages/test/test');
      expect(mockWx.redirectTo).toHaveBeenCalledTimes(1);

      NavigateDebounce.redirectTo('/pages/test2/test2');
      expect(mockWx.redirectTo).toHaveBeenCalledTimes(1);
    });

    test('switchTab 应该防抖调用 wx.switchTab', () => {
      NavigateDebounce.switchTab('/pages/home/home');
      expect(mockWx.switchTab).toHaveBeenCalledTimes(1);

      NavigateDebounce.switchTab('/pages/profile/profile');
      expect(mockWx.switchTab).toHaveBeenCalledTimes(1);
    });

    test('navigateBack 应该防抖调用 wx.navigateBack', () => {
      NavigateDebounce.navigateBack();
      expect(mockWx.navigateBack).toHaveBeenCalledTimes(1);

      NavigateDebounce.navigateBack({ delta: 2 });
      expect(mockWx.navigateBack).toHaveBeenCalledTimes(1);
    });

    test('setDelay 应该更新防抖延迟时间', () => {
      NavigateDebounce.setDelay(1000);

      NavigateDebounce.navigateTo('/pages/test/test');
      NavigateDebounce.navigateTo('/pages/test2/test2');

      expect(mockWx.navigateTo).toHaveBeenCalledTimes(1);

      // 等待原来的延迟时间（500ms）
      jest.advanceTimersByTime(500);
      NavigateDebounce.navigateTo('/pages/test3/test3');
      expect(mockWx.navigateTo).toHaveBeenCalledTimes(1);

      // 等待新的延迟时间（1000ms）
      jest.advanceTimersByTime(1000);
      NavigateDebounce.navigateTo('/pages/test4/test4');
      expect(mockWx.navigateTo).toHaveBeenCalledTimes(2);
    });

    test('应该传递额外的选项参数', () => {
      const options = {
        success: jest.fn(),
        fail: jest.fn()
      };

      NavigateDebounce.navigateTo('/pages/test/test', options);
      expect(mockWx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/test/test',
        ...options
      });
    });
  });

  describe('边界情况测试', () => {
    test('延迟时间为 0 应该立即执行', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn();
      jest.advanceTimersByTime(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('负数延迟时间应该立即执行', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, -100);

      debouncedFn();
      jest.advanceTimersByTime(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('空字符串 key 应该正常工作', () => {
      const mockFn = jest.fn();

      DebounceHelper.execute('', mockFn, 300);
      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('undefined key 应该使用函数字符串作为 key', () => {
      const mockFn = jest.fn();

      DebounceHelper.execute(undefined as any, mockFn, 300);
      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('性能测试', () => {
    test('大量防抖调用应该不会造成内存泄漏', () => {
      const mockFn = jest.fn();

      // 创建大量防抖调用
      for (let i = 0; i < 1000; i++) {
        DebounceHelper.execute(`key-${i}`, mockFn, 300);
      }

      // 清理所有定时器
      DebounceHelper.clearAll();

      // 验证没有函数被执行
      jest.advanceTimersByTime(300);
      expect(mockFn).not.toHaveBeenCalled();
    });

    test('频繁的防抖调用应该只执行最后一次', () => {
      const mockFn = jest.fn();

      // 快速连续调用 100 次
      for (let i = 0; i < 100; i++) {
        DebounceHelper.execute('test-key', mockFn, 300);
      }

      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});