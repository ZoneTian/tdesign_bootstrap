/**
 * Jest 测试设置文件
 */

// 模拟微信小程序全局对象
const mockWx = {
  // 页面跳转相关
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),

  // 界面交互相关
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(),

  // 媒体相关
  chooseMedia: jest.fn(),

  // 存储相关
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),

  // 网络请求相关
  request: jest.fn(),

  // 登录相关
  login: jest.fn(),
  getUserProfile: jest.fn(),

  // 系统信息
  getSystemInfoSync: jest.fn(() => ({
    platform: 'devtools',
    version: '8.0.5',
    SDKVersion: '2.19.4',
  })),

  // 其他常用 API
  getApp: jest.fn(),
  getCurrentPages: jest.fn(() => []),

  // 事件相关
  onAppShow: jest.fn(),
  onAppHide: jest.fn(),

  // 分享相关
  onShareAppMessage: jest.fn(),
  onShareTimeline: jest.fn(),
};

// 模拟 getApp 函数
const mockGetApp = jest.fn(() => ({
  globalData: {
    userInfo: null,
    hasLogin: false,
    isRegistered: false,
    showVisible: false,
    userInfo: null,
  },
}));

// 模拟 Page 构造函数
const mockPage = jest.fn((options) => {
  return {
    ...options,
    setData: jest.fn(),
    selectComponent: jest.fn(() => ({
      show: jest.fn(),
      onAreaPicker: jest.fn(),
    })),
  };
});

// 模拟 Component 构造函数
const mockComponent = jest.fn((options) => {
  return {
    ...options,
    setData: jest.fn(),
    triggerEvent: jest.fn(),
  };
});

// 模拟 App 构造函数
const mockApp = jest.fn((options) => {
  return {
    ...options,
    globalData: {
      userInfo: null,
      hasLogin: false,
      isRegistered: false,
      showVisible: false,
    },
  };
});

// 模拟 Behavior 构造函数
const mockBehavior = jest.fn((options) => {
  return options;
});

// 将模拟对象挂载到全局
(global as any).wx = mockWx;
(global as any).getApp = mockGetApp;
(global as any).Page = mockPage;
(global as any).Component = mockComponent;
(global as any).App = mockApp;
(global as any).Behavior = mockBehavior;

// 模拟 console 方法（可选）
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// 模拟 setTimeout 和 clearTimeout
global.setTimeout = jest.fn((callback, delay) => {
  return setTimeout(callback, delay);
});

global.clearTimeout = jest.fn((id) => {
  clearTimeout(id);
});

// 设置默认的测试超时时间
jest.setTimeout(10000);

// 在每个测试前重置所有模拟
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// 在每个测试后清理
afterEach(() => {
  jest.restoreAllMocks();
});

// 导出模拟对象供测试使用
export { mockWx, mockGetApp, mockPage, mockComponent, mockApp, mockBehavior };
