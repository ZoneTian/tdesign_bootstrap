// utils/api.ts
import { request, RequestOptions, requestWithRetry } from './request';
import { getUserID, SocialLogin } from './auth';
import { getAreaList, setAreaList, getSchoolList, setSchoolList } from './storage';

export type VersionInfo = {
  currentVersion: string;
  latestVersion: string;
};

export async function getAppVersion(): Promise<Res<VersionInfo>> {
  const requestConfig: RequestOptions = {
    url: '/api/version',
    method: 'GET',
  };
  return request(requestConfig);
}

export type Res<T> = {
  code: number;
  data: T;
  msg: string;
};

type PostLoginRequestOptions = {
  type?: number;
  code: string;
  state?: string;
};

// 授权
export async function postLogin(options: PostLoginRequestOptions): Promise<Res<SocialLogin>> {
  const { type = 1, code, state = 'MNP' } = options;

  const requestConfig: RequestOptions = {
    url: '/wechat/auth/login',
    method: 'POST',
    data: { type, code, state },
    skipLoginWait: true, // 登录请求不需要等待登录完成
  };
  return request(requestConfig);
}

// 注册请求参数类型
export type RegisterRequestOptions = {
  code?: string;
  openid?: string;
  nickName?: string;
  telephone?: string;
  avatarUrl?: string;
  gender?: number;
  city?: string;
  province?: string;
  country?: string;
  language?: string;
  school?: string;
  academics?: string;
  userMbti?: string;
};

// 注册
export async function postRegister(options: RegisterRequestOptions): Promise<Res<SocialLogin>> {
  const requestConfig: RequestOptions = {
    url: '/wechat/auth/register',
    method: 'POST',
    data: options,
  };
  return request(requestConfig);
}

export type AreaTree = {
  id: number;
  name: string;
  children: AreaTree[];
};

// 获取地区树
export const getArea = async (shortCode: string): Promise<Res<AreaTree[]>> => {
  // 性能优化 添加 wx.storage

  // === GET FORM LOCAL STORAGE
  const areaList = getAreaList();
  if (areaList) return JSON.parse(areaList);

  const requestConfig: RequestOptions = {
    url: `/v1/region/getRegionByCode` + '?shortCode=' + shortCode,
    method: 'GET',
  };

  const response = await requestWithRetry(requestConfig);

  // === SAVE TO LOCALSTORAGE
  setAreaList(JSON.stringify(response));

  return response;
};

export type SchoolItem = {
  id: number;
  schoolName: string;
};

