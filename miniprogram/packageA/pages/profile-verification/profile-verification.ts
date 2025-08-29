import * as navigateHelper from '../../../utils/navigateHelper';
import { compressImage, uploadFileWithProgress } from '../../../utils/file';
import { getUserID } from '../../../utils/auth';
import { uploadUserSelfie } from '../../../utils/api';

// 常量定义
const SUCCESS_CODE = 0;
const TOAST_DURATION = 2000;
const IMAGE_COMPRESSION_QUALITY = 3;

Page({
  data: {
    faceImageUrl: '', // 存储人脸照片URL
    uploadStatus: '', // 上传状态：'uploading', 'success', 'fail'
  },

  goIdentityVerification() {
    return navigateHelper.goIdentityVerification();
  },

  // 人脸认证点击事件
  onFaceVerificationTap() {
    // 调用摄像头，不允许从相册选择
    wx.showActionSheet({
      itemList: ['拍摄照片'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.takePhoto();
        }
      },
    });
  },

  // 调用摄像头拍照
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'], // 只允许使用摄像头，不允许从相册选择
      camera: 'front', // 默认使用前置摄像头
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;

        // 显示预览并确认上传
        wx.showModal({
          title: '确认上传',
          content: '是否上传此照片进行人脸认证？',
          confirmText: '确认上传',
          cancelText: '重新拍摄',
          success: (result) => {
            if (result.confirm) {
              this.uploadFaceImage(tempFilePath);
            } else if (result.cancel) {
              // 用户选择重新拍摄
              this.takePhoto();
            }
          },
        });
      },
      fail: (err) => {
        console.error('拍照失败:', err);
        wx.showToast({
          title: '拍照失败，请重试',
          icon: 'none',
          duration: TOAST_DURATION,
        });
      },
    });
  },

  // 上传人脸照片
  async uploadFaceImage(filePath: string) {
    try {
      // 显示上传中状态
      this.setData({
        uploadStatus: 'uploading',
      });

      wx.showLoading({
        title: '上传中...',
        mask: true,
      });

      // 压缩图片
      const compressedFilePath = await compressImage(filePath, IMAGE_COMPRESSION_QUALITY);

      // 上传图片
      const url = await uploadFileWithProgress({
        filePath: compressedFilePath,
        onProgress: (percent) => {
          console.log(`上传进度: ${percent}%`);
        },
      });

      // 上传成功，调用接口保存用户自拍照片
      try {
        const userId = getUserID();
        if (!userId) {
          throw new Error('用户未登录');
        }

        // 调用上传用户自拍照片接口
        console.log('开始调用上传用户自拍照片接口', { userId, imageUrl: url });
        const response = await uploadUserSelfie(parseInt(userId), url);
        console.log('接口调用结果', response);

        if (response && response.code === SUCCESS_CODE) {
          this.setData({
            faceImageUrl: url,
            uploadStatus: 'success',
          });

          wx.hideLoading();

          // 显示上传成功提示
          wx.showToast({
            title: '上传成功',
            icon: 'success',
            duration: TOAST_DURATION,
          });
        } else {
          const errorMsg = response?.msg || '上传失败';
          console.error('接口返回错误', { response, errorMsg });
          throw new Error(errorMsg);
        }
      } catch (error: any) {
        console.error('调用接口失败:', error);
        this.setData({
          uploadStatus: 'fail',
        });

        wx.hideLoading();

        wx.showToast({
          title: error?.message || '上传失败，请重试',
          icon: 'none',
          duration: TOAST_DURATION,
        });
      }
    } catch (error) {
      console.error('上传失败:', error);

      this.setData({
        uploadStatus: 'fail',
      });

      wx.hideLoading();

      wx.showToast({
        title: '上传失败，请重试',
        icon: 'none',
        duration: TOAST_DURATION,
      });
    }
  },
});
