import * as navigateHelper from '../../../utils/navigateHelper';
import * as auth from '../../../utils/auth';
import { request } from '../../../utils/request';
import { setOpenID, setUserID } from '../../../utils/auth';

Page({
  data: {
    phoneNumber: '', // 用户手机号，格式化后显示
  },
  
  onLoad() {
    // 获取用户信息，包括手机号
    this.getUserInfo();
  },
  
  // 获取用户信息
  async getUserInfo() {
    try {
      // 从本地存储获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.phone) {
        // 格式化手机号显示
        const phone = userInfo.phone;
        const formattedPhone = phone.substring(0, 3) + '****' + phone.substring(7);
        this.setData({
          phoneNumber: formattedPhone
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },
  async onUserAgreementTap() {
    return navigateHelper.goUserAgreement();
  },
  async onPrivacyAgreementTap() {
    return navigateHelper.goPrivateAgreement();
  },
  // 处理微信手机号授权
  async onsettingsVerification(e: WechatMiniprogram.CustomEvent) {
    try {
      // 检查是否成功获取手机号
      if (e.detail.errMsg !== 'getPhoneNumber:ok') {
        wx.showToast({
          title: '获取手机号失败',
          icon: 'none'
        });
        return;
      }
      
      // 显示加载中
      wx.showLoading({
        title: '手机号绑定中...',
        mask: true
      });
      
      // 获取登录凭证
      const loginRes = await wx.login();
      if (!loginRes.code) {
        wx.hideLoading();
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
        return;
      }
      
      // 调用后端接口，解密手机号
      const res = await request({
        url: '/v1/mp/user/bindPhone',
        method: 'POST',
        data: {
          code: loginRes.code,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        }
      });
      
      wx.hideLoading();
      
      if (res.code === 0) {
        // 绑定成功
        wx.showToast({
          title: '手机号绑定成功',
          icon: 'success'
        });
        
        // 更新本地存储的用户信息
        const userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.phone = res.data.phoneNumber;
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面显示
        const formattedPhone = res.data.phoneNumber.substring(0, 3) + '****' + res.data.phoneNumber.substring(7);
        this.setData({
          phoneNumber: formattedPhone
        });
      } else {
        wx.showToast({
          title: res.msg || '手机号绑定失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('手机号绑定失败:', error);
      wx.showToast({
        title: '手机号绑定失败，请重试',
        icon: 'none'
      });
    }
  },
  
  async onLogout() {
    return auth.logOut();
  },
  
  // 注销账号
  async onUnregisterTap() {
    // 显示确认对话框，防止误操作
    wx.showModal({
      title: '注销账号',
      content: '注销后，您的账号将被永久删除，无法恢复。确定要注销吗？',
      confirmText: '确认注销',
      confirmColor: '#FF0000',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 显示加载中
            wx.showLoading({
              title: '正在注销...',
              mask: true
            });
            
            // 调用注销接口
            const result = await request({
              url: '/wechat/auth/unregister',
              method: 'POST'
            });
            
            wx.hideLoading();
            
            if (result.code === 0) {
              // 注销成功
              wx.showToast({
                title: '账号已注销',
                icon: 'success'
              });
              
              // 清空 userInfo 数据
              wx.removeStorageSync('userInfo');
              const app = getApp();
  
                   if (app.globalData.userInfo) {
                        setOpenID('');
                        setUserID('');
                        
                        if (app.globalData) {
                          app.globalData.isRegistered = true;
                          app.globalData.showVisible = false;
                          (app.globalData as any).userInfo = {};
                        }
                      }
              
              // 调用登出方法，清除其他相关的 token 和 ID，并跳转到欢迎页面
              setTimeout(() => {
                auth.logOut();
              }, 1500);
            } else {
              // 注销失败
              wx.showToast({
                title: result.msg || '注销失败，请重试',
                icon: 'none'
              });
            }
          } catch (error) {
            wx.hideLoading();
            console.error('注销账号失败:', error);
            wx.showToast({
              title: '注销失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});
