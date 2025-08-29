// 文本编辑页面
Page({
  data: {
    type: '', // 'self' 或 'dating'
    title: '', // 页面标题
    content: '', // 文本内容
    placeholder: '', // 占位符文本
    contentLength: 0, // 当前内容长度
    fromPage: '', // 来源页面
  },

  onLoad(options) {
    const { type, content, fromPage } = options;

    let title = '';
    let placeholder = '';

    if (type === 'selfDescription') {
      title = '自我描述';
      placeholder =
        '本人性格内向，但如果我们足够熟悉，也能敞开心扉[哦呀]\n爱好羽毛球，乒乓球\n未来希望生活在北京，或者是河北，兜兜转转，我们总会相遇\n希望能找到合适的那个她呀';
    } else if (type === 'friendshipTend') {
      title = '交友倾向';
      placeholder =
        '希望TA：\n年龄22-24岁，身高165，\n学历是研究生\n品行善良，性格略成熟\n爱出去玩加分\n不做宅女宅男，我们一起一起';
    }

    this.setData({
      type,
      title,
      content: content || '',
      placeholder,
      contentLength: (content || '').length,
      fromPage,
    });
  },

  // 内容输入处理
  onContentInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    const content = e.detail.value;
    this.setData({
      content,
      contentLength: content.length,
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 保存内容
  onSave() {
    const { type, content, fromPage } = this.data;

    // 检查字数是否超过限制
    if (content.length > 800) {
      wx.showToast({
        title: '内容不能超过800字',
        icon: 'none',
      });
      return;
    }

    // 获取页面栈
    const pages = getCurrentPages();
    // 获取上一个页面
    const prevPage = pages[pages.length - 2];

    if (prevPage) {
      // 调用上一个页面的方法，传递编辑后的内容
      if (type === 'selfDescription') {
        prevPage.setData({
          'form.selfDescription': content,
        });
      } else if (type === 'friendshipTend') {
        prevPage.setData({
          'form.friendshipTend': content,
        });
      }
    }

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
});