// 获取学校列表 - 调用外部API
export const getSchoolListAPI = async (schoolName: string, pageNum: number = 1, pageSize: number = 10): Promise<Res<{ list: SchoolItem[]; total: number }>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/school/list`,
    method: 'GET',
    needUser: false,
    data: {
      pageNum,
      pageSize,
      schoolName
    }
  };
  return request(requestConfig);
};

export type DictDataBase = {
  id: number;
  label: string;
  value: string;
  dictType: string;
};

export type DictDataProfession = {} & DictDataBase;

export type DictDataMBTI = {} & DictDataBase;

export type DictDataSchool = {} & DictDataBase;

// 获取职业
export const getProfession = async (): Promise<Res<DictDataProfession[]>> => {
  const requestConfig: RequestOptions = {
    url: '/app-api/system/dict-data/type?type=profession',
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 获取MBTI
export const getMbti = async (): Promise<Res<DictDataMBTI[]>> => {
  const requestConfig: RequestOptions = {
    url: '/app-api/system/dict-data/type?type=mbti',
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 获取学校 - 内部数据字典
export const getSchool = async (): Promise<Res<DictDataSchool[]>> => {
  const schoolList = getSchoolList();

  if (schoolList) return JSON.parse(schoolList);

  const requestConfig: RequestOptions = {
    url: '/app-api/system/dict-data/type?type=school',
    method: 'GET',
  };
  const { code, data, msg } = (await requestWithRetry(requestConfig)) as Res<DictDataSchool[]>;

  const limit = data.slice(0, 200);

  const responseLimit = {
    code: code,
    data: limit,
    msg: msg,
  };

  setSchoolList(JSON.stringify(responseLimit));

  return responseLimit;
};

export const getSystemDictDataSchool = async (): Promise<Res<DictDataSchool[]>> => {
  const requestConfig: RequestOptions = {
    url: `/admin-api/system/dict-data/page?label=上海&dictType=school&status=0&pageNo=1&pageSize=100`,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 性能优化 添加 wx.storage

// === GET FORM LOCAL STORAGE
// const areaList = getAreaList();
// if (areaList) return JSON.parse(areaList);

// const requestConfig: RequestOptions = {
//   url: `/app-api/system/area/tree`,
//   method: 'GET',
// };

// const response = await requestWithRetry(requestConfig);

// // === SAVE TO LOCALSTORAGE
// setAreaList(JSON.stringify(response));

// return response;

export interface ResignedUrl {
  configId: number;
  path: string;
  uploadUrl: string;
  url: string;
}

// 上传图片 - 获取文件预签名地址
export const getPresignedUrl = async (): Promise<Res<ResignedUrl>> => {
  const requestConfig: RequestOptions = {
    url: `/infra/file/presigned-url?name=test`,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

export const postUpload = async (): Promise<Res<string>> => {
  const requestConfig: RequestOptions = {
    url: `/infra/file/upload`,
    method: 'POST',
  };
  return await request(requestConfig);
};

// 活动列表类型定义
export type ActivityMpListVo = {
  isRegistered: any;
  applyCount: string;
  id: number;
  activityTitle: string;
  activityContent: string;
  activityStartTime: string;
  activityEndTime: string;
  applyStartTime: string;
  applyEndTime: string;
  activityPrice: number;
  publicFlag: number;
  province: string;
  city: string;
  address: string;
  mainCoverImage: string;
};

// 活动列表分页响应类型
export type PageInfoActivityMpListVo = {
  total: number;
  list: ActivityMpListVo[];
  pageNum: number;
  pageSize: number;
  size: number;
  startRow: number;
  endRow: number;
  pages: number;
  prePage: number;
  nextPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  navigatePages: number;
  navigatepageNums: number[] | null;
  navigateFirstPage: number;
  navigateLastPage: number;
};

// 获取活动列表
export const getActivityList = async (
  activityStatus?: number,
  registered?: boolean,
  pageNum: number = 1,
  pageSize: number = 10,
): Promise<Res<PageInfoActivityMpListVo>> => {
  let url = '/v1/activity/registration/list';
  url += `?loginStatus=${registered ? '1' : '0'}`;
  url += `&pageNum=${pageNum}&pageSize=${pageSize}`;
  if (activityStatus) {
    url += `&activityStatus=${activityStatus}`;
  }

  const requestConfig: RequestOptions = {
    url,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

export const getMyActivityList = async (
  activityStatus?: number,
  pageNum: number = 1,
  pageSize: number = 10,
): Promise<Res<PageInfoActivityMpListVo>> => {
  let url = '/v1/activity/registration/myApplyActivity';
  url += `?pageNum=${pageNum}&pageSize=${pageSize}`;
  if (activityStatus) {
    url += `&activityStatus=${activityStatus}`;
  }

  const requestConfig: RequestOptions = {
    url,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 上传社交图片
export const uploadSocialImages = async (
  userId: number,
  socialImg: {}[],
): Promise<Res<any>> => {
  const requestConfig: RequestOptions = {
    url: '/v1/mp/user/uploadSocialImg',
    method: 'POST',
    data: {
      userId,
      socialImg,
    },
  };
  return await request(requestConfig);
};

// 上传用户自拍照片请求参数类型
export type UploadUserSelfieRequestOptions = {
  userId: number;
  userSelfie: string;
};

// 上传用户自拍照片响应类型
export type UploadUserSelfieResponse = {
  success: boolean;
  message?: string;
};

// 上传用户自拍照片
export const uploadUserSelfie = async (
  userId: number,
  userSelfie: string,
): Promise<Res<UploadUserSelfieResponse>> => {
  const requestConfig: RequestOptions = {
    url: '/v1/mp/user/uploadUserSelfie',
    method: 'POST',
    data: {
      userId,
      userSelfie,
    },
  };
  return await request(requestConfig);
};

// 活动详情类型定义
export type ActivityMpDetailVo = {
  notes: unknown;
  activityContentImgList: never[];
  isRegistered: any;
  id: number;
  activityTitle: string;
  activityContent: string;
  activityStartTime: string;
  activityEndTime: string;
  applyStartTime: string;
  applyEndTime: string;
  activityPrice: number;
  publicFlag: number;
  province: string;
  city: string;
  address: string;
  mainCoverImage: string;
};

// 获取活动详情
export const getActivityDetail = async (id: string | number): Promise<Res<ActivityMpDetailVo>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/activity/registration/detail?activityId=${id}&loginStatus=1`,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 注册活动
export const applyActivity = async (activityId: string | number): Promise<Res<any>> => {
  const requestConfig: RequestOptions = {
    url: '/v1/activity/registration/apply',
    method: 'POST',
    data: {
      activityId,
    },
  };
  return await request(requestConfig);
};

