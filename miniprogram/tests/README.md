# 防抖功能单元测试

本目录包含了防抖功能的完整单元测试套件。

## 测试结构

```
tests/
├── jest.config.js          # Jest 配置文件
├── setup.ts                # 测试环境设置
├── types/
│   └── jest.d.ts           # Jest 类型定义
├── mocks/
│   └── tdesign-miniprogram.js  # TDesign 组件模拟
└── utils/
    ├── debounce.test.ts         # 防抖工具测试
    └── debounce-config.test.ts  # 防抖配置测试
```

## 安装依赖

在项目根目录运行以下命令安装测试依赖：

```bash
npm install --save-dev jest @types/jest ts-jest typescript
```

或使用 pnpm：

```bash
pnpm add -D jest @types/jest ts-jest typescript
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npm test debounce.test.ts
```

### 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

### 监听模式运行测试
```bash
npm run test:watch
```

## 测试覆盖的功能

### 1. 防抖工具测试 (debounce.test.ts)

- **debounce 函数测试**
  - 延迟执行功能
  - 重置计时器功能
  - 参数传递
  - this 上下文保持

- **throttle 函数测试**
  - 时间间隔限制
  - 参数传递

- **DebounceHelper 测试**
  - execute 方法防抖
  - 多个 key 独立执行
  - clear 和 clearAll 方法
  - 异步函数支持

- **NavigateDebounce 测试**
  - 页面跳转防抖
  - 延迟时间设置
  - 参数传递

- **边界情况测试**
  - 零延迟时间
  - 负数延迟时间
  - 空字符串 key

- **性能测试**
  - 大量防抖调用
  - 内存泄漏检测

### 2. 防抖配置测试 (debounce-config.test.ts)

- **常量配置测试**
  - DEBOUNCE_DELAYS 配置完整性
  - DEBOUNCE_KEYS 唯一性
  - 配置值类型检查

- **页面配置测试**
  - 页面级防抖配置
  - 配置值有效性

- **组件配置测试**
  - 组件级防抖配置
  - 配置一致性

- **辅助函数测试**
  - getPageDebounceConfig
  - getComponentDebounceConfig
  - getDebounceDelay
  - getDebounceKey

## 测试覆盖率要求

项目设置了以下覆盖率阈值：

- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%
- **语句覆盖率**: 80%

## 模拟对象

### 微信小程序 API 模拟

测试环境中模拟了以下微信小程序 API：

- 页面跳转: `wx.navigateTo`, `wx.redirectTo`, `wx.switchTab`, `wx.navigateBack`
- 界面交互: `wx.showToast`, `wx.showLoading`, `wx.hideLoading`
- 媒体选择: `wx.chooseMedia`
- 存储操作: `wx.getStorageSync`, `wx.setStorageSync`
- 网络请求: `wx.request`
- 登录相关: `wx.login`, `wx.getUserProfile`

### 全局对象模拟

- `Page`: 页面构造函数
- `Component`: 组件构造函数
- `App`: 应用构造函数
- `getApp`: 获取应用实例
- `Behavior`: 行为构造函数

### TDesign 组件模拟

- `Message`: 消息提示组件
- `Toast`: 轻提示组件
- `Dialog`: 对话框组件
- `Loading`: 加载组件

## 编写新测试

### 1. 创建测试文件

在 `tests/` 目录下创建 `.test.ts` 文件：

```typescript
import { YourFunction } from '../../utils/your-module';

describe('YourFunction 测试', () => {
  test('应该正确执行功能', () => {
    // 测试代码
    expect(YourFunction()).toBe(expectedResult);
  });
});
```

### 2. 使用模拟对象

```typescript
import { mockWx } from '../setup';

test('应该调用微信 API', () => {
  YourFunction();
  expect(mockWx.navigateTo).toHaveBeenCalledWith({
    url: '/pages/target/target'
  });
});
```

### 3. 测试异步函数

```typescript
test('应该处理异步操作', async () => {
  const mockAsyncFn = jest.fn().mockResolvedValue('result');
  
  const result = await YourAsyncFunction(mockAsyncFn);
  
  expect(result).toBe('result');
  expect(mockAsyncFn).toHaveBeenCalled();
});
```

## 调试测试

### 1. 查看详细输出

```bash
npm test -- --verbose
```

### 2. 调试特定测试

```bash
npm test -- --testNamePattern="特定测试名称"
```

### 3. 生成覆盖率报告

覆盖率报告会生成在 `tests/coverage/` 目录下，包含：

- `lcov-report/index.html`: HTML 格式的详细报告
- `coverage-final.json`: JSON 格式的覆盖率数据
- 控制台输出的覆盖率摘要

## 持续集成

可以将测试集成到 CI/CD 流程中：

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
```

## 最佳实践

1. **测试命名**: 使用描述性的测试名称
2. **测试隔离**: 每个测试应该独立运行
3. **模拟外部依赖**: 使用 mock 隔离外部依赖
4. **边界测试**: 测试边界条件和异常情况
5. **覆盖率**: 保持高覆盖率但不追求 100%
6. **可读性**: 测试代码应该易于理解和维护

## 故障排除

### 常见问题

1. **TypeScript 错误**: 确保安装了 `@types/jest` 和正确的类型定义
2. **模块解析错误**: 检查 `jest.config.js` 中的 `moduleNameMapping` 配置
3. **异步测试超时**: 使用 `jest.setTimeout()` 增加超时时间
4. **模拟不生效**: 确保在 `beforeEach` 中清理模拟状态

### 获取帮助

- 查看 Jest 官方文档: https://jestjs.io/
- 查看项目 issue 或提交新 issue
- 联系项目维护者