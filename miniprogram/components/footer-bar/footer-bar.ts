import * as navigateHelper from '../../utils/navigateHelper';

Component({
  /**
   * 组件的属性列表
   * 可以外部传入 activeIndex，以便渲染不同的高亮状态
   */
  properties: {
    activeIndex: {
      type: Number,
      value: 1,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0,
    hasUnread: 10,
    hasHomeIndicator: false, // 是否有Home Indicator（如iPhone X及以上机型）
  },

  /**
   * 组件生命周期函数
   */
  lifetimes: {
    attached() {
      // 当组件被插入到页面节点树时，从属性同步 activeIndex 到 data
      this.setData({
        active: this.properties.activeIndex,
      });
      
      // 检测设备是否有Home Indicator
      this.checkDeviceHasHomeIndicator();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 检测设备是否有Home Indicator
    checkDeviceHasHomeIndicator() {
      wx.getSystemInfo({
        success: (res) => {
          // 检查是否为iPhone X及以上机型（有Home Indicator的机型）
          const model = res.model.toLowerCase();
          const brand = res.brand ? res.brand.toLowerCase() : '';
          
          const isIPhoneX = model.includes('iphone x') || 
                          model.includes('iphone 11') || 
                          model.includes('iphone 12') || 
                          model.includes('iphone 13') || 
                          model.includes('iphone 14') || 
                          model.includes('iphone 15');
          
          // 或者通过安全区域判断
          const hasHomeIndicator = res.safeArea && 
                                (res.screenHeight - res.safeArea.bottom > 0);
          
          // 特殊处理华为设备
          const isHuawei = brand === 'huawei' || brand === 'honor';
          
          
          const hasHomeIndicatorValue = isHuawei ? false : (isIPhoneX || hasHomeIndicator);
          
          this.setData({
            // 华为设备强制设置为false，避免底部过高
            hasHomeIndicator: hasHomeIndicatorValue
          });
          
          // 计算实际高度（统一使用CSS中设置的高度）
          const baseHeight = 160; // 更新为新的基础高度
          const paddingBottom = hasHomeIndicatorValue ? 34 : 10;
          const totalHeight = baseHeight; // 由于使用border-box，不需要加上padding
          
          // 设置CSS变量，供其他组件使用
          const footerHeight = `${totalHeight}rpx`;
          
          
          // 发布事件，通知所有页面更新footer高度
          wx.nextTick(() => {
            // 设置全局存储
            wx.setStorageSync('footerHeight', footerHeight);
            
            // 获取当前页面实例
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            
            // 更新当前页面的数据
            if (currentPage && currentPage.setData) {
              currentPage.setData({
                footerHeight: footerHeight
              });
            }
            
            // 发布全局事件
            if (typeof this.triggerEvent === 'function') {
              this.triggerEvent('footerHeightChange', { height: footerHeight }, { bubbles: true, composed: true });
            }
          });
        }
      });
    },
    
    // 点击"主页"
    onTapHome() {
      return navigateHelper.goHome();
    },
    // 点击"活动"
    onTapEvents() {
      return navigateHelper.goEvents();
    },
    // 点击"消息"
    onTapMessage() {
      return navigateHelper.goMessage();
    },
    // 点击"我的"
    onTapProfile() {
      return navigateHelper.goProfile();
    },
  },
});