Component({
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    extClass: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
    background: {
      type: String,
      value: '',
    },
    color: {
      type: String,
      value: '',
    },
    back: {
      type: Boolean,
      value: true,
    },
    loading: {
      type: Boolean,
      value: false,
    },
    homeButton: {
      type: Boolean,
      value: false,
    },
    animated: {
      // 显示隐藏的时候opacity动画效果
      type: Boolean,
      value: true,
    },
    show: {
      // 显示隐藏导航，隐藏的时候navigation-bar的高度占位还在
      type: Boolean,
      value: true,
      observer: '_showChange',
    },
    // back为true的时候，返回的页面深度
    delta: {
      type: Number,
      value: 1,
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    displayStyle: '',
  },
  pageLifetimes: {
    show() {
      if (!this.data.homeButton && this.isSinglePageInStack()) {
        this.setData({
          homeButton: true,
          // back: false
        })
      }
    }
  },
  lifetimes: {
    attached() {
      const rect = wx.getMenuButtonBoundingClientRect();
      wx.getSystemInfo({
        success: (res) => {
          const isAndroid = res.platform === 'android';
          const isDevtools = res.platform === 'devtools';
          this.setData({
            ios: !isAndroid,
            innerPaddingRight: `padding-right: ${res.windowWidth - rect.left}px`,
            leftWidth: `width: ${res.windowWidth - rect.left}px`,
            safeAreaTop:
              isDevtools || isAndroid
                ? `height: calc(var(--height) + ${res.safeArea.top || 54}px); padding-top: ${res.safeArea.top || 54}px`
                : ``,
          });
        },
      });
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _showChange(show: boolean) {
      const animated = this.data.animated;
      let displayStyle = '';
      if (animated) {
        displayStyle = `opacity: ${show ? '1' : '0'};transition:opacity 0.5s;`;
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`;
      }
      this.setData({
        displayStyle,
      });
    },
    back() {
      const data = this.data;
      // 先触发自定义事件，确保页面能接收到通知
      this.triggerEvent('back', { delta: data.delta }, {});
      // 然后再执行页面返回操作
      if (data.delta) {
        wx.navigateBack({
          delta: data.delta,
        });
      }
    },
    /**
     * 返回首页
     */
    home() {
      // 触发自定义事件
      this.triggerEvent('home', {}, {});
      // 执行返回首页操作
      wx.switchTab({
        url: '/pages/index/index'
      });
    },
    /**
     * 判断当前页面栈是否只有一个页面
     * @returns {boolean} 返回true表示当前页面栈只有一个页面，false表示有多个页面
     */
    isSinglePageInStack() {
      // 获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
      const pages = getCurrentPages();
      // 页面栈长度为1表示当前只有一个页面
      return pages.length === 1;
    },
  },
});
