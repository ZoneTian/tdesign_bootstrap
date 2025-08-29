import * as navigateHelper from '../../utils/navigateHelper';
import { getUserID } from '../../utils/auth';
import { DebounceHelper, NavigateDebounce } from '../../utils/debounce';
import { DEFAULT_AVATAR } from '../../utils/constants';

const app = getApp<
  IAppOption & {
    globalData: {
      hasLogin: boolean;
      isRegistered: boolean;
      showVisible: boolean;
      userInfo?: {
        nickName: string;
        [key: string]: any;
      };
    };
  }
>();

Page({
  data: {
    defaultAvatar: DEFAULT_AVATAR, // 默认头像路径
    profile: {
      nickName: '未登录用户',
      followCount: 0, // 我喜欢的数量
      fansCount: 0, // 喜欢我的数量
    },
    isRegistered: false, // 是否已注册
  },

  onShow() {
    // 从全局数据中获取用户昵称和注册状态
    if (app.globalData) {
      // 获取用户昵称
      if (app.globalData.userInfo && app.globalData.userInfo.nickName) {
        this.setData({
          'profile.nickName': app.globalData.userInfo.nickName,
          'profile.avatarUrl': app.globalData.userInfo.avatarUrl,
          'profile.fansCount':
            typeof app.globalData.userInfo.fansCount === 'number'
              ? app.globalData.userInfo.fansCount
              : 0,
          'profile.followCount':
            typeof app.globalData.userInfo.followCount === 'number'
              ? app.globalData.userInfo.followCount
              : 0,
          photoReviewStatus: app.globalData.userInfo.photoReviewStatus,
          isRegistered: !!app.globalData.isRegistered,
        });
      }
    }
  },
  async onMyLikes() {
    return navigateHelper.goMyLikes();
  },
  async onLikesMe() {
    return navigateHelper.goLikesMe();
  },
  async onProfileVerification() {
    return navigateHelper.goProfileVerification();
  },
  async onSettings() {
    return navigateHelper.goSettings();
  },
  async onMyEvents() {
    return navigateHelper.goMyEvents();
  },

  async onEditProfile() {
    DebounceHelper.execute(
      'onEditProfile',
      () => {
        // 获取用户ID
        const userId = getUserID();
        if (!userId) {
          wx.showToast({
            title: '用户未登录',
            icon: 'none',
          });
          return;
        }

        // 跳转到编辑个人资料页面，并传递用户ID参数
        NavigateDebounce.navigateTo(`/packageA/pages/edit-profile/edit-profile?userId=${userId}`);
      },
      300,
    );
  },
  async goWelcome() {
    DebounceHelper.execute(
      'goWelcome',
      () => {
        NavigateDebounce.navigateTo('/pages/welcome/welcome');
      },
      300,
    );
  },

  // 跳转到个人资料编辑页面
  async onUploadAvatar() {
    DebounceHelper.execute(
      'onUploadAvatar',
      () => {
        // 获取用户ID
        const userId = getUserID();
        if (!userId) {
          wx.showToast({
            title: '用户未登录',
            icon: 'none',
          });
          return;
        }

        // 跳转到新的个人资料编辑页面，并传递用户ID参数
        NavigateDebounce.navigateTo(`/pages/profile-edit/profile-edit?userId=${userId}`);
      },
      300,
    );
  },
});
