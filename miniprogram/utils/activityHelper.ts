import { getActivityList, ActivityMpListVo, PageInfoActivityMpListVo, getMyActivityList } from './api';

/**
 * 活动列表加载配置
 */
export interface ActivityListOptions {
  activityStatus?: number; // 活动状态：1-可报名，2-已结束
  showLoading?: boolean; // 是否显示加载提示
  loadingTitle?: string; // 加载提示文字
  pageNum?: number; // 页码，默认为1
  pageSize?: number; // 每页数量，默认为10
}

/**
 * 活动列表加载结果
 */
export interface ActivityListResult {
  success: boolean;
  data?: PageInfoActivityMpListVo;
  error?: string;
}

/**
 * 加载活动列表的公共函数
 * @param options 加载配置选项
 * @returns Promise<ActivityListResult>
 */
export async function loadActivityList(
  options: ActivityListOptions = {},
): Promise<ActivityListResult> {
  const { activityStatus, showLoading = true, loadingTitle = '加载中...', pageNum = 1, pageSize = 10 } = options;

  try {
    if (showLoading) {
      wx.showLoading({ title: loadingTitle });
    }
    const registered = getApp().globalData.isRegistered || false;
    const res = await getActivityList(activityStatus, registered, pageNum, pageSize);

    if (res.code === 0 && res.data) {
      console.log(
        `活动列表加载成功 ${activityStatus ? `(状态: ${activityStatus})` : ''}:`,
        res.data,
      );
      return {
        success: true,
        data: res.data,
      };
    } else {
      console.error('获取活动列表失败:', res.msg);
      const errorMsg = res.msg || '获取活动列表失败';

      wx.showToast({
        title: errorMsg,
        icon: 'none',
      });

      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error) {
    console.error('加载活动列表异常:', error);
    const errorMsg = '网络异常，请重试';

    wx.showToast({
      title: errorMsg,
      icon: 'none',
    });

    return {
      success: false,
      error: errorMsg,
    };
  } finally {
    if (showLoading) {
      wx.hideLoading();
    }
  }
}

/**
 * 加载活动列表的公共函数
 * @param options 加载配置选项
 * @returns Promise<ActivityListResult>
 */
export async function loadMyActivityList(
  options: ActivityListOptions = {},
): Promise<ActivityListResult> {
  const { activityStatus, showLoading = true, loadingTitle = '加载中...', pageNum = 1, pageSize = 10 } = options;

  try {
    if (showLoading) {
      wx.showLoading({ title: loadingTitle });
    }
    const res = await getMyActivityList(activityStatus, pageNum, pageSize);

    if (res.code === 0 && res.data) {
      console.log(
        `活动列表加载成功 ${activityStatus ? `(状态: ${activityStatus})` : ''}:`,
        res.data,
      );
      return {
        success: true,
        data: res.data,
      };
    } else {
      console.error('获取活动列表失败:', res.msg);
      const errorMsg = res.msg || '获取活动列表失败';

      wx.showToast({
        title: errorMsg,
        icon: 'none',
      });

      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error) {
    console.error('加载活动列表异常:', error);
    const errorMsg = '网络异常，请重试';

    wx.showToast({
      title: errorMsg,
      icon: 'none',
    });

    return {
      success: false,
      error: errorMsg,
    };
  } finally {
    if (showLoading) {
      wx.hideLoading();
    }
  }
}

/**
 * 根据活动状态获取对应的中文描述
 * @param status 活动状态
 * @returns 状态描述
 */
export function getActivityStatusText(status: number): string {
  switch (status) {
    case 1:
      return '可报名';
    case 2:
      return '已结束';
    default:
      return '未知状态';
  }
}
