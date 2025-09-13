import * as navigateHelper from '../../../utils/navigateHelper';
import { getActivityApplyUserList, followsStatus, FollowStatusOptions } from '../../../utils/api';
import { getUserID } from '../../../utils/auth';
import { DEFAULT_AVATAR } from '../../../utils/constants';

Page({
  data: {
    activityId: '',
    currentUserId: '', // 当前用户ID
    defaultAvatar: DEFAULT_AVATAR, // 默认头像路径
    attendeeList: {
      items: [] as Array<{
        userId: string;
        nickName: string;
        avatarUrl: string;
        gender: number;
        activityId?: string;
        isFollowed: number; // 新增关注状态字段：1-已关注，0-未关注
        userCoverImg: string;
      }>,
    },
    loading: false,
    // 分页相关数据
    currentPage: 1,
    pageSize: 10,
    hasMore: true,
    total: 0,
  },

  onLoad(options) {
    // 获取当前用户ID
    const currentUserId = getUserID();
    this.setData({ currentUserId: currentUserId || '' });

    // 从页面路径中获取活动ID
    if (options && options.activityId) {
      this.setData({ activityId: options.activityId });
      this.fetchActivityApplyUserList(options.activityId, 1);
    }
  },

  // 页面触底事件
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchActivityApplyUserList(this.data.activityId, this.data.currentPage);
    }
  },

  // 获取活动报名用户列表（支持分页）
  async fetchActivityApplyUserList(activityId: string, page: number = 1) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await getActivityApplyUserList(activityId, page, this.data.pageSize);
      if (res.code === 0 && res.data) {
        // 处理分页数据
        let newItems = res.data.list || [];
        newItems = newItems.filter((d) => d.userCoverImg)
        const currentItems = page === 1 ? [] : this.data.attendeeList.items;

        this.setData({
          'attendeeList.items': [...currentItems, ...newItems],
          currentPage: page + 1,
          total: res.data.total || 0,
          hasMore:
            newItems.length === this.data.pageSize &&
            currentItems.length + newItems.length < (res.data.total || 0),
        });
      } else {
        wx.showToast({
          title: res.msg || '获取报名用户列表失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('获取活动报名用户列表失败:', error);
      wx.showToast({
        title: '获取报名用户列表失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async toPublicProfile(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index;
    const userId = this.data.attendeeList.items[index]?.userId || '';

    if (userId) {
      // 传递用户ID到公共资料页面
      return await navigateHelper.goPublicProfile(userId);
    }
  },

  // 关注用户
  async onFollowUser(e: WechatMiniprogram.TouchEvent) {
    // 阻止事件冒泡，避免触发 toPublicProfile
    const event = e as any;
    if (event.stopPropagation) {
      event.stopPropagation();
    }

    try {
      // 获取当前用户ID
      const currentUserId = getUserID();
      if (!currentUserId) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
        });
        return;
      }

      // 获取被关注用户ID
      const followedUserId = e.currentTarget.dataset.userId;
      if (!followedUserId) {
        wx.showToast({
          title: '用户信息不完整',
          icon: 'none',
        });
        return;
      }

      // 调用关注状态接口
      const followOptions: FollowStatusOptions = {
        followerId: parseInt(currentUserId),
        followedId: parseInt(followedUserId),
        status: 1,
      };

      wx.showLoading({ title: '处理中...' });

      const res = await followsStatus(followOptions);

      if (res && res.code === 0 && res.data) {
        const status = res.data.status;
        if (status === 1) {
          wx.showToast({
            title: '关注成功',
            icon: 'success',
          });
        } else if (status === 2) {
          wx.showToast({
            title: '取消关注成功',
            icon: 'success',
          });
        }
      } else {
        wx.showToast({
          title: (res && res.msg) || '操作失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },
});
