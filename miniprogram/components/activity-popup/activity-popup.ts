/*
 * @Author: zone Tian
 * @Date: 2025-09-30 09:14:13
 * @LastEditors: zone Tian
 * @LastEditTime: 2025-10-05 20:47:43
 * @Description: file conten
 */
const iconMap = {
  'register': 'https://qiniustatic.womenshike.top/icon-action-popup-register.png',
  'identify': 'https://qiniustatic.womenshike.top/icon-action-popup-identify.png',
  'present': 'https://qiniustatic.womenshike.top/icon-action-popup-present.png',
}

Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared',
  },
  properties: {
    visible: { type: Boolean, value: false },
    icon: { type: String, value: '' },
    title: { type: String, value: '' },
    subtitle: { type: String, value: '' },
    freeCount: { type: Number, value: 0 },
    buttonText: { type: String, value: '知道了' },
    isRegistered: { type: Boolean, value: false }, // 添加是否已注册的属性
  },
  observers: {
    icon: function (icon) {
      // 如果设置了icon，则根据iconMap设置默认图标

      if (icon !== '') {
        const defaultIcon = iconMap[icon as keyof typeof iconMap] || '';
        this.setData({ iconUrl: defaultIcon });
      }
    },
  },
  pageLifetimes: {
    show: function () {
      // this.setData({
      //   iconUrl: iconMap[this.data.icon as keyof typeof iconMap],
      // })
    },
    hide: function () {
      console.log('组件隐藏');
    },
  },

  methods: {

    onClose() {
      this.triggerEvent('close');
    },
    onConfirm() {
      this.triggerEvent('confirm');
    },
    // 处理订阅消息事件并传递给父组件
    onSubscribeMessage(e: WechatMiniprogram.CustomEvent) {
      this.triggerEvent('subscribeMessage', e.detail);
    },
  },

});
