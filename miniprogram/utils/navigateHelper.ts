// 页面栈管理函数
const checkPageStackAndNavigate = (url: string, forceRedirect = false) => {
  const pages = getCurrentPages();

  // 如果页面栈接近限制（微信小程序最多10层）或强制重定向，使用 redirectTo
  if (pages.length >= 8 || forceRedirect) {
    return wx.redirectTo({ url });
  } else {
    return wx.navigateTo({ url });
  }
};

export const goWelcomeWithRedirect = () => {
  console.log('=== navigateHelper.goWelcomeWithRedirect 被调用 ===');
  console.log('调用时间:', new Date().toLocaleString());
  console.log('调用栈:', new Error().stack);
  console.log('准备重定向到欢迎页面: /pages/welcome/welcome');

  // 重定向去登录
  try {
    const result = wx.redirectTo({
      url: '/pages/welcome/welcome',
    });
    console.log('重定向调用成功:', result);
    console.log('=== navigateHelper.goWelcomeWithRedirect 执行完成 ===');
    return result;
  } catch (error: any) {
    console.error('重定向调用失败:', error);
    console.error('错误详情:', {
      message: error?.message || '未知错误',
      stack: error?.stack || '无堆栈信息',
      time: new Date().toLocaleString(),
    });
    throw error;
  }
};

export const goWelcome = () => {
  console.log('=== navigateHelper.goWelcome 被调用 ===');
  console.log('调用时间:', new Date().toLocaleString());
  console.log('调用栈:', new Error().stack);
  console.log('准备重定向到欢迎页面: /pages/welcome/welcome');

  // 重定向去登录
  try {
    const result = wx.redirectTo({
      url: '/pages/welcome/welcome',
    });
    console.log('重定向调用成功:', result);
    console.log('=== navigateHelper.goWelcome 执行完成 ===');
    return result;
  } catch (error: any) {
    console.error('重定向调用失败:', error);
    console.error('错误详情:', {
      message: error?.message || '未知错误',
      stack: error?.stack || '无堆栈信息',
      time: new Date().toLocaleString(),
    });
    throw error;
  }
};

export const goPersonalInfo = () => {
  return checkPageStackAndNavigate('/pages/personal-info/personal-info');
};

export const goPhotoUpload = () => {
  return checkPageStackAndNavigate('/pages/photo-upload/photo-upload');
};

export const goHome = () => {
  return wx.redirectTo({
    url: '/pages/home/home',
  });
};

export const goEvents = () => {
  return wx.redirectTo({
    url: '/pages/events/events',
  });
};

export const goMessage = () => {
  return wx.redirectTo({
    url: '/pages/message/message',
  });
};

export const goProfile = () => {
  return wx.redirectTo({
    url: '/pages/profile/profile',
  });
};

export const goLikesMe = () => {
  return checkPageStackAndNavigate('/packageA/pages/likes-me/likes-me');
};

export const goMyLikes = () => {
  return checkPageStackAndNavigate('/packageA/pages/my-likes/my-likes');
};

export const goProfileVerification = () => {
  return checkPageStackAndNavigate('/packageA/pages/profile-verification/profile-verification');
};

export const goSettings = () => {
  return checkPageStackAndNavigate('/packageA/pages/settings/settings');
};

export const goMyEvents = () => {
  return checkPageStackAndNavigate('/packageA/pages/my-events/my-events');
};

export const goEditProfile = () => {
  return checkPageStackAndNavigate('/packageA/pages/edit-profile/edit-profile');
};

export const goEditPrivate = () => {
  return checkPageStackAndNavigate('/packageA/pages/edit-private/edit-private');
};

export const goPublicProfile = (userId?: string | number) => {
  const url = `/packageA/pages/public-profile/public-profile${userId ? `?userId=${userId}` : ''}`;
  return checkPageStackAndNavigate(url);
};

export const goEventsInfo = (eventId?: string | number) => {
  const url = `/packageA/pages/events-info/events-info${eventId ? `?id=${eventId}` : ''}`;
  return checkPageStackAndNavigate(url);
};

export const goChat = () => {
  return checkPageStackAndNavigate('/packageA/pages/chat/chat');
};

export const goAttendeeList = (activityId?: string | number) => {
  const url = `/packageA/pages/attendee-list/attendee-list${activityId ? `?activityId=${activityId}` : ''}`;
  return checkPageStackAndNavigate(url);
};

export const goUserAgreement = () => {
  return checkPageStackAndNavigate('/packageA/pages/user-agreement/user-agreement');
};

export const goPrivateAgreement = () => {
  return checkPageStackAndNavigate('/packageA/pages/private-agreement/private-agreement');
};

export const goIdentityVerification = () => {
  return checkPageStackAndNavigate('/packageA/pages/identity-verification/identity-verification');
};
