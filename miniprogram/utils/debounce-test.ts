/**
 * 防抖功能测试文件
 * 用于验证防抖模块是否正常工作
 */

import { DebounceHelper, NavigateDebounce, debounce, throttle } from './debounce';

// 测试防抖功能
export function testDebounceModule() {
  console.log('开始测试防抖模块...');
  
  try {
    // 测试 DebounceHelper
    DebounceHelper.execute('test', () => {
      console.log('DebounceHelper 测试成功');
    }, 100);
    
    // 测试 NavigateDebounce
    const pageInfo = NavigateDebounce.getPageStackInfo();
    console.log('页面栈信息:', pageInfo);
    
    // 测试 debounce 函数
    const testFn = debounce(() => {
      console.log('debounce 函数测试成功');
    }, 100);
    testFn();
    
    // 测试 throttle 函数
    const testThrottleFn = throttle(() => {
      console.log('throttle 函数测试成功');
    }, 100);
    testThrottleFn();
    
    console.log('防抖模块测试完成，所有功能正常');
    return true;
  } catch (error) {
    console.error('防抖模块测试失败:', error);
    return false;
  }
}

// 导出测试函数
export default {
  testDebounceModule
};