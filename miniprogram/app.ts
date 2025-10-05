// app.ts
import { postLogin, getUnusedCouponList } from './utils/api';
import { setToken, setOpenID, setUserID } from './utils/auth';

// 登录状态Promise
let loginResolve: () => void;
export const loginPromise = new Promise<void>((resolve) => {
  // 存储resolve函数，稍后在onLaunch中使用
  loginResolve = resolve;
});

interface userInfoData {
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
  gender: 0 | 1 | 2; // 用户性别 0未知 1男性 2女性
  city: string; // 用户所在城市
  province: string; // 用户所在省份
  country: string; // 用户所在国家
  language: string; // 语言
  telephone: string; // 手机号

}

interface GlobalData {
  hasLogin: boolean;
  isRegistered: boolean;
  showVisible: boolean;
  presentPopupShow: boolean;
  userInfo?: userInfoData;
  totalCouponCount: number; // 优惠券总数
  couponData?: any; // 优惠券数据
}

App<IAppOption & { globalData: GlobalData }>({
  globalData: {
    userInfo: {
      id: 0,
      customerSerial: '',
      school: '',
      academics: '',
      registrationTime: '',
      academicReviewStatus: 0,
      photoReviewStatus: 0,
      openId: '',
      unionId: '',
      nickName: '',
      avatarUrl: '',
      gender: 0,
      city: '',
      province: '',
      country: '',
      language: 'zh_CN',
      telephone: '',
    },
    hasLogin: false,
    isRegistered: false,
    showVisible: false,
    presentPopupShow: false,
    totalCouponCount: 0,
    couponData: null
  },
  async onLaunch() {
    // 检查版本更新
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            }
          });
        });

        updateManager.onUpdateFailed(() => {
          wx.showToast({
            title: '新版本下载失败',
            icon: 'none'
          });
        });
      }
    });

    // 展示本地存储能力
    const logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);

    // 登录
    await wx.login({
      success: async (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          await postLogin({
            code: res.code
          }).then(loginRes => {
            if (loginRes.code === 0 && loginRes.data) {
              // 保存登录信息
              const { token, userInfo, registeredFlag } = loginRes.data;
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

                this.globalData.hasLogin = true;
                this.globalData.isRegistered = registeredFlag;
                this.globalData.userInfo = formattedUserInfo; // 保存用户详细信息

              }
              // 如果用户未注册，设置 showVisible 为 true
              this.globalData.showVisible = !registeredFlag;

              // 登录完成，解析Promise
              loginResolve();

              // 调用优惠券接口
              (async () => {
                try {
                  const couponRes = await getUnusedCouponList();
                  if (couponRes.code === 0 && couponRes.data && Array.isArray(couponRes.data)) {
                    // 查找couponType为0且couponCount大于0的优惠券
                    const targetCoupon = couponRes.data.find((item: any) => item.couponType === 0 && item.couponCount > 0);
                    if (targetCoupon) {
                      this.globalData.couponData = targetCoupon?.couponCount || 0;
                    }
                    const totalCouponCount = couponRes.data.reduce((sum, item) => sum + item.couponCount, 0);
                    this.globalData.totalCouponCount = totalCouponCount;
                  }
                } catch (error) {
                  console.error('获取优惠券列表失败:', error);
                }
              })();
            } else {
              console.error('登录失败:', loginRes.msg);
              wx.showToast({
                title: loginRes.msg || '登录失败',
                icon: 'none'
              });
              // 即使登录失败，也解析Promise
              loginResolve();
            }
          }).catch(err => {
            console.error('登录请求失败:', err);
            wx.showToast({
              title: '登录请求失败',
              icon: 'none'
            });
            // 即使请求失败，也解析Promise
            loginResolve();
          });
        }
      },
    });
  },
});
