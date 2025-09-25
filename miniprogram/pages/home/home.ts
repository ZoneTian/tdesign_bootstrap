import { AreaChangeDetail } from '../personal-info/personal-info';
import { items } from './home.config';
import Message from 'tdesign-miniprogram/message/index';
import {
  getReferrerList,
  ReferrerUserVo,
  followsStatus,
  FollowStatusOptions,
  getDislikeStatus,
} from '../../utils/api';
import { getUserID } from '../../utils/auth';
import { DebounceHelper, NavigateDebounce } from '../../utils/debounce';
import { POPUP_SHOWN_KEY } from '../../utils/constants';
import { subscribeMessage } from '../../utils/subscribe';

const app = getApp<
  IAppOption & {
    globalData: {
      userInfo: WechatMiniprogram.UserInfo | null;
      hasLogin: boolean;
      isRegistered: boolean;
      showVisible: boolean;
      presentPopupShow: boolean;
    };
  }
>();

Page({
  data: {
    showVisible: false,
    position: '通州',
    home: {
      options: {
        indicatorDots: false,
        vertical: true,
        autoplay: false,
        interval: 2000,
        duration: 500,
        easingFunction: 'easeInOutCubic',
      },
      items: items,
    },
    popup: {
      // icon: 'https://qiniustatic.womenshike.top/icon-action-popup-broadcast.png',
      icon: '',
      title: '',
      subTitle: '',
      btnText: '知道了',
    },
    // 推荐用户列表相关数据
    referrerList: [] as ReferrerUserVo[],
    currentPage: 1,
    pageSize: 10,
    isLoading: false,
    hasMore: true,
    // 底部导航栏高度
    footerHeight: '160rpx',
    // 当前轮播图索引
    currentSwiperIndex: 0,
  },
  bindanimationfinish(
    e: WechatMiniprogram.CustomEvent<{
      current: number;
    }>,
  ) {
    const current = e.detail.current;

    // 更新当前轮播图索引
    this.setData({
      currentSwiperIndex: current,
    });

    const length = this.data.referrerList.length - 1;
    if (length === current) {
      if (this.data.hasMore) {
        // 如果还有更多数据，加载下一页
        this.loadReferrerList();
      } else {
        // 如果没有更多数据，显示提示
        Message.info({
          context: this,
          offset: [120, 38.4615],
          duration: 3000,
          icon: false,
          // single: false, // 打开注释体验多个消息叠加效果
          content: '当前的推荐已经到底啦',
          align: 'center',
        });
      }
    }
  },
  showRegionPicker(
    e: WechatMiniprogram.CustomEvent<{
      currentTarget: { dataset: { field: string } };
    }>,
  ) {
    const field = e.currentTarget.dataset.field;

    this.selectComponent('#areaPicker').onAreaPicker(field);
  },

  onPositionChange(e: WechatMiniprogram.CustomEvent<AreaChangeDetail>) {
    const { text, value } = e.detail;

    const positionOptions: Option = {
      label: text.join('-'),
      value: value.join('-'),
    };

    this.setData({
      position: text[text.length - 1],
    });
  },
  async onPink() {
    DebounceHelper.execute(
      'onPink',
      async () => {
        // 如果用户未注册，显示注册提示
        if (!app.globalData.isRegistered || app.globalData.userInfo.photoReviewStatus !== 1) {
          this.setData({
            showVisible: true,
            'popup.title': !app.globalData.isRegistered ? '您还没有注册' : '您还没有身份认证',
            'popup.btnText': !app.globalData.isRegistered ? '去注册' : '去认证',
            'popup.icon': !app.globalData.isRegistered ? 'register' : 'identify',
            'popup.subtitle': '',
          });
          return;
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

          // 获取当前显示的用户ID
          const currentIndex = this.data.currentSwiperIndex;
          const currentUser = this.data.referrerList[currentIndex];

          if (!currentUser || !currentUser.userId) {
            wx.showToast({
              title: '用户信息不完整',
              icon: 'none',
            });
            return;
          }

          // 调用关注状态接口
          const followOptions: FollowStatusOptions = {
            followerId: parseInt(currentUserId),
            followedId: currentUser.userId,
            status: 1,
          };

          wx.showLoading({ title: '处理中...' });

          const res = await followsStatus(followOptions);

          if (res.code === 0) {
            wx.showToast({
              title: '关注成功',
              icon: 'success',
            });
          } else {
            wx.showToast({
              title: res.msg || '操作失败',
              icon: 'none',
            });
          }
        } catch (error) {
          // console.error('关注操作失败:', error);
          // wx.showToast({
          //   title: '网络错误，请重试',
          //   icon: 'none'
          // });
        } finally {
          wx.hideLoading();
        }
      },
      500,
    );
  },
  onClose() {
    this.setData({ showVisible: false, });
  },

  onEventInfo(e: WechatMiniprogram.CustomEvent<{
    currentTarget: any;
  }>) {
    DebounceHelper.execute(
      'onEventInfo',
      () => {
        if (!e.currentTarget.dataset.activityid) {

          return;
        }
        NavigateDebounce.navigateTo(`/packageA/pages/events-info/events-info?id=${e.currentTarget.dataset.activityid}`);
      },
      300,
    );
  },
  goWelcome() {
    DebounceHelper.execute(
      'goWelcome',
      () => {
        NavigateDebounce.navigateTo('/pages/welcome/welcome');
      },
      300,
    );
  },

  // 点击用户头像，跳转到用户主页
  onUserProfile(e: WechatMiniprogram.CustomEvent) {
    DebounceHelper.execute(
      'onUserProfile',
      () => {
        const userId = e.currentTarget.dataset.userid;
        if (!userId) {
          wx.showToast({
            title: '用户ID不存在',
            icon: 'none',
          });
          return;
        }

        // 跳转到用户主页，并携带userId参数
        NavigateDebounce.navigateTo(
          `/packageA/pages/public-profile/public-profile?userId=${userId}`,
        );
      },
      300,
    );
  },

  onLoad() {
    // 检查弹窗是否已经显示过
    const that = this
    if (!app.globalData.presentPopupShow) {
      if (app.globalData.userInfo.photoReviewStatus !== 1) {
        this.setData({
          'popup.title': '您可以获得 1 次免费 \n 参加活动的机会',
          'popup.subtitle': '只需上传社交照片，并通过人脸认证',
          'popup.btnText': '知道了',
          'popup.icon': 'present',
        }, () => {
          that.setData({
            showVisible: true,
          });
          // 设置弹窗已显示状态
          app.globalData.presentPopupShow = true
        });
        return;
      }
      this.setData({
        'popup.title': '您可以获得 1 次免费 \n 参加活动的机会',
        'popup.subtitle': '只被需2人关注即可免费获得',
        'popup.btnText': '知道了',
        'popup.icon': 'present',
      }, () => {
        that.setData({
          showVisible: true,
        });
        // 设置弹窗已显示状态
        app.globalData.presentPopupShow = true
      });
    }

    // 检查登录状态
    this.checkLoginStatus = function () {
      // 根据app.globalData.hasLogin状态执行相应操作
      if (!app.globalData.hasLogin) {
        console.log('用户未登录');
        // 可以添加未登录状态的处理逻辑
      } else {
        console.log('用户已登录');
      }
    };
    this.checkLoginStatus();
    // 加载推荐用户列表
    this.loadReferrerList();
    // 获取底部导航栏高度
    this.getFooterHeight();
  },

  // 页面卸载时清除弹窗显示状态
  onUnload() {
    // 小程序关闭时删除本地存储的弹窗状态
    try {
      wx.removeStorageSync(POPUP_SHOWN_KEY);
    } catch (e) {
      console.error('删除弹窗显示状态失败：', e);
    }
  },

  // 获取底部导航栏高度
  getFooterHeight() {
    try {
      // 尝试从本地存储获取高度
      const footerHeight = wx.getStorageSync('footerHeight');
      if (footerHeight) {
        this.setData({ footerHeight });
      } else {
        // 如果没有获取到，设置默认值
        this.setData({ footerHeight: '160rpx' });
      }
    } catch (e) {
      // 如果出错，设置默认值
      this.setData({ footerHeight: '160rpx' });
    }
  },

  // 加载推荐用户列表
  async loadReferrerList() {
    if (this.data.isLoading || !this.data.hasMore) return;

    try {
      this.setData({ isLoading: true });

      const res = await getReferrerList(this.data.currentPage, this.data.pageSize);

      if (res.code === 0 && res.data) {
        // 如果是第一页，直接设置数据
        if (this.data.currentPage === 1) {
          this.setData({
            referrerList: res.data.list,
            home: {
              ...this.data.home,
              // items: this.formatReferrerListToItems(res.data.list)
            },
          });
        } else {
          // 如果不是第一页，追加数据
          const newReferrerList = [...this.data.referrerList, ...res.data.list];
          this.setData({
            referrerList: newReferrerList,
            home: {
              ...this.data.home,
              // items: this.formatReferrerListToItems(newReferrerList)
            },
          });
        }

        // 判断是否还有更多数据
        this.setData({
          hasMore: res.data.list && res.data.list.length === this.data.pageSize,
          currentPage: this.data.currentPage + 1,
        });
      } else {
        wx.showToast({
          title: res.msg || '获取推荐用户失败',
          icon: 'none',
        });
      }
    } catch (error) {
      // console.error('加载推荐用户列表失败:', error);
      // wx.showToast({
      //   title: '加载推荐用户失败',
      //   icon: 'none'
      // });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 将推荐用户列表转换为轮播图项目格式
  formatReferrerListToItems(referrerList: ReferrerUserVo[]) {
    return referrerList.map((user) => ({
      image: user.avatarUrl || 'https://qiniustatic.womenshike.top/default-avatar.png',
      title: user.nickName || '匿名用户',
      // description: `${user.age || '?'}岁 · ${user.city || '未知'} · ${user.profession || '未知职业'}`,
      // mbti: user.mbti || 'UNKNOWN',
      socialImages: user.socialImages || [],
      userId: user.userId,
    }));
  },

  // 检查登录状态和注册状态
  checkLoginStatus() {
    // 如果全局数据中已经有登录状态，直接使用
    if (!app.globalData || app.globalData.hasLogin === undefined) {
      // 检查是否已注册
      const checkInterval = setInterval(() => {
        if (app.globalData && app.globalData.hasLogin !== undefined) {
          // 登录状态已更新，清除定时器
          clearInterval(checkInterval);


        }
      }, 500); // 每500毫秒检查一次

      // 设置超时，避免无限等待
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('等待登录状态超时');
      }, 10000); // 10秒后超时
    }
  },

  onReject(e: WechatMiniprogram.CustomEvent) {
    DebounceHelper.execute(
      'onReject',
      async () => {
        const userId = e.currentTarget.dataset.userid;
        if (!userId) {
          wx.showToast({
            title: '用户ID不存在',
            icon: 'none',
          });
          return;
        }

        // 请根据实际情况修改获取 selfUserId 的方式
        const selfUserId = getUserID() || '';
        const res = await getDislikeStatus({
          selfUserId,
          targetUserId: userId,
        });
        if (res.code === 0) {
          const referrerList = this.data.referrerList || [];
          this.setData({
            referrerList: referrerList.filter(user => user.userId !== userId),
          });
        } else {
          wx.showToast({
            title: res.msg || '不喜欢操作失败',
            icon: 'none'
          });
        }
      },
      300,
    );
  },
  async onSubscribe() {
    if (this.data.popup.icon === 'present') {
      await subscribeMessage(['ywtnkrvlOYD-OFZ_97qTq4jZ6tHQhfBYWxVI6Z9yOss']);
      this.onClose()
      return;
    }
    DebounceHelper.execute(
      'onConfirm',
      () => {
        this.onClose()
        if (app.globalData.isRegistered && app.globalData.userInfo.photoReviewStatus === 0) {
          NavigateDebounce.navigateTo('/packageA/pages/profile-verification/profile-verification');
        } else {
          NavigateDebounce.navigateTo('/pages/welcome/welcome');
        }
      },
      300,
    );


  }
  // onAddToFavorites
  // packageA/pages/events-info/events-info
});
