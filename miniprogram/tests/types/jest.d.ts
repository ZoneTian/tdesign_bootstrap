/**
 * Jest 类型定义文件
 */

declare global {
  const jest: {
    fn: (implementation?: (...args: any[]) => any) => jest.MockedFunction<any>;
    clearAllMocks: () => void;
    clearAllTimers: () => void;
    useFakeTimers: () => void;
    useRealTimers: () => void;
    advanceTimersByTime: (msToRun: number) => void;
    runOnlyPendingTimers: () => void;
    restoreAllMocks: () => void;
    setTimeout: (timeout: number) => void;
  };

  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;

  const describe: (name: string, fn: () => void) => void;
  const test: (name: string, fn: () => void | Promise<void>) => void;
  const it: (name: string, fn: () => void | Promise<void>) => void;

  const expect: (actual: any) => {
    toBe: (expected: any) => void;
    toEqual: (expected: any) => void;
    toBeGreaterThan: (expected: number) => void;
    toBeLessThan: (expected: number) => void;
    toBeGreaterThanOrEqual: (expected: number) => void;
    toBeLessThanOrEqual: (expected: number) => void;
    toBeDefined: () => void;
    toBeUndefined: () => void;
    toBeNull: () => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toHaveBeenCalled: () => void;
    toHaveBeenCalledTimes: (expected: number) => void;
    toHaveBeenCalledWith: (...args: any[]) => void;
    not: any;
  };

  namespace jest {
    interface MockedFunction<T extends (...args: any[]) => any> {
      (...args: Parameters<T>): ReturnType<T>;
      mockResolvedValue: (value: any) => MockedFunction<T>;
      mockRejectedValue: (value: any) => MockedFunction<T>;
      mockReturnValue: (value: any) => MockedFunction<T>;
      mockImplementation: (fn: T) => MockedFunction<T>;
      mockClear: () => void;
      mockReset: () => void;
      mockRestore: () => void;
    }
  }

  var global: NodeJS.Global;
}

export {};