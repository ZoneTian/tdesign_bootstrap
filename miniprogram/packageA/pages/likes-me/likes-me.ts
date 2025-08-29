import { getUserFans, WeChatFansVo } from "../../../utils/api";

Page({
  data: {
    items: [] as WeChatFansVo[],
    loading: false,
    error: ''
  },

  async onLoad() {
    await this.loadFans();
  },

  async onShow() {
    // 每次显示页面时刷新数据
    await this.loadFans();
  },

  async loadFans() {
    try {
      this.setData({ loading: true, error: '' });
      
      const res = await getUserFans();
      
      if (res.code === 0) {
        this.setData({
          items: res.data || []
        });
      } else {
        this.setData({
          error: res.msg || '获取数据失败'
        });
        wx.showToast({
          title: res.msg || '获取数据失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取粉丝列表失败:', error);
      this.setData({
        error: '网络错误，请重试'
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadFans();
    wx.stopPullDownRefresh();
  },

  // 重试加载
  async onRetry() {
    await this.loadFans();
  }
});
