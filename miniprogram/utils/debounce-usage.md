# 防抖功能使用说明

本项目已为所有按钮和跳转添加了防抖功能，防止用户快速点击导致的重复操作。

## 已添加防抖的页面

### 1. 首页 (home)
- `onPink()` - 关注操作，防抖时间：600ms
- `onConfirm()` - 确认跳转，防抖时间：300ms  
- `onEventInfo()` - 活动信息跳转，防抖时间：300ms
- `goWelcome()` - 欢迎页跳转，防抖时间：300ms

### 2. 个人资料页 (profile)
- `onMyLikes()` - 我的喜欢页跳转，防抖时间：300ms
- `onLikesMe()` - 喜欢我的页跳转，防抖时间：300ms
- `onProfileVerification()` - 资料认证页跳转，防抖时间：300ms
- `onSettings()` - 设置页跳转，防抖时间：300ms
- `onMyEvents()` - 我的活动页跳转，防抖时间：300ms
- `onEditProfile()` - 编辑资料页跳转，防抖时间：300ms
- `goWelcome()` - 欢迎页跳转，防抖时间：300ms
- `onUploadAvatar()` - 上传头像，防抖时间：1000ms

### 3. 公开资料页 (public-profile)
- `handlePopup()` - 弹窗操作，防抖时间：300ms
- `followUser()` - 关注用户，防抖时间：500ms
- `unfollowUser()` - 取消关注，防抖时间：500ms

### 4. 个人信息页 (personal-info)
- `onPhotoUpload()` - 提交注册信息，防抖时间：500ms

### 5. 活动页 (events)
- `fetchActivityList()` - 获取活动列表，防抖时间：300ms

## 防抖工具类使用方法

### 1. DebounceHelper - 通用防抖工具

```typescript
import { DebounceHelper } from '../../utils/debounce';

// 基本用法
DebounceHelper.execute('uniqueKey', () => {
  // 要执行的函数
  console.log('防抖执行');
}, 300); // 300ms 防抖延迟

// 异步函数防抖
DebounceHelper.execute('asyncKey', async () => {
  const result = await someAsyncFunction();
  console.log(result);
}, 500);
```

### 2. NavigateDebounce - 页面跳转防抖

```typescript
import { NavigateDebounce } from '../../utils/debounce';

// 跳转到指定页面
NavigateDebounce.navigateTo('/pages/target/target');

// 重定向到指定页面
NavigateDebounce.redirectTo('/pages/target/target');

// 切换到 Tab 页面
NavigateDebounce.switchTab('/pages/home/home');

// 返回上一页
NavigateDebounce.navigateBack();

// 设置全局防抖延迟时间
NavigateDebounce.setDelay(800); // 设置为 800ms
```

## 防抖配置

### 延迟时间配置 (debounce-config.ts)

```typescript
export const DEBOUNCE_DELAYS = {
  BUTTON_CLICK: 300,      // 按钮点击
  NAVIGATION: 500,        // 页面跳转
  API_REQUEST: 500,       // API 请求
  FORM_SUBMIT: 800,       // 表单提交
  SEARCH_INPUT: 300,      // 搜索输入
  POPUP_ACTION: 200,      // 弹窗操作
  FILE_UPLOAD: 1000,      // 文件上传
  FOLLOW_ACTION: 600,     // 关注操作
  DATA_REFRESH: 400       // 数据刷新
};
```

## 在新页面中添加防抖

### 1. 导入防抖工具

```typescript
import { DebounceHelper, NavigateDebounce } from '../../utils/debounce';
```

### 2. 为按钮点击添加防抖

```typescript
async onButtonClick() {
  DebounceHelper.execute('buttonClick', async () => {
    // 原有的按钮点击逻辑
    try {
      const result = await someApiCall();
      // 处理结果
    } catch (error) {
      // 错误处理
    }
  }, 300);
}
```

### 3. 为页面跳转添加防抖

```typescript
onNavigateToPage() {
  DebounceHelper.execute('navigateToPage', () => {
    NavigateDebounce.navigateTo('/pages/target/target');
  }, 300);
}
```

## 注意事项

1. **唯一键名**: 每个防抖操作需要提供唯一的键名，建议使用页面名+方法名的格式
2. **延迟时间**: 根据操作类型选择合适的延迟时间，参考 `DEBOUNCE_DELAYS` 配置
3. **异步操作**: 对于异步操作，确保在防抖函数内部正确处理 Promise
4. **错误处理**: 在防抖函数内部添加适当的错误处理逻辑
5. **清理**: 页面卸载时，防抖定时器会自动清理，无需手动处理

## 最佳实践

1. **API 请求**: 使用较长的防抖时间（500-800ms）
2. **页面跳转**: 使用中等防抖时间（300-500ms）
3. **按钮点击**: 使用较短的防抖时间（200-300ms）
4. **文件上传**: 使用较长的防抖时间（1000ms）
5. **搜索输入**: 使用中等防抖时间（300ms）

## 调试

可以在控制台查看防抖执行情况：

```typescript
DebounceHelper.execute('debugKey', () => {
  console.log('防抖函数执行');
}, 300);
```

如果需要清除特定的防抖定时器：

```typescript
DebounceHelper.clear('specificKey');
```

如果需要清除所有防抖定时器：

```typescript
DebounceHelper.clearAll();