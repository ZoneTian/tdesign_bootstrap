import { uploadFileWithProgress, compressImage } from '../../utils/file';

type FileItem = WechatMiniprogram.UploadFileOption & {
  status?: 'loading' | 'done' | 'error';
  percent?: number;
};

Component({
  properties: {
    fileList: {
      type: Array,
      value: [] as FileItem[],
    },
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },
  data: {
    isUploading: false,
  },
  methods: {
    async handleAdd(e: WechatMiniprogram.CustomEvent<{ files: FileItem[] }>) {
      const { files } = e.detail;

      // 显示微信原生loading提示
      wx.showLoading({
        title: '上传中...',
        mask: true // 添加蒙层防止用户触摸操作
      });
      
      try {
        for (const file of files) {
          await this.uploadFile(file);
        }
      } catch (error) {
        console.error('上传失败:', error);
        // 上传失败时隐藏loading
        wx.hideLoading();
      }
    },

    async uploadFile(file: FileItem) {
      const fileList = this.properties.fileList;
      // const { fileList } = this.data;
      const index = fileList.length;

      // 加入 loading 状态
      // this.setData({
      //   fileList: [...fileList, { ...file, status: 'loading', percent: 0 }],
      // });

      const fileListCopy = [...fileList, { ...file, status: 'loading', percent: 0 }];

      this.triggerEvent('filechange', fileListCopy);

      try {
        // 先压缩图片，质量设置为3
        const compressedFilePath = await compressImage(file.url, 3);
        
        const url = await uploadFileWithProgress({
          filePath: compressedFilePath,
          onProgress: (percent) => {
            // this.setData({
            //   [`fileList[${index}].percent`]: percent,
            // });
            // 可选：触发进度事件（也可以更新 percent，但需要额外设计）
            this.triggerEvent('progress', {
              index,
              percent,
            });
          },
        });

        // 成功状态更新
        fileListCopy[index].status = 'done';
        fileListCopy[index].url = url;

        this.triggerEvent('uploadsuccess', {
          index,
          url,
          file: fileListCopy[index],
        });

        // 上传完成，隐藏loading
        wx.hideLoading();
      } catch (err) {
        fileListCopy[index].status = 'error';
        this.triggerEvent('uploadfail', {
          index,
          error: err,
        });
        // 上传失败，隐藏loading
        wx.hideLoading();
        console.error('上传失败：', err);
      }
    },
  },
});