// 推荐用户列表类型定义
export type ReferrerUserVo = {
  userId: number;
  nickName: string;
  avatarUrl: string;
  gender: number;
  city: string;
  profession: string;
  mbti: string;
  socialImages: string[];
  applyActivityDto: {
    activityId: number;
    activityTitle: string;
  } | null;
  // 其他可能的字段
};

// 推荐用户列表分页响应类型
export type PageInfoWeChatReferrerListVo = {
  total: number;
  list: ReferrerUserVo[];
  pageNum: number;
  pageSize: number;
  size: number;
  startRow: number;
  endRow: number;
  pages: number;
  prePage: number;
  nextPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  navigatePages: number;
  navigatepageNums: number[];
  navigateFirstPage: number;
  navigateLastPage: number;
};

// 获取推荐用户列表
export const getReferrerList = async (
  // page: number,
  // pageSize: number = 10,
): Promise<Res<ReferrerUserVo[]>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/referrerList`,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 活动报名用户列表类型定义
export type ActivityMpApplyUserListVo = {
  userCoverImg: string;
  userId: number;
  nickName: string;
  avatarUrl: string;
  gender: number;
  activityId: number;
  school: string;
  isFollowed: number; // 1-已关注，0-未关注
  // 其他可能的字段
};

// 活动报名用户分页响应类型
export type PageInfoActivityMpApplyUserListVo = {
  total: number;
  list: ActivityMpApplyUserListVo[];
  pageNum: number;
  pageSize: number;
  size: number;
  startRow: number;
  endRow: number;
  pages: number;
  prePage: number;
  nextPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

// 获取活动报名用户列表（支持分页）
export const getActivityApplyUserList = async (
  activityId: string | number,
  page: number = 1,
  pageSize: number = 10,
): Promise<Res<PageInfoActivityMpApplyUserListVo>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/activity/registration/applyUserList?activityId=${activityId}&pageNum=${page}&pageSize=${pageSize}`,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 更新用户信息
export type UpdateUserInfoOptions = {
  userId: number;
  avatarUrl?: string;
  nickName?: string;
  [key: string]: any;
};

export const updateUserInfo = async (options: UpdateUserInfoOptions): Promise<Res<any>> => {
  const requestConfig: RequestOptions = {
    url: '/wechat/auth/updateUserInfo',
    method: 'POST',
    data: options,
  };
  return await request(requestConfig);
};

// 用户详情类型定义
export type WeChatUserDetailVo = {
  friendshipTend: unknown;
  selfDescription: unknown;
  occupation: any;
  userBirthday: string;
  birthday: unknown;
  userMbti: unknown;
  userHeight: unknown;
  id: number;
  customerSerial: string;
  openId: string;
  unionId: string;
  nickName: string;
  avatarUrl: string;
  gender: number;
  city: string;
  province: string;
  country: string;
  language: string;
  school: string;
  academics: string;
  registrationTime: string;
  academicReviewStatus: number;
  photoReviewStatus: number;
  telephone: string;
  presentProvince: string;
  presentCity: string;
  wechatAccount: string;
};

// 获取用户详情
export const getUserDetail = async (userId?: number): Promise<Res<WeChatUserDetailVo>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/userDetail`,
    method: 'GET',
    data: {
      userId: userId || getUserID(),
    },
  };
  return await requestWithRetry(requestConfig);
};

// 用户社交照片类型定义
export type WeChatMyPhotoVo = {
  userId: number;
  socialImg: any[];
};

// 获取用户社交照片
export const getUserPhoto = async (userId: number): Promise<Res<WeChatMyPhotoVo>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/myPhoto`,
    method: 'GET',
    data: {
      userId,
    },
  };
  return await requestWithRetry(requestConfig);
};

// 用户关注者类型定义
export type WeChatFollowersVo = {
  id: number;
  customerSerial: string;
  nickName: string;
  avatarUrl: string;
  gender: number; // 0:未知 1:男 2:女
};

