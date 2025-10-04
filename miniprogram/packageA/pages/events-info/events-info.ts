import * as navigateHelper from '../../../utils/navigateHelper';
import {
  getActivityDetail,
  ActivityMpDetailVo,
  applyActivity,
  getActivityApplyUserList,
  ActivityMpApplyUserListVo,
} from '../../../utils/api';
import { DEFAULT_AVATAR } from '../../../utils/constants';
import { NavigateDebounce } from '../../../utils/debounce';



// 获取全局应用实例
const app = getApp<
  IAppOption & {
    globalData: {
      userInfo: any | null;
      hasLogin: boolean;
      isRegistered: boolean;
      showVisible: boolean;
    };
  }
>();

Page({
  data: {
    eventId: '',
    defaultAvatar: DEFAULT_AVATAR, // 默认头像路径
    eventInfo: {
      options: {
        current: 0,
        indicatorDots: false,
        vertical: false,
        autoplay: false,
        interval: 2000,
        duration: 500,
        easingFunction: 'linear',
      },
      items: [], // 轮播图项目
      avatars: [], // 头像列表
      userList: [] as ActivityMpApplyUserListVo[], // 报名用户列表
      info: {
        intro: '', // 活动介绍
        notice: '', // 活动须知
        images: [], // 活动图片
      },
      detail: {} as ActivityMpDetailVo, // 活动详情数据
      activityContentImgList: [], // 活动内容图片列表
    },
    authorization: false,
    showVisible: false,
    popup: {
      icon: '',
      buttonText: '知道了',
      isRegistered: false,
    },
    // 报名状态
    registrationStatus: {
      canRegister: false, // 是否可以报名
      statusText: '', // 状态文本
      isBeforeRegistration: false, // 是否在报名开始前
      isAfterRegistration: false, // 是否在报名结束后
    },
    // 设备信息
    hasHomeIndicator: false, // 是否有Home Indicator（如iPhone X及以上机型）
    // 分页相关数据
    currentPage: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    total: 0,
  },
  onLoad(options) {
    // 从页面路径中获取活动ID
    if (options && options.id) {
      this.setData({ eventId: options.id });
      this.fetchActivityDetail(options.id);
      this.fetchActivityApplyUserList(options.id, 1);
    }


    // 检测设备是否有Home Indicator
    this.checkDeviceHasHomeIndicator();
  },

  // 页面触底事件
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchActivityApplyUserList(this.data.eventId, this.data.currentPage);
    }
  },
  goUserDetail(e: any) {
    const userId = e.currentTarget.dataset.userid;
    // 跳转到用户主页，并携带userId参数
    NavigateDebounce.navigateTo(
      `/packageA/pages/public-profile/public-profile?userId=${userId}`,
    );
  },
  // 获取活动报名用户列表（支持分页）
  async fetchActivityApplyUserList(id: string, page: number = 1) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await getActivityApplyUserList(id, page, this.data.pageSize);
      if (res.code === 0 && res.data) {
        if (res.data.list.length === 0) { return }
        // 处理分页数据
        const newUsers = res.data.list || [];
        const currentUsers = page === 1 ? [] : this.data.eventInfo.userList;
        const allUsers = [...currentUsers, ...newUsers];
        const userAvatarList = allUsers.filter((user) => user.userCoverImg);

        // 将用户头像添加到轮播图中
        const swiperItems = userAvatarList.map((user, index) => ({
          path: user.userCoverImg || DEFAULT_AVATAR,
          info: {
            id: user.userId,
            nickname: user.nickName || '未知用户',
            age: '', // 可以根据需要添加年龄信息
          },
        }));

        this.setData({
          userList: allUsers,
          userAvatarList: allUsers.filter((user) => user.avatarUrl),
          'eventInfo.items': swiperItems, // 更新轮播图数据
          currentPage: page + 1,
          total: res.data.total || 0,
          hasMore:
            newUsers.length === this.data.pageSize &&
            currentUsers.length + newUsers.length < (res.data.total || 0),
        });

        console.log('轮播图数据已更新:', swiperItems);
      }
    } catch (error) {
      console.error('获取活动报名用户列表失败:', error);
    } finally {
      this.setData({ loading: false, }) // 更新轮播图数据 });
    }
  },

  // 检测设备是否有Home Indicator
  checkDeviceHasHomeIndicator() {
    wx.getSystemInfo({
      success: (res) => {
        // 检查是否为iPhone X及以上机型（有Home Indicator的机型）
        const model = res.model.toLowerCase();
        const isIPhoneX =
          model.includes('iphone x') ||
          model.includes('iphone 11') ||
          model.includes('iphone 12') ||
          model.includes('iphone 13') ||
          model.includes('iphone 14') ||
          model.includes('iphone 15');

        // 或者通过安全区域判断
        const hasHomeIndicator = res.safeArea && res.screenHeight - res.safeArea.bottom > 0;

        this.setData({
          hasHomeIndicator: isIPhoneX || hasHomeIndicator,
        });
      },
    });
  },
  // 获取活动详情
  async fetchActivityDetail(id: string) {
    console.log('id', id);

    wx.showLoading({ title: '加载中...' });
    try {
      const res = await getActivityDetail(id);
      if (res.code === 0 && res.data) {
        const detail = res.data;

        // 处理活动介绍和须知
        const intro = detail.activityContent || '';

        // 设置轮播图（初始状态，后续会被用户头像替换）
        const swiperItems = detail.mainCoverImage
          ? [
            {
              path: detail.mainCoverImage,
              info: {
                id: detail.id,
                nickname: detail.activityTitle,
                age: '',
              },
            },
          ]
          : [];

        // 格式化活动时间和地点
        const formattedStartTime = this.formatDateTime(detail.activityStartTime);
        const formattedEndTime = this.formatTime(detail.activityEndTime);
        const activityTimeDisplay = `${formattedStartTime} – ${formattedEndTime}`;
        const activityLocationDisplay = `${detail.province || ''}${detail.city || ''} ${detail.address || ''}`;

        // 判断报名状态
        const now = new Date();
        const applyStartTime = detail.applyStartTime ? new Date(detail.applyStartTime) : null;
        const applyEndTime = detail.applyEndTime ? new Date(detail.applyEndTime) : null;

        let canRegister = false;
        let statusText = '';
        let isBeforeRegistration = false;
        let isAfterRegistration = false;

        // 判断用户是否已经报名
        if (detail.isRegistered) {
          // 用户已报名
          statusText = '已报名';
          canRegister = false;
        } else if (applyStartTime && applyEndTime) {
          if (now < applyStartTime) {
            // 报名未开始
            statusText = '敬请期待';
            isBeforeRegistration = true;
          } else if (now > applyEndTime) {
            // 报名已结束
            statusText = '报名已结束';
            isAfterRegistration = true;
          } else {
            // 可以报名
            canRegister = true;
            // statusText = `上车（¥${detail.activityPrice}）`;
            statusText = `立刻报名`;
          }
        }

        this.setData({
          'eventInfo.detail': detail,
          'eventInfo.items': swiperItems,
          'eventInfo.info.intro': intro,
          'eventInfo.notice': detail.notes,
          'eventInfo.info.images': detail.mainCoverImage ? [detail.mainCoverImage] : [],
          'eventInfo.activityTimeDisplay': activityTimeDisplay,
          'eventInfo.activityLocationDisplay': activityLocationDisplay,
          'eventInfo.activityContentImgList': detail.activityContentImgList || [], // 活动内容图片列表
          'registrationStatus.canRegister': canRegister,
          'registrationStatus.statusText': statusText,
          'registrationStatus.isBeforeRegistration': isBeforeRegistration,
          'registrationStatus.isAfterRegistration': isAfterRegistration,
        });
      } else {
        wx.showToast({
          title: res.msg || '获取活动详情失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
      wx.showToast({
        title: '获取活动详情失败',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },
  // 格式化日期时间为 "周二 04.30 20:30" 格式
  formatDateTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `周${weekDay} ${month}.${day} ${hours}:${minutes}`;
  },

  // 只格式化时间部分为 "HH:MM" 格式
  formatTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  },
  onChange(e: WechatMiniprogram.CustomEvent<{ current: number }>) {
    const { current } = e.detail;
    console.log('轮播图切换:', {
      current,
      totalItems: this.data.eventInfo.items.length,
      currentItem: this.data.eventInfo.items[current],
    });

    this.setData({
      'eventInfo.options.current': current,
    });
  },
  goAttendeeList() {
    return navigateHelper.goAttendeeList(this.data.eventId);
  },
  goMyEvents() {
    return navigateHelper.goMyEvents();
  },
  // 分享当前页面到朋友
  goShare() {
    const { eventInfo } = this.data;
    const { detail } = eventInfo;

    // 构建分享信息
    const shareData = {
      title: detail.activityTitle || '精彩活动等你来',
      path: `/packageA/pages/events-info/events-info?id=${this.data.eventId}`,
      imageUrl: detail.mainCoverImage || '', // 活动主图作为分享图片
    };

    // 显示分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: () => {
        console.log('分享菜单显示成功');
      },
      fail: (err) => {
        console.error('分享菜单显示失败:', err);
        // 如果分享菜单显示失败，直接调用分享到朋友
        this.shareToFriend(shareData);
      },
    });
  },


  async onPayment() {
    if (this.data.registrationStatus.isBeforeRegistration || this.data.registrationStatus.isAfterRegistration) {
      return;
    }

    if (!app.globalData.isRegistered || app.globalData.userInfo.photoReviewStatus === 0) {
      const isRegistered = app.globalData.isRegistered;
      // 未授权
      this.setData({
        showVisible: true,
        'popup.icon': !app.globalData.isRegistered ? 'register' : 'identify',
        'popup.btnText': !isRegistered ? '去注册' : '去认证',
        'popup.title': !isRegistered ? '您还没有注册' : '您还没有展示社交照片',
      });
      return;
    }
    // 增加对于微信号的判断
    if (!app.globalData.userInfo.wechatAccount) {
      wx.showModal({
        title: '提示',
        content: '您尚未填写微信号，填写后方可报名',
        showCancel: true,
        confirmText: '去填写',
        success: (res) => {
          if (res.confirm) {
            // 用户点击了直接报名
            navigateHelper.goEditProfile();
          }
        },
        fail: (err) => {
          return;
        },
      });
      return
    }
    // 用户已注册，调用注册活动接口
    const { eventId } = this.data;
    if (!eventId) {
      wx.showToast({
        title: '活动ID不存在',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '正在报名...',
      mask: true,
    });

    try {
      const res = await applyActivity(eventId);
      wx.hideLoading();

      if (res.code === 0) {
        wx.showToast({
          title: '活动报名成功',
          icon: 'success',
        });

        // 报名成功后，可以更新页面状态或跳转到其他页面
        setTimeout(() => {
          navigateHelper.goMyEvents();
        }, 1500);
      } else {
        wx.showToast({
          title: res.msg || '活动报名失败',
          icon: 'none',
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('活动报名失败:', error);
      wx.showToast({
        title: '活动报名失败，请重试',
        icon: 'none',
      });
    }
  },
  onClose() {
    this.setData({
      showVisible: false,
    });
  },
  onConfirm() {
    try {
      if (app.globalData.isRegistered && app.globalData.userInfo.photoReviewStatus === 0) {

        NavigateDebounce.navigateTo('/packageA/pages/profile-verification/profile-verification');
      } else {
        NavigateDebounce.navigateTo('/pages/welcome/welcome');
      }
    } catch (error: any) {
      console.error('跳转失败:', error);
      console.error('错误详情:', {
        message: error?.message || '未知错误',
        stack: error?.stack || '无堆栈信息',
        time: new Date().toLocaleString(),
      });
      throw error;
    }
  },
  onEventInfo() {
    return navigateHelper.goEventsInfo();
  },

  // 分享给朋友
  onShareAppMessage() {
    const { eventInfo } = this.data;
    const { detail } = eventInfo;

    return {
      title: detail.activityTitle || '精彩活动等你来',
      path: `/packageA/pages/events-info/events-info?id=${this.data.eventId}`,
      imageUrl: detail.mainCoverImage || '', // 活动主图作为分享图片
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { eventInfo } = this.data;
    const { detail } = eventInfo;

    return {
      title: detail.activityTitle || '精彩活动等你来',
      query: `id=${this.data.eventId}`,
      imageUrl: detail.mainCoverImage || '', // 活动主图作为分享图片
    };
  },
  onBack() {
    // 检查页面栈长度，如果大于1则返回上一页，否则跳转到活动列表页
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      navigateHelper.goEvents();
    }
  }
});
