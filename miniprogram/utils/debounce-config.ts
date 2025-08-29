/**
 * 全局防抖配置文件
 * 统一管理所有页面和组件的防抖设置
 */

// 防抖延迟时间配置
export const DEBOUNCE_DELAYS = {
  // 按钮点击防抖
  BUTTON_CLICK: 300,
  
  // 页面跳转防抖
  NAVIGATION: 500,
  
  // API 请求防抖
  API_REQUEST: 500,
  
  // 表单提交防抖
  FORM_SUBMIT: 800,
  
  // 搜索输入防抖
  SEARCH_INPUT: 300,
  
  // 弹窗操作防抖
  POPUP_ACTION: 200,
  
  // 上传文件防抖
  FILE_UPLOAD: 1000,
  
  // 关注/取消关注防抖
  FOLLOW_ACTION: 600,
  
  // 数据刷新防抖
  DATA_REFRESH: 400
} as const;

// 防抖键名配置
export const DEBOUNCE_KEYS = {
  // 首页相关
  HOME_PINK: 'home_pink',
  HOME_CONFIRM: 'home_confirm',
  HOME_EVENT_INFO: 'home_event_info',
  HOME_GO_WELCOME: 'home_go_welcome',
  
  // 个人资料页相关
  PROFILE_MY_LIKES: 'profile_my_likes',
  PROFILE_LIKES_ME: 'profile_likes_me',
  PROFILE_VERIFICATION: 'profile_verification',
  PROFILE_SETTINGS: 'profile_settings',
  PROFILE_MY_EVENTS: 'profile_my_events',
  PROFILE_EDIT: 'profile_edit',
  PROFILE_UPLOAD_AVATAR: 'profile_upload_avatar',
  
  // 公开资料页相关
  PUBLIC_PROFILE_POPUP: 'public_profile_popup',
  PUBLIC_PROFILE_FOLLOW: 'public_profile_follow',
  PUBLIC_PROFILE_UNFOLLOW: 'public_profile_unfollow',
  
  // 个人信息页相关
  PERSONAL_INFO_SUBMIT: 'personal_info_submit',
  
  // 活动页相关
  EVENTS_FETCH_LIST: 'events_fetch_list',
  
  // 通用导航
  NAVIGATE_TO: 'navigate_to',
  NAVIGATE_BACK: 'navigate_back',
  REDIRECT_TO: 'redirect_to',
  SWITCH_TAB: 'switch_tab'
} as const;

// 页面级防抖配置
export const PAGE_DEBOUNCE_CONFIG = {
  // 首页配置
  home: {
    onPink: DEBOUNCE_DELAYS.FOLLOW_ACTION,
    onConfirm: DEBOUNCE_DELAYS.NAVIGATION,
    onEventInfo: DEBOUNCE_DELAYS.NAVIGATION,
    goWelcome: DEBOUNCE_DELAYS.NAVIGATION
  },
  
  // 个人资料页配置
  profile: {
    onMyLikes: DEBOUNCE_DELAYS.NAVIGATION,
    onLikesMe: DEBOUNCE_DELAYS.NAVIGATION,
    onProfileVerification: DEBOUNCE_DELAYS.NAVIGATION,
    onSettings: DEBOUNCE_DELAYS.NAVIGATION,
    onMyEvents: DEBOUNCE_DELAYS.NAVIGATION,
    onEditProfile: DEBOUNCE_DELAYS.NAVIGATION,
    goWelcome: DEBOUNCE_DELAYS.NAVIGATION,
    onUploadAvatar: DEBOUNCE_DELAYS.FILE_UPLOAD
  },
  
  // 公开资料页配置
  publicProfile: {
    handlePopup: DEBOUNCE_DELAYS.POPUP_ACTION,
    followUser: DEBOUNCE_DELAYS.FOLLOW_ACTION,
    unfollowUser: DEBOUNCE_DELAYS.FOLLOW_ACTION
  },
  
  // 个人信息页配置
  personalInfo: {
    onPhotoUpload: DEBOUNCE_DELAYS.FORM_SUBMIT
  },
  
  // 活动页配置
  events: {
    fetchActivityList: DEBOUNCE_DELAYS.DATA_REFRESH
  }
} as const;

// 组件级防抖配置
export const COMPONENT_DEBOUNCE_CONFIG = {
  // 活动卡片组件
  eventsCard: {
    onTap: DEBOUNCE_DELAYS.NAVIGATION,
    onSignUp: DEBOUNCE_DELAYS.API_REQUEST
  },
  
  // 喜欢卡片组件
  likesCard: {
    onTap: DEBOUNCE_DELAYS.NAVIGATION,
    onLike: DEBOUNCE_DELAYS.FOLLOW_ACTION
  },
  
  // 上传文件组件
  uploadFile: {
    onUpload: DEBOUNCE_DELAYS.FILE_UPLOAD,
    onDelete: DEBOUNCE_DELAYS.BUTTON_CLICK
  },
  
  // 选择器组件
  picker: {
    onConfirm: DEBOUNCE_DELAYS.BUTTON_CLICK,
    onCancel: DEBOUNCE_DELAYS.BUTTON_CLICK
  }
} as const;

// 导航防抖配置
export const NAVIGATION_DEBOUNCE_CONFIG = {
  navigateTo: DEBOUNCE_DELAYS.NAVIGATION,
  redirectTo: DEBOUNCE_DELAYS.NAVIGATION,
  switchTab: DEBOUNCE_DELAYS.NAVIGATION,
  navigateBack: DEBOUNCE_DELAYS.NAVIGATION
} as const;

// 获取页面防抖配置的辅助函数
export function getPageDebounceConfig(pageName: keyof typeof PAGE_DEBOUNCE_CONFIG) {
  return PAGE_DEBOUNCE_CONFIG[pageName] || {};
}

// 获取组件防抖配置的辅助函数
export function getComponentDebounceConfig(componentName: keyof typeof COMPONENT_DEBOUNCE_CONFIG) {
  return COMPONENT_DEBOUNCE_CONFIG[componentName] || {};
}

// 获取防抖延迟时间的辅助函数
export function getDebounceDelay(type: keyof typeof DEBOUNCE_DELAYS): number {
  return DEBOUNCE_DELAYS[type];
}

// 获取防抖键名的辅助函数
export function getDebounceKey(key: keyof typeof DEBOUNCE_KEYS): string {
  return DEBOUNCE_KEYS[key];
}