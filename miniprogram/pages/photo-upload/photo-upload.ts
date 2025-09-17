import * as navigateHelper from '../../utils/navigateHelper';
import { uploadSocialImages } from '../../utils/api';
import { getUserID } from '../../utils/auth';

type FileItem = WechatMiniprogram.UploadFileOption & {
  status?: 'loading' | 'done' | 'error';
  percent?: number;
  url?: string;
};

type ResponseOploadSuccess = {
  file: FileItem;
  index?: number;
};

type Dataset = {
  field: string;
  position: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
};

Page({
  data: {
    form: {},
    uploadedImages: [] as string[], // 存储已上传图片的URL
  },
  async onShow() { },
  onReciveFile(e: any) {
    this.setData({
      images: e.detail,
    });
  },

  // 删除已上传的图片
  onRemoveImage(e: WechatMiniprogram.CustomEvent) {
    const field = e.currentTarget.dataset.field;
    if (!field) return;

    const key = `form.${field}`;

    this.setData({
      [key]: null
    });

    console.log(`已删除${field}图片`);
  },

  // 删除笑脸图片（兼容已有的方法）
  onRemoveSmile() {
    this.onRemoveImage({ currentTarget: { dataset: { field: 'smile' } } } as any);
  },
  async goHome() {
    try {
      // 获取所有已上传的图片URL
      const form = this.data.form;
      // const socialImages: string[] = [];

      // // 收集所有已上传图片的URL
      // Object.keys(form).forEach(key => {
      //   if (form[key] && form[key].url) {
      //     socialImages.push(form[key].url);
      //   }
      // });

      // // 验证至少上传一张图片
      // if (socialImages.length === 0) {
      //   wx.showToast({
      //     title: '请至少上传一张图片',
      //     icon: 'none'
      //   });
      //   return;
      // }
      // 收集所有已上传图片的URL
      const socialImages: { socializingImgUrl: string; imgType: number; id?: number, sort: number }[] = [];
      const photoFields = ['main', 'careful', 'confidence', 'montain', 'life', 'smile'] as const;
      // 验证至少上传一张图片

      photoFields.forEach((field, index) => {
        const photoItem = form[field];
        if (photoItem && typeof photoItem === 'object' && 'url' in photoItem && photoItem.url) {
          socialImages.push({
            socializingImgUrl: photoItem.url,
            imgType: field === 'main' ? 0 : 1,
            id: 'id' in photoItem ? photoItem.id : undefined,
            sort: index
          });
        }
      });
      if (socialImages.length === 0) {
        wx.showToast({
          title: '请至少上传一张图片',
          icon: 'none',
        });
        return;
      }

      const userId = getUserID();
      if (!userId) {
        wx.showToast({
          title: '用户ID不存在，请重新登录',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({
        title: '正在上传图片...',
        mask: true
      });

      // 调用上传社交图片接口
      const res = await uploadSocialImages(Number(userId), socialImages);

      wx.hideLoading();

      if (res.code === 0) {
        wx.showToast({
          title: '图片上传成功',
          icon: 'success'
        });
        // 上传成功后跳转到首页
        return navigateHelper.goHome();
      } else {
        wx.showToast({
          title: res.msg || '图片上传失败',
          icon: 'none'
        });
        return;
      }
    } catch (error) {
      wx.hideLoading();
      console.error('上传社交图片失败:', error);
      wx.showToast({
        title: '上传图片失败，请重试',
        icon: 'none'
      });
    }
  },
  async onUploadSuccess(
    event: WechatMiniprogram.CustomEvent<
      ResponseOploadSuccess & {
        currentTarget: {
          dataset: Dataset;
        };
      }
    >,
  ) {
    console.log(event);
    const { field, position } = event.currentTarget.dataset;
    const { file } = event.detail;

    if (!file || !file.url) return;

    const key = `form.${field}`;

    this.setData({
      [key]: {
        url: file.url,
        position,
      },
    });
  },
});
