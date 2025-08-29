
import {
  getUserDetail,
  updateUserInfo,
  uploadSocialImages,
  WeChatUserDetailVo,
  type UpdateUserInfoOptions
} from '../../utils/api';
import { 
  getMbtiOptions, 
  getOccupationOptions 
} from '../../utils/dataSource';
import * as navigateHelper from '../../utils/navigateHelper';
import { getUserID } from '../../utils/auth';
import { DebounceHelper } from '../../utils/debounce';

export interface PickerOption {
  label: string;
  value: number | string;
  children?: PickerOption[];
}

export interface AreaChangeDetail {
  text: string[];
  value: string[];
}

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
    form: {
      nickName: '',
      gender: null as Option | null,
      userHeight: null as Option | null,
      userMbti: '',
      birthday: null as Option | null,
      hometown: null as Option | null,
      location: null as Option | null,
      occupation: '',
      // 照片相关字段
      main: null,
      careful: null,
      confidence: null,
      montain: null,
      life: null,
      smile: null
    },
    // picker-overlay 配置
    picker: {
      visible: false,
      field: '',
      title: '',
      options: [] as Option[],
    },
    pickerOptionsMap: {
      gender: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
      userHeight: null as Option[] | null,
      birthday: null as Option[] | null,
      userMbti: null as Option[] | null,
      occupation: null as Option[] | null,
      income: null as Option[] | null,
    } as PickerOptionsMap,
    userDetail: null as WeChatUserDetailVo | null,
    uploadedImages: [] as string[], // 存储已上传图片的URL
  },

  async onLoad(options) {
    // 获取传递的userId参数
    const userId = options.userId ? Number(options.userId) : undefined;
    this.setData({
      userId
    });
    
    // 初始化选项数据
    await this.initOptionsData();
    // 获取用户详情并初始化表单
    await this.fetchUserDetail(userId);
    // 获取用户照片
    await this.fetchUserPhotos(userId);
  },

  // 获取用户详情
  async fetchUserDetail(userId?: number) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await getUserDetail(userId);
      
      if (res.code === 0 && res.data) {
        this.setData({ userDetail: res.data });
        this.initFormFromUserDetail(res.data);
      } else {
        wx.showToast({
          title: res.msg || '获取用户信息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取用户详情失败:', error);
      wx.showToast({
        title: '网络异常，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 获取用户照片
  async fetchUserPhotos(userId?: number) {
    try {
      const uid = userId || getUserID();
      if (!uid) {
        console.error('用户ID不存在');
        return;
      }
      
      // 这里可以添加获取用户照片的API调用
      // 例如: const photoRes = await getUserPhotos(userId);
      // 然后根据返回的数据设置form中的照片字段
    } catch (error) {
      console.error('获取用户照片失败:', error);
    }
  },

  // 根据用户详情初始化表单
  initFormFromUserDetail(userDetail: WeChatUserDetailVo) {
    const { pickerOptionsMap } = this.data;
    
    // 初始化昵称
    const nickName = userDetail.nickName || '';
    
    // 初始化性别
    let gender = null;
    if (userDetail.gender === 1) {
      gender = pickerOptionsMap.gender.find(item => item.value === 'male') || null;
    } else if (userDetail.gender === 2) {
      gender = pickerOptionsMap.gender.find(item => item.value === 'female') || null;
    } else if (userDetail.gender === 0) {
      gender = pickerOptionsMap.gender.find(item => item.value === 'other') || null;
    }
    
    // 初始化身高
    let userHeight = null;
    if (userDetail.userHeight && pickerOptionsMap.userHeight) {
      const heightValue = userDetail.userHeight.toString();
      userHeight = pickerOptionsMap.userHeight.find(item => item.value === heightValue) || 
                   { label: `${heightValue}cm`, value: heightValue };
    }
    
    // 初始化MBTI（直接使用字符串）
    const userMbti = userDetail.userMbti || '';
    
    // 初始化职业
    let occupation = userDetail.occupation || '';

    // 初始化生日
    let birthday = null;
    if (userDetail.userBirthday) {
      let birthdayLabel = '';
      let birthdayValue = userDetail.userBirthday;
      
      if (typeof userDetail.userBirthday === 'string') {
        birthdayLabel = userDetail.userBirthday;
      } else if (typeof userDetail.userBirthday === 'number') {
        birthdayLabel = this.__formatDateDisplay(userDetail.userBirthday);
      } else {
        birthdayLabel = String(userDetail.userBirthday);
      }
      
      birthday = { 
        label: birthdayLabel, 
        value: birthdayValue 
      };
    }
    
    // 初始化家乡和现居地
    let hometown = null;
    let location = null;
    
    // 家乡使用 province 和 city
    if (userDetail.province && userDetail.city) {
      const hometownLabel = `${userDetail.province}-${userDetail.city}`;
      hometown = { label: hometownLabel, value: hometownLabel };
    }
    
    // 现居地使用 presentProvince 和 presentCity（如果存在）
    // 注意：如果API返回的数据结构中没有这些字段，可以使用其他字段代替
    const presentProvince = (userDetail as any).presentProvince || userDetail.province;
    const presentCity = (userDetail as any).presentCity || userDetail.city;
    
    if (presentProvince && presentCity) {
      const locationLabel = `${presentProvince}-${presentCity}`;
      location = { label: locationLabel, value: locationLabel };
    }
    
    this.setData({
      'form.nickName': nickName,
      'form.gender': gender,
      'form.hometown': hometown,
      'form.location': location,
      'form.userHeight': userHeight,
      'form.userMbti': userMbti,
      'form.birthday': birthday,
      'form.occupation': occupation,
    });
  },

  // 初始化选项数据
  async initOptionsData() {
    // 初始化身高选项
    const userHeightStart = 150;
    const userHeightOptions: Option[] = [];
    for (let h = userHeightStart; h <= 250; h++) {
      userHeightOptions.push({
        label: `${h}cm`,
        value: `${h}`,
      });
    }
    
    // 使用公共数据源
    const mbtiOptions = getMbtiOptions();
    const occupationOptions = getOccupationOptions();
    
    this.setData({
      'pickerOptionsMap.userHeight': userHeightOptions,
      'pickerOptionsMap.userMbti': mbtiOptions,
      'pickerOptionsMap.occupation': occupationOptions,
    });
  },

  /** 点击"出生日期"这一行时调用 */
  showPicker(events: WechatMiniprogram.CustomEvent<{ field: 'string' }>) {
    const field = events.currentTarget.dataset.field;
    if (field === 'birthday') {
      const picker = this.selectComponent('#birthdayPicker');
      if (picker && typeof picker.show === 'function') {
        picker.show();
      } else {
        console.warn('date-picker 组件未找到或 show 方法不存在');
        wx.showToast({
          title: '日期选择功能暂不可用',
          icon: 'none'
        });
      }
    }
  },

  /** date-picker 组件选中后触发 */
  onBirthdayConfirm(events: WechatMiniprogram.CustomEvent<{ value: number }>) {
    const ts = events.detail.value;
    const formattedDate = this.__formatDateDisplay(ts);

    const birthdayOptions = {
      value: ts,
      label: formattedDate,
    };

    this.setData({
      'form.birthday': birthdayOptions,
    });
  },

  /** 把时间戳 ts 格式化成 "YYYY-MM-DD */
  __formatDateDisplay(ts: number) {
    if (!ts) return '';
    const dt = new Date(ts);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  showRegionPicker(
    e: WechatMiniprogram.CustomEvent<{
      currentTarget: { dataset: { field: string } };
    }>,
  ) {
    const field = e.currentTarget.dataset.field;
    this.selectComponent('#areaPicker').onAreaPicker(field);
  },

  onHometownChange(e: WechatMiniprogram.CustomEvent<AreaChangeDetail>) {
    const { text, value } = e.detail;

    const hometownOptions: Option = {
      label: text.join('-'),
      value: value.join('-'),
    };

    this.setData({
      'form.hometown': hometownOptions,
    });
  },

  onLocationChange(event: WechatMiniprogram.CustomEvent<AreaChangeDetail>) {
    const { text, value } = event.detail;

    const locationOptions: Option = {
      label: text.join('-'),
      value: value.join('-'),
    };

    this.setData({
      'form.location': locationOptions,
    });
  },

  onnickNameInput(event: WechatMiniprogram.CustomEvent<{ value: 'string' }>) {
    this.setData({ 'form.nickName': event.detail.value });
  },

  onMbtiInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ 'form.userMbti': event.detail.value });
  },

  onOccupationInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ 'form.occupation': event.detail.value });
  },

  onHandlePicker(event: WechatMiniprogram.CustomEvent<{ dataset: { field: string } }>) {
    const { pickerOptionsMap } = this.data;
    const field = event.currentTarget.dataset.field as string;
    const opts = pickerOptionsMap[field];
    if (!opts || opts.length === 0) return;

    this.setData({
      'picker.visible': true,
      'picker.field': field,
      'picker.title': this._getFieldLabel(field) || '',
      'picker.options': opts,
    });
  },

  _getFieldLabel(field: any) {
    const labels: Record<string, string> = {
      gender: '请选择性别',
      birthday: '请选择出生日期',
      userHeight: '请选择身高',
      userMbti: '请输入 Mbti',
      hometown: '请选择家乡',
      location: '请选择现居地',
      occupation: '请选择职业',
    };
    return labels[field] || '';
  },

  onPickerConfirm(event: WechatMiniprogram.CustomEvent<{ field: string; selected: Option }>) {
    const { field, selected } = event.detail;
    console.log('onPickerConfirm', field, selected);
    this.setData({
      [`form.${field}`]: selected,
      'picker.visible': false,
    });
  },

  onPickerCancel() {
    this.setData({ 'picker.visible': false });
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
  
  // 图片上传成功回调
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

  // 保存用户信息和照片
  async onSaveProfile() {
    DebounceHelper.execute('onSaveProfile', async () => {
      // 表单验证
      if (!this.validateForm()) {
        return;
      }
      
      try {
        wx.showLoading({ title: '保存中...' });
        
        const { form, userDetail } = this.data;
        
        if (!userDetail) {
          wx.showToast({
            title: '用户信息获取失败',
            icon: 'none'
          });
          return;
        }
        
        // 构建更新请求参数
        const updateParams: UpdateUserInfoOptions = {
          userId: userDetail.id,
          nickName: form.nickName,
        };
        
        // 添加生日
        if (form.birthday) {
          updateParams.userBirthday = form.birthday.label;
        }
        
        // 添加身高
        if (form.userHeight && form.userHeight.label) {
          const heightValue = String(form.userHeight.label).replace('cm', '');
          updateParams.userHeight = heightValue;
        }
        
        // 添加MBTI
        if (form.userMbti) {
          updateParams.userMbti = form.userMbti;
        }
        
        // 添加职业
        if (form.occupation) {
          updateParams.occupation = form.occupation;
        }
        
        // 添加其他字段（如果有变化）
        if (form.gender) {
          updateParams.gender = form.gender.value === 'male' ? 1 : (form.gender.value === 'female' ? 2 : 0);
        }
        
        if (form.hometown) {
          const [province, city] = form.hometown.value.toString().split('-');
          updateParams.province = province;
          updateParams.city = city;
        }
        
        if (form.location) {
          const [presentProvince, presentCity] = form.location.value.toString().split('-');
          updateParams.presentProvince = presentProvince;
          updateParams.presentCity = presentCity;
        }
        
        // 调用更新个人信息接口
        const res = await updateUserInfo(updateParams);
        
        if (res.code !== 0) {
          wx.showToast({
            title: res.msg || '保存个人信息失败',
            icon: 'none'
          });
          return;
        }
        
        // 收集所有已上传图片的URL
        const socialImages: string[] = [];
        const photoFields = ['main', 'careful', 'confidence', 'montain', 'life', 'smile'];
        photoFields.forEach(key => {
          const field = form[key as keyof typeof form];
          if (field && field.url) {
            socialImages.push(field.url);
          }
        });
        
        // 如果有照片，则上传照片
        if (socialImages.length > 0) {
          const userId = getUserID();
          if (!userId) {
            wx.showToast({
              title: '用户ID不存在，请重新登录',
              icon: 'none'
            });
            return;
          }
          
          // 调用上传社交图片接口
          const photoRes = await uploadSocialImages(Number(userId), socialImages);
          
          if (photoRes.code !== 0) {
            wx.showToast({
              title: photoRes.msg || '照片上传失败',
              icon: 'none'
            });
            return;
          }
        }
        
        // 更新全局数据
        const app = getApp<IAppOption>();
        if (app.globalData && app.globalData.userInfo) {
          // 更新全局数据中的用户信息
          Object.assign(app.globalData.userInfo, {
            nickName: form.nickName,
            userBirthday: form.birthday?.label,
            userHeight: form.userHeight?.label ? String(form.userHeight.label).replace('cm', '') : undefined,
            userMbti: form.userMbti,
            occupation: form.occupation,
            gender: form.gender ? (form.gender.value === 'male' ? 1 : (form.gender.value === 'female' ? 2 : 0)) : undefined,
            province: form.hometown ? form.hometown.value.toString().split('-')[0] : undefined,
            city: form.hometown ? form.hometown.value.toString().split('-')[1] : undefined,
            presentProvince: form.location ? form.location.value.toString().split('-')[0] : undefined,
            presentCity: form.location ? form.location.value.toString().split('-')[1] : undefined,
          });
        }
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          navigateHelper.goHome();
        }, 1000);
      } catch (error) {
        console.error('保存失败:', error);
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      } finally {
        wx.hideLoading();
      }
    }, 500);
  },
  
  // 表单验证
  validateForm() {
    const { form } = this.data;
    
    if (!form.nickName) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return false;
    }
    
    if (!form.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return false;
    }
    
    if (!form.birthday) {
      wx.showToast({
        title: '请选择出生日期',
        icon: 'none'
      });
      return false;
    }
    
    if (!form.userHeight) {
      wx.showToast({
        title: '请选择身高',
        icon: 'none'
      });
      return false;
    }
    
    if (!form.userMbti) {
      wx.showToast({
        title: '请输入MBTI',
        icon: 'none'
      });
      return false;
    }
    
    if (!form.hometown) {
      wx.showToast({
        title: '请选择家乡',
        icon: 'none'
      });
      return false;
    }
    
    if (!form.location) {
      wx.showToast({
        title: '请选择现居地',
        icon: 'none'
      });
      return false;
    }
    
    if (!form.occupation) {
      wx.showToast({
        title: '请输入职业',
        icon: 'none'
      });
      return false;
    }
    
    // 验证至少上传一张图片
    const photoFields = ['main', 'careful', 'confidence', 'montain', 'life', 'smile'];
    const hasImage = photoFields.some(field => {
      const photo = form[field as keyof typeof form];
      return photo && (photo as any).url;
    });
    
    if (!hasImage) {
      wx.showToast({
        title: '请至少上传一张照片',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  }
});