// 获取用户关注者列表
export const getUserFollowers = async (): Promise<Res<WeChatFollowersVo[]>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/userFollowers`,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 用户粉丝类型定义
export type WeChatFansVo = {
  id: number;
  customerSerial: string;
  nickName: string;
  avatarUrl: string;
  gender: number; // 0:未知 1:男 2:女
};

// 获取用户粉丝列表
export const getUserFans = async (): Promise<Res<WeChatFansVo[]>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/userFans`,
    method: 'GET',
  };
  return await requestWithRetry(requestConfig);
};

// 关注状态请求参数类型
export type FollowStatusOptions = {
  followerId: number; // 关注者id（当前用户id）
  followedId: number; // 被关注者id（当前显示的用户id）
  status: number; // 关注状态：1.关注 2.取消关注
};

// 关注状态响应类型
export type FollowStatusVo = {
  status: number; // 关注状态：1.关注 2.取消关注
};

// 查询关注状态请求参数类型
export type UserFollowsStatusOptions = {
  selfUserId: number | String; // 本人userId
  targetUserId: number; // 查看的userId
};



// 查询关注状态响应类型
export type WeChatUserFollowsStatusVo = {
  followStatus: number; // 关注状态 0:未关注 1:关注对方 2:互相关注
};

// 获取/设置关注状态
export const followsStatus = async (options: FollowStatusOptions): Promise<Res<FollowStatusVo>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/followsStatus`,
    method: 'POST',
    data: options,
  };
  return await request(requestConfig);
};

// 查询关注状态
export const getUserFollowsStatus = async (options: UserFollowsStatusOptions): Promise<Res<WeChatUserFollowsStatusVo>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/userFollowsStatus`,
    method: 'POST',
    data: options,
  };
  return await request(requestConfig);
};

export const getDislikeStatus = async (options: UserFollowsStatusOptions): Promise<Res<WeChatUserFollowsStatusVo>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/dislike`,
    method: 'POST',
    data: options,
  };
  return await request(requestConfig);
};


export const onRemoveImage = async (options: { userId: number | String; socialImg: number }): Promise<Res<any>> => {
  const requestConfig: RequestOptions = {
    url: `/v1/mp/user/delSocialImg?socialImgId=${options.socialImg}`,
    method: 'GET',
  };
  return await request(requestConfig);
};

// 优惠券类型定义
export type CouponItem = {
  id?: number;
  couponType: number;
  couponCount: number;
  couponName?: string;
  // 可以根据实际返回字段添加更多属性
};

// 优惠券弹窗数据类型
export type CouponPopoverData = {

  popoverFlag?: boolean;
  // 可以根据实际返回字段添加更多属性
};

// 获取用户未使用的优惠券列表
export const getUnusedCouponList = async (): Promise<Res<CouponItem[]>> => {
  const requestConfig: RequestOptions = {
    url: '/v1/mp/user/unusedCouponList',
    method: 'POST',
  };
  return await request(requestConfig);
};

// 获取优惠券弹窗数据
export const getCouponPopover = async (): Promise<Res<CouponPopoverData>> => {
  const requestConfig: RequestOptions = {
    url: '/v1/mp/coupon/popover',
    method: 'GET',
    needUser: false,
    headers: {
      'verify-code': 'owx6q5aL63n-e4OTKjHQJTbr6ZFY',
      'api-access-token': 'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyOiI6ImVkN2UxMzZhLTA4YmUtNDBkZC1hYWVjLWY1ZDcyNzA4ZTE3ZiIsImxvZ2luX3VzZXJfaWQ6IjoyfQ.wPuAZXJkkZuxxh4twYpZhx_aAlKMw3qxskPlMIw1VEngLGrVTEIL-t71HUJFz-f3arGGaIJTdjxsBhMxJQ0LNg'
    }
  };
  return await request(requestConfig);
};

// 优惠券核销请求参数类型
export type VerifyCouponRequest = {
  couponId: number;
  activityId: number;
};

// 优惠券核销响应类型
export type VerifyCouponResponse = {
  success: boolean;
  message?: string;
  // 可以根据实际返回字段添加更多属性
};

// 优惠券核销接口
export const verifyCoupon = async (couponId: number, activityId: number): Promise<Res<VerifyCouponResponse>> => {
  const requestConfig: RequestOptions = {
    url: '/v1/mp/coupon/verify',
    method: 'POST',
    data: {
      couponId,
      activityId
    }
  };
  return await request(requestConfig);
};