import { postLogin } from '../../utils/api';
import { setToken, setOpenID, setUserID } from '../../utils/auth';
import * as navigateHelper from '../../utils/navigateHelper';

Page({
  data: {
    agreement: false,
  },
  async onLogin() {
    if (!this.data.agreement) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
      return;
    }
    wx.login({
      success: async (res) => {
        console.log(res);
        if (res.code) {
          const requestConfig = { code: res.code };

          try {
            const response = await postLogin(requestConfig);
            if (response.code === 0) {
              const { token, userInfo, registeredFlag } = response.data;
              if (userInfo) {
                setToken(token);
                setOpenID(userInfo.openId);
                setUserID(userInfo.id);

                // 确保gender和language类型正确
                const formattedUserInfo = {
                  ...userInfo,
                  gender: userInfo.gender as 0 | 1 | 2,
                  language: userInfo.language as "en" | "zh_CN" | "zh_TW"
                };
                const app = getApp();
                app.globalData.hasLogin = true;
                app.globalData.isRegistered = registeredFlag;
                app.globalData.userInfo = formattedUserInfo; // 保存用户详细信息
                if (registeredFlag) {
                  this.goHome()
                } else {
                  return navigateHelper.goPersonalInfo();
                }

              }

            }

          } catch (err) {
            console.error('登录请求失败：', err);
          }
        }
        return navigateHelper.goPersonalInfo();
      },
      fail(err) {
        console.error('wx.login 调用失败', err);
        return navigateHelper.goPersonalInfo();
      },
    });
  },
  goHome() {
    return navigateHelper.goHome();
  },
  onAgreementToggle() {
    this.setData({ agreement: !this.data.agreement });
  },
  async onUserAgreementTap() {
    return navigateHelper.goUserAgreement();
  },
  async onPrivacyAgreementTap() {
    return navigateHelper.goPrivateAgreement();
  },
});
