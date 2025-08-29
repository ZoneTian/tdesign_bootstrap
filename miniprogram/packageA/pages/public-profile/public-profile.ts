import { selfDescription, friendshipTend, sliderImages } from './public-profile.config';
import { NavigateDebounce } from '../../../utils/debounce';

const app = getApp<
  IAppOption & {
    globalData: {
      userInfo: WechatMiniprogram.UserInfo | null;
      hasLogin: boolean;
      isRegistered: boolean;
      showVisible: boolean;
    };
  }
>();
import {
  getUserDetail,
  getUserPhoto,
  WeChatUserDetailVo,
  WeChatMyPhotoVo,
  followsStatus,
  FollowStatusOptions,
  getUserFollowsStatus,
  UserFollowsStatusOptions,
  WeChatUserFollowsStatusVo,
  Res,
} from '../../../utils/api';
import { getUserID } from '../../../utils/auth';
import { DebounceHelper } from '../../../utils/debounce';

Page({
  data: {
    showVisible: false,
    popup: {
      icon: '',
      buttonText: '知道了',
      isRegistered: false,
      title: '',
      btnText: '去注册'
    },
    userId: '', // 用户ID
    currentUserId: '', // 当前登录用户ID
    isOwnProfile: false, // 是否是自己的资料页面
    userDetail: null as WeChatUserDetailVo | null, // 用户详情数据
    userPhotos: null as WeChatMyPhotoVo | null, // 用户社交照片数据
    friendshipTend,
    publicProfile: {
      options: {
        indicatorDots: true,
        vertical: false,
        autoplay: false,
        interval: 2000,
        duration: 500,
        easingFunction: 'easeInOutCubic',
      },
      items: sliderImages,
    },
    isFollowed: false,
    visible: false,
    selfDescription,
  },

  // 格式化生日为年份显示
  formatBirthdayToYear(birthday: string | number): string {
    if (!birthday) return '';

    let year = '';
    if (typeof birthday === 'string') {
      // 如果是字符串格式，如 "1990-01-01" 或 "1990年01月01日"
      const match = birthday.match(/(\d{4})/);
      if (match) {
        year = match[1];
      }
    } else if (typeof birthday === 'number') {
      // 如果是时间戳
      const date = new Date(birthday);
      year = date.getFullYear().toString();
    }
    year = year.slice(-2);
    return year ? `${year}年` : '';
  },

  onLoad(options) {
    // 获取当前登录用户ID
    const currentUserId = getUserID();

    // 从页面路径中获取用户ID
    if (options && options.userId) {
      const userId = Number(options.userId);
      const isOwnProfile = currentUserId ? Number(currentUserId) === userId : false;

      this.setData({
        userId: userId.toString(),
        currentUserId: currentUserId || '',
        isOwnProfile: isOwnProfile,
      });

      this.fetchUserData(Number(userId));
    }
  },

  // 获取用户数据（包括详情和照片）
  async fetchUserData(userId: number) {
    try {
      wx.showLoading({ title: '加载中...' });
      console.log('获取用户ID:', userId);

      // 获取当前登录用户ID
      const currentUserId = getUserID();
      
      // 并行调用接口，传入指定的用户ID
      const detailPromise = getUserDetail(userId);
      const photoPromise = getUserPhoto(userId);
      
      // 如果不是自己的资料页面且已登录，则查询关注状态
      let followStatusPromise: Promise<Res<WeChatUserFollowsStatusVo>> | null = null;
      if (currentUserId && Number(currentUserId) !== userId) {
        const followStatusOptions: UserFollowsStatusOptions = {
          selfUserId: Number(currentUserId),
          targetUserId: userId
        };
        followStatusPromise = getUserFollowsStatus(followStatusOptions);
      }
      
      // 等待所有请求完成
      const [detailRes, photoRes] = await Promise.all([detailPromise, photoPromise]);
      // 单独处理关注状态请求
      const followStatusRes = followStatusPromise ? await followStatusPromise : undefined;
      // 处理结果

      // 处理用户详情
      if (detailRes.code === 0 && detailRes.data) {
        this.setData({
          userDetail: detailRes.data,
          brithDay: this.formatBirthdayToYear(detailRes.data.userBirthday),
        });
        console.log('用户详情:', detailRes.data);
      } else {
        console.error('获取用户详情失败:', detailRes.msg);
      }

      // 处理用户照片
      if (photoRes.code === 0 && photoRes.data) {
        // 确保 socializingImgList 是数组且包含有效的图片URL
        const socializingImgList = photoRes.data.socialImg || [];

        // 如果没有有效图片，使用默认图片
        const finalImages = socializingImgList.length > 0 ? socializingImgList : sliderImages;

        this.setData({
          userPhotos: photoRes.data,
          'publicProfile.items': socializingImgList,
        });
        console.log('用户照片:', finalImages);
        console.log('最终显示的图片:', finalImages);
      } else {
        console.error('获取用户照片失败:', photoRes.msg);
        // 照片获取失败时，使用默认图片
        this.setData({
          'publicProfile.items': sliderImages,
        });
      }

      // 处理关注状态
      if (followStatusRes && followStatusRes.code === 0 && followStatusRes.data) {
        const followStatus = followStatusRes.data.followStatus;
        // 0:未关注 1:关注对方 2:互相关注
        this.setData({
          isFollowed: followStatus === 1 || followStatus === 2
        });
        console.log('关注状态:', followStatus);
      }

      // 如果接口都失败，显示错误提示
      if (detailRes.code !== 0 && photoRes.code !== 0) {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
      // 发生错误时，确保显示默认图片
      this.setData({
        'publicProfile.items': sliderImages,
      });
      wx.showToast({
        title: '网络异常，请重试',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 保留原有的单独获取用户详情方法（如果需要）
  async fetchUserProfile(userId: number) {
    try {
      const res = await getUserDetail(userId);

      if (res.code === 200 && res.data) {
        this.setData({
          userDetail: res.data,
        });
        console.log('用户详情:', res.data);
      } else {
        wx.showToast({
          title: res.msg || '获取用户信息失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('获取用户详情失败:', error);
      wx.showToast({
        title: '网络异常，请重试',
        icon: 'none',
      });
    }
  },

  async handlePopup(e: any) {
    DebounceHelper.execute(
      'handlePopup',
      () => {
          // 如果用户未注册，显示注册提示
        if (!app.globalData.isRegistered) {
          this.setData({
            showVisible: true,
            'popup.icon': !app.globalData.isRegistered ? 'register' : 'identify',
            'popup.title': !app.globalData.isRegistered ? '您还没有注册' : '您还没有身份认证',
            'popup.btnText': !app.globalData.isRegistered ? '去注册' : '去认证',
          });
          return;
        }
        this.setData({ visible: true });
      },
      300,
    );
  },

  async onVisibleChange(e: any) {
    this.setData({
      visible: e.detail.visible,
    });
  },

  async followUser() {
    DebounceHelper.execute(
      'followUser',
      async () => {
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

          // 检查注册和认证状态
          if (!app.globalData.isRegistered) {
            this.setData({
              showVisible: true,
              'popup.icon': !app.globalData.isRegistered ? 'register' : 'identify',
              'popup.title': !app.globalData.isRegistered ? '您还没有注册' : '您还没有身份认证',
              'popup.btnText': !app.globalData.isRegistered ? '去注册' : '去认证'
            });
            return;
          }

          // 获取被关注用户ID
          const followedUserId = this.data.userId;
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

          if (res.code === 0) {
              this.setData({
                isFollowed: true,
                visible: false,
              });
              wx.showToast({
                title: '关注成功',
                icon: 'success',
              });

          } else {
            wx.showToast({
              title: res.msg || '关注失败',
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
      500,
    );
  },

  onClose() {
    this.setData({
      showVisible: false,
    });
  },

  onConfirm() {
    DebounceHelper.execute(
      'onConfirm',
      () => {
        if (app.globalData.isRegistered && app.globalData.userInfo.photoReviewStatus === 0) {
          NavigateDebounce.navigateTo('/packageA/pages/profile-verification/profile-verification');
        } else {
          NavigateDebounce.navigateTo('/pages/welcome/welcome');
        }
      },
      300,
    );
  },

  async unfollowUser() {
    DebounceHelper.execute(
      'unfollowUser',
      async () => {
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
          const followedUserId = this.data.userId;
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
            status: 2,
          };

          wx.showLoading({ title: '处理中...' });

          const res = await followsStatus(followOptions);

          if (res.code === 0) {
       
              this.setData({
                isFollowed: false,
                visible: false,
              });
              wx.showToast({
                title: '取消关注成功',
                icon: 'success',
              });

          } else {
            wx.showToast({
              title: res.msg || '取消关注失败',
              icon: 'none',
            });
          }
        } catch (error) {
          console.error('取消关注操作失败:', error);
          wx.showToast({
            title: '网络错误，请重试',
            icon: 'none',
          });
        } finally {
          wx.hideLoading();
        }
      },
      500,
    );
  },
});
