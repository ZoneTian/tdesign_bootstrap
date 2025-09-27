import {
  getUserDetail,
  getUserPhoto,
  updateUserInfo,
  WeChatUserDetailVo,
  UpdateUserInfoOptions,
  uploadSocialImages,
  onRemoveImage,
} from '../../../utils/api';
import { getMbtiOptions, getOccupationOptions } from '../../../utils/dataSource';
import { compressImage, uploadFileWithProgress } from '../../../utils/file';
import { getUserID } from '../../../utils/auth';
import { DebounceHelper, NavigateDebounce } from '../../../utils/debounce';
import { validateChinesePhoneNumber } from '../../../utils/validate';


export interface PickerOption {
  label: string;
  value: number | string;
  children?: PickerOption[];
}

export interface AreaChangeDetail {
  text: string[];
  value: string[];
}

Page({
  data: {
    userId: undefined as number | undefined,
    form: {
      nickName: '',
      gender: null as Option | null,
      userHeight: null as Option | null,
      userMbti: '',
      birthday: null as Option | null,
      hometown: null as Option | null,
      location: null as Option | null,
      occupation: null as Option | null,
      school: '',
      // 隐私信息
      selfDescription: '',
      friendshipTend: '',
      // 照片相关字段
      main: null as any,
      careful: null as any,
      confidence: null as any,
      montain: null as any,
      life: null as any,
      smile: null as any,
      telephone: ''
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
      school: null as Option[] | null,
    } as PickerOptionsMap,
    userDetail: null as WeChatUserDetailVo | null,
  },

  async onLoad(options) {
    console.log('edit-profile onLoad with options:', options);
    // 获取传递的userId参数
    const userId = options.userId ? Number(options.userId) : undefined;
    this.setData({
      userId,
    });

    try {
      wx.showLoading({ title: '加载中...' });

      // 初始化选项数据
      await this.initOptionsData();

      // 并行请求用户详情和照片数据
      await Promise.all([this.fetchUserDetail(userId), this.fetchUserPhotos(userId)]);
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: '加载数据失败，请重试',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
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
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('获取用户详情失败:', error);
      wx.showToast({
        title: '网络异常，请重试',
        icon: 'none',
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

      // 确保uid是数字类型
      const numericUid = typeof uid === 'string' ? parseInt(uid, 10) : uid;
      const res = await getUserPhoto(numericUid);

      if (res.code === 0 && res.data) {
        const { socialImg } = res.data;


        // 根据照片列表设置表单中的照片字段
        if (socialImg && socialImg.length > 0) {
          const socialImgSort = socialImg.sort((a, b) => a.sort - b.sort);
          // 假设照片按照特定顺序排列
          const photoFields = ['main', 'careful', 'confidence', 'montain', 'life', 'smile'];
          const photoData: Record<string, any> = {};

          socialImgSort.forEach((item, index) => {
            if (index < photoFields.length) {
              // 根据照片的审核状态设置对应的CSS类名
              let imgReviewStatus = '';
              let imgReviewStatusText = '';
              if (item.imgReviewStatus === 1) {
                imgReviewStatus = ''
                imgReviewStatusText = '';
              } else if (item.imgReviewStatus === 2) {
                imgReviewStatus = 'rejected';
                imgReviewStatusText = '审核不通过';
                // 审核不通过
              } else if (item.imgReviewStatus === 0) {
                imgReviewStatus = 'pending'; // 待审核
                imgReviewStatusText = '待审核';

              }
              // 0或其他值保持为空，表示待审核状态

              photoData[`form.${photoFields[item.sort || index]}`] = {
                url: item.socializingImgUrl,
                position: index.toString(),
                id: item.id,
                sort: item.sort,
                imgReviewStatus: imgReviewStatus,
                imgReviewStatusText
              };
            }
          });

          this.setData(photoData);
        }
      } else {
        console.error('获取用户照片失败:', res.msg);
      }
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
      gender = pickerOptionsMap.gender.find((item) => item.value === 'male') || null;
    } else if (userDetail.gender === 2) {
      gender = pickerOptionsMap.gender.find((item) => item.value === 'female') || null;
    } else if (userDetail.gender === 0) {
      gender = pickerOptionsMap.gender.find((item) => item.value === 'other') || null;
    }

    // 初始化身高
    let userHeight = null;
    if (userDetail.userHeight && pickerOptionsMap.userHeight) {
      const heightValue = userDetail.userHeight.toString();
      userHeight = pickerOptionsMap.userHeight.find((item) => item.value === heightValue) || {
        label: `${heightValue}cm`,
        value: heightValue,
      };
    }

    // 初始化MBTI（直接使用字符串）
    const userMbti = userDetail.userMbti || '';

    // 初始化学校（直接使用字符串）
    const school = userDetail.school || '';

    // 初始化职业
    let occupation = userDetail.occupation;
    console.log(occupation, "zone");

    // 初始化生日
    let birthday = null;
    if (userDetail.userBirthday) {
      let birthdayLabel = '';
      let birthdayValue = userDetail.userBirthday;

      // 无论后端返回什么格式，都统一处理为年月日格式
      if (typeof userDetail.userBirthday === 'number') {
        // 如果是时间戳，使用格式化函数
        birthdayLabel = this.__formatDateDisplay(userDetail.userBirthday);
      } else if (typeof userDetail.userBirthday === 'string') {
        // 如果是字符串，尝试提取年月日部分
        const dateMatch = userDetail.userBirthday.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (dateMatch) {
          // 如果匹配到年月日格式，则规范化显示
          const year = dateMatch[1];
          const month = dateMatch[2].padStart(2, '0');
          const day = dateMatch[3].padStart(2, '0');
          birthdayLabel = `${year}-${month}-${day}`;
        } else {
          // 如果不是标准格式，尝试转换为日期再格式化
          const timestamp = Date.parse(userDetail.userBirthday);
          if (!isNaN(timestamp)) {
            birthdayLabel = this.__formatDateDisplay(timestamp);
          } else {
            // 实在无法解析则保留原值
            birthdayLabel = userDetail.userBirthday;
          }
        }
      } else {
        // 其他类型转为字符串后尝试处理
        const strValue = String(userDetail.userBirthday);
        const timestamp = Date.parse(strValue);
        if (!isNaN(timestamp)) {
          birthdayLabel = this.__formatDateDisplay(timestamp);
        } else {
          birthdayLabel = strValue;
        }
      }
      birthday = {
        label: birthdayLabel,
        value: birthdayValue,
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

    // 现居地也使用 province 和 city
    if (userDetail.province && userDetail.city) {
      const locationLabel = `${userDetail.province}-${userDetail.city}`;
      location = { label: locationLabel, value: locationLabel };
    }

    this.setData({
      'form.nickName': nickName,
      'form.gender': gender,
      'form.userHeight': userHeight,
      'form.userMbti': userMbti,
      'form.occupation': occupation,
      'form.school': school,
      'form.birthday': birthday,
      'form.hometown': hometown,
      'form.location': location,
      'form.selfDescription': userDetail.selfDescription,
      'form.friendshipTend': userDetail.friendshipTend,
      'form.telephone': userDetail.telephone,
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
          icon: 'none',
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

  /** 把时间戳 ts 格式化成 "YYYY-MM-DD" */
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
  onMobileInput(event: WechatMiniprogram.CustomEvent<{ value: 'string' }>) {
    this.setData({ 'form.telephone': event.detail.value });
  },

  onMbtiInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ 'form.userMbti': event.detail.value });
  },

  // 学校输入处理
  onSchoolInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({
      'form.school': e.detail.value
    });
  },

  onOccupationInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ 'form.occupation': event.detail.value });
  },

  // 自我描述输入处理
  onSelfDescriptionInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ 'form.selfDescription': event.detail.value });
  },

  // 交友倾向输入处理
  onDatingPreferenceInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ 'form.friendshipTend': event.detail.value });
  },

  // 编辑自我描述
  onEditSelfDescription() {
    const { form } = this.data;
    wx.navigateTo({
      url: `/packageA/pages/edit-profile/edit-text?type=selfDescription&content=${encodeURIComponent(form.selfDescription || '')}&fromPage=edit-profile`,
    });
  },

  // 编辑交友倾向
  onEditDatingPreference() {
    const { form } = this.data;
    wx.navigateTo({
      url: `/packageA/pages/edit-profile/edit-text?type=friendshipTend&content=${encodeURIComponent(form.friendshipTend || '')}&fromPage=edit-profile`,
    });
  },

  onHandlePicker(event: WechatMiniprogram.CustomEvent<{ dataset: { field: string } }>) {
    const { pickerOptionsMap } = this.data;
    const field = event.currentTarget.dataset.field as keyof typeof pickerOptionsMap;
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
  async onRemoveImage(e: WechatMiniprogram.CustomEvent) {
    const field = e.currentTarget.dataset.field;
    const id = e.currentTarget.dataset.id;
    if (!field) return;

    const key = `form.${field}`;

    this.setData({
      [key]: null,
    });

    console.log(`已删除${field}图片`);
    const userId = getUserID();
    const socialImg = Number(id);
    const res = await onRemoveImage({ userId: Number(userId), socialImg });
    if (res.code === 0) {
      wx.showToast({
        title: '删除成功',
        icon: 'success',
      });
    } else {
      wx.showToast({
        title: '删除失败',
        icon: 'none',
      });
    }
  },

  // 图片上传成功回调
  async onUploadSuccess(
    event: WechatMiniprogram.CustomEvent<
      {
        file?: { url?: string };
        currentTarget: {
          dataset: { field: string; position: string };
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

  // 图片变更处理函数
  async onPictureChange(e: WechatMiniprogram.CustomEvent) {
    const field = e.currentTarget.dataset.field;

    if (!field) return;

    const { files } = e.detail;
    if (!files || !files.length || !files[0].url) return;

    const file = files[0];
    const position = e.currentTarget.dataset.position || '0';

    try {
      wx.showLoading({ title: '上传中...' });

      // 先压缩图片
      const compressedFilePath = await compressImage(file.url, 3);

      // 调用上传API
      const url = await uploadFileWithProgress({
        filePath: compressedFilePath,
        onProgress: (percent) => {
          console.log(`上传进度: ${percent}%`);
        },
      });

      // 更新本地数据
      const key = `form.${field}`;
      this.setData({
        [key]: {
          url: url,
          position,
        },
      });

      wx.hideLoading();
      console.log(`已成功上传${field}图片，位置: ${position}`);
    } catch (error) {
      wx.hideLoading();
      console.error('图片上传失败:', error);
      wx.showToast({
        title: '图片上传失败，请重试',
        icon: 'none',
      });
    }
  },

  // 保存用户信息
  async onSaveProfile() {
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
          icon: 'none',
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
        // 直接使用字符串值
        updateParams.userMbti = form.userMbti;
      }

      // 添加职业
      if (form.occupation) {
        updateParams.occupation = (form.occupation && typeof form.occupation === 'object' && 'label' in form.occupation)
          ? String(form.occupation.label || '')
          : String(form.occupation || '');
      }

      // 添加学校
      if (form.school) {
        updateParams.school = form.school;
      }

      // 添加其他字段（如果有变化）
      if (form.gender) {
        updateParams.gender =
          form.gender.value === 'male' ? 1 : form.gender.value === 'female' ? 2 : 0;
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

      if (form.selfDescription) {
        updateParams.selfDescription = form.selfDescription;
      }

      if (form.friendshipTend) {
        updateParams.friendshipTend = form.friendshipTend;
      }

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

      // 过滤掉已有id的图片（表示已上传过）
      const newSocialImages = socialImages.filter((item) => !item.id);

      // 并行调用更新用户信息和上传社交图片接口
      const [userInfoRes, uploadImagesRes] = await Promise.all([
        // 调用更新用户信息接口
        updateUserInfo(updateParams),

        // 如果有图片，则调用上传社交图片接口
        newSocialImages.length > 0
          ? uploadSocialImages(userDetail.id, newSocialImages)
          : Promise.resolve({ code: 0, data: null, msg: '没有图片需要上传' }),
      ]);

      if (userInfoRes.code === 0) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
        });

        // 更新全局profile数据
        const app = getApp<IAppOption>();
        if (app.globalData && app.globalData.userInfo) {
          // 更新全局数据中的用户信息
          Object.assign(app.globalData.userInfo, {
            ...userInfoRes.data.userInfo,
            nickName: form.nickName,
            userBirthday: form.birthday?.label,
            userHeight: form.userHeight?.label
              ? String(form.userHeight.label).replace('cm', '')
              : undefined,
            userMbti: form.userMbti || '',
            occupation: (form.occupation && typeof form.occupation === 'object' && 'label' in form.occupation)
              ? String(form.occupation.label || '')
              : String(form.occupation || ''),
            gender: form.gender
              ? form.gender.value === 'male'
                ? 1
                : form.gender.value === 'female'
                  ? 2
                  : 0
              : undefined,
            province: form.hometown ? form.hometown.value.toString().split('-')[0] : undefined,
            city: form.hometown ? form.hometown.value.toString().split('-')[1] : undefined,
            presentProvince: form.location
              ? form.location.value.toString().split('-')[0]
              : undefined,
            presentCity: form.location ? form.location.value.toString().split('-')[1] : undefined,
            selfDescription: form.selfDescription,
            friendshipTend: form.friendshipTend,
            school: form.school || '',
          });
        }

        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      } else {
        wx.showToast({
          title: userInfoRes.msg || '保存失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 表单验证
  validateForm() {
    const { form } = this.data;

    if (!form.nickName) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none',
      });
      return false;
    }

    // 验证手机号（必填且格式正确）
    if (!form.telephone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
      });
      return false;
    } else if (!validateChinesePhoneNumber(form.telephone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      });
      return false;
    }

    return true;
  },

  async previewProfile() {
    DebounceHelper.execute(
      'onUserProfile',
      () => {
        const userId = getUserID();

        // 跳转到用户主页，并携带userId参数
        NavigateDebounce.navigateTo(
          `/packageA/pages/public-profile/public-profile?userId=${userId}`,
        );
      },
      300,
    );
  },
  async initHeightOptions() {
    const userHeightStart = 150;
    const userHeightOptions: Option[] = [];
    for (let h = userHeightStart; h <= 250; h++) {
      userHeightOptions.push({
        label: `${h}cm`,
        value: `${h}`,
      });
    }
    this.setData({
      'pickerOptionsMap.userHeight': userHeightOptions,
    });
  },

  async initMbtiOptions() {
    // 使用公共数据源中的MBTI选项
    const userMbtiOptions = getMbtiOptions();
    this.setData({
      'pickerOptionsMap.userMbti': userMbtiOptions,
    });
  },

  async initCareerOptions() {
    // 使用公共数据源中的职业选项
    const occupationOptions = getOccupationOptions();
    this.setData({
      'pickerOptionsMap.occupation': occupationOptions,
    });
  },

  async onShow() {
    await this.initHeightOptions();
    await this.initMbtiOptions();
    await this.initCareerOptions();
  },
});
