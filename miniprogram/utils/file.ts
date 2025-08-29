import * as env from "./env";

const { apiHost } = env.getEnv();

/**
 * 压缩图片
 * @param filePath 图片路径
 * @param quality 压缩质量(0-100)，值越小，压缩率越高，图片质量越低
 * @returns 压缩后的图片路径
 */
export function compressImage(filePath: string, quality: number = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: filePath,
      quality:90,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: (err) => {
        console.error('图片压缩失败:', err);
        // 如果压缩失败，返回原图片路径
        resolve(filePath);
      }
    });
  });
}

/**
 * 上传文件并返回上传地址，同时支持上传进度监听
 * @param options 上传配置
 */
export function uploadFileWithProgress(options: {
  filePath: string;
  name?: string;
  formData?: Record<string, any>;
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
}): Promise<string> {
  const {
    filePath,
    name = "file",
    formData = {},
    headers = {},
    onProgress,
  } = options;

  const url = `${apiHost}//v1/qiniu/uploadIMG`;

  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync("ACCESS_TOKEN");
    const header: Record<string, string> = {
      ...headers,
      Authorization: `Bearer ${token}`,
    };

    const task = wx.uploadFile({
      url,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        try {
          const result = JSON.parse(res.data);
          if (result.code === 0 && result.data) {
            resolve(result.data);
          } else {
            wx.showToast({
              title: result.msg || "上传失败",
              icon: "none",
            });
            reject(new Error(result.msg || "上传失败"));
          }
        } catch (err) {
          wx.showToast({
            title: "返回格式错误",
            icon: "none",
          });
          reject(new Error("返回格式错误"));
        }
      },
      fail: (err) => {
        wx.showToast({
          title: "上传失败",
          icon: "none",
        });
        reject(err);
      },
    });

    if (onProgress) {
      task.onProgressUpdate((res) => {
        onProgress(res.progress);
      });
    }
  });
}