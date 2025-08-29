import { ACCESS_TOKEN_KEY, OPENID_ID_KEY, USER_ID_KEY } from './constants';
import * as navigateHelper from './navigateHelper';

export interface SocialLogin {
  accessToken: string;
  expiresTime: number;
  openid: string;
  refreshToken: string;
  userId: number;
  registeredFlag: boolean; // 标识用户是否已经注册
  sessionKey: string; // 会话密钥，用于解密用户敏感信息
  token: string; // 用户登录凭证，用于后续接口的身份验证
  userInfo?: {
    id: number; // 主键id
    customerSerial: string; // 用户编码
    school: string; // 学校
    academics: string; // 学历/学术水平
    registrationTime: string; // 注册时间
    academicReviewStatus: number; // 学历认证状态: 0.待审核 1.已通过 2.未通过
    photoReviewStatus: number; // 照片审核状态: 0.待审核 1.已通过 2.未通过
    openId: string; // 用户唯一标识
    unionId: string; // 用户在开放平台的唯一标识符
    nickName: string; // 用户昵称
    avatarUrl: string; // 用户头像图片URL
    gender: number; // 用户性别 0未知 1男性 2女性
    city: string; // 用户所在城市
    province: string; // 用户所在省份
    country: string; // 用户所在国家
    language: string; // 语言
    telephone: string; // 手机号  
  };
}

/**
 * 将 accessToken 保存到小程序本地缓存
 * @param accessToken 后端返回的登录 accessToken
 */
export function setToken(accessToken: string): void {
  try {
    wx.setStorageSync(ACCESS_TOKEN_KEY, accessToken);
  } catch (e) {
    console.error('保存 token 到小程序本地缓存失败：', e);
  }
}

/**
 * 从小程序本地缓存读取 accessToken
 * @returns string 或 null
 */
export function getToken(): string | null {
  try {
    const token = wx.getStorageSync(ACCESS_TOKEN_KEY);
    return token || null;
  } catch (e) {
    console.error('从小程序本地缓存读取 token 失败：', e);
    return null;
  }
}

/**
 * 将 UserID 保存到小程序本地缓存
 * @param userID 后端返回的登录 UserID
 */
export function setUserID(userID: string | number): void {
  try {
    wx.setStorageSync(USER_ID_KEY, userID);
  } catch (e) {
    console.error('保存 userID 到小程序本地缓存失败：', e);
  }
}

/**
 * 从小程序本地缓存读取 UserID
 * @returns string 或 null
 */
export function getUserID(): string | null {
  try {
    const UserID = wx.getStorageSync(USER_ID_KEY);
    return UserID || null;
  } catch (e) {
    console.error('从小程序本地缓存读取 userID 失败：', e);
    return null;
  }
}

/**
 * 将 OpenID 保存到小程序本地缓存
 * @param token 后端返回的登录 OpenID
 */
export function setOpenID(OpenID: string): void {
  try {
    wx.setStorageSync(OPENID_ID_KEY, OpenID);
  } catch (e) {
    console.error('保存 OpenID 到小程序本地缓存失败：', e);
  }
}

/**
 * 从小程序本地缓存读取 OpenID
 * @returns string 或 null
 */
export function getOpenID(): string | null {
  try {
    const OpenID = wx.getStorageSync(OPENID_ID_KEY);
    return OpenID || null;
  } catch (e) {
    console.error('从小程序本地缓存读取 OpenID 失败：', e);
    return null;
  }
}

export function logOut(): void {
  try {
    wx.removeStorageSync(ACCESS_TOKEN_KEY);
    wx.removeStorageSync(USER_ID_KEY);
    wx.removeStorageSync(OPENID_ID_KEY);
    navigateHelper.goWelcomeWithRedirect();
  } catch (e) {
    console.error('登出时清除本地缓存失败：', e);
  }
}
