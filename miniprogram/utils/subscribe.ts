import { request } from "./request";

export const subscribeMessage = (tmplIds: string[]) => {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        console.log('订阅成功:', res);
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          // 订阅成功，执行后续操作
          // 调用添加订阅消息接口
          request({
            url: '/v1/mp/authorization/add',
            method: 'POST',
            data: {
              tmplIds,
            },
          }).then((res) => {
            console.log('添加订阅消息成功:', res);
            resolve(res);
          }).catch((err) => {
            console.error('添加订阅消息失败:', err);
            reject(err);
          })
        } else {
          resolve(res);
        }
      },
      fail: (err) => {
        console.error('订阅失败:', err);
        reject(err);
      }
    });
  });
}