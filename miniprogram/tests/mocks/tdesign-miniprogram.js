/**
 * TDesign 小程序组件库模拟
 */

// 模拟 Message 组件
const Message = {
  info: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn()
};

// 模拟其他可能用到的 TDesign 组件
const Toast = {
  show: jest.fn(),
  hide: jest.fn()
};

const Dialog = {
  alert: jest.fn(),
  confirm: jest.fn()
};

const Loading = {
  show: jest.fn(),
  hide: jest.fn()
};

module.exports = {
  Message,
  Toast,
  Dialog,
  Loading
};

// 默认导出 Message（因为代码中主要使用这个）
module.exports.default = Message;