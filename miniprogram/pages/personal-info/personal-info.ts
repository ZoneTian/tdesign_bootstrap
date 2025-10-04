import { postRegister } from '../../utils/api';
import { getMbtiOptions, getOccupationOptions, getSchoolOptions } from '../../utils/dataSource';
import * as navigateHelper from '../../utils/navigateHelper';
import { getOpenID, setToken, setOpenID, setUserID } from '../../utils/auth';
import { DebounceHelper } from '../../utils/debounce';
import { validateChinesePhoneNumber } from '../../utils/validate';

const app = getApp<
  IAppOption & {
    globalData: {
      userInfo: WechatMiniprogram.UserInfo | null;
      hasLogin: boolean;
      isRegistered: boolean;
      showVisible: boolean;
    };
  }
>();

export interface PickerOption {
  label: string;
  value: number | string;
  children?: PickerOption[];
}

export interface AreaListRaw {
  provinces: Record<string, string>;
  cities: Record<string, string>;
  counties: Record<string, string>;
}

export interface AreaChangeDetail {
  text: string[];
  value: string[];
}

Page({
  data: {
    form: {
      nickName: '',
      gender: null as Option | null,
      userHeight: null as Option | null,
      userMbti: null as Option | null,
      birthday: null as Option | null,
      hometown: null as Option | null,
      location: null as Option | null,
      occupation: null as Option | null,
      telephone: '',
      school: '',
      wechatAccount: ''
    },
    picker: {
      visible: false,
      field: '',
      title: '',
      options: [] as Option[],
    },
    pickerOptionsMap: {
      gender: [
        { label: '男', value: '1' },
        { label: '女', value: '2' },
        { label: '其他', value: '0' },
      ],
      userHeight: null as Option[] | null,
      birthday: null as Option[] | null,
      userMbti: null as Option[] | null,
      occupation: null as Option[] | null,
      school: null as Option[] | null,
      income: null as Option[] | null,
    } as PickerOptionsMap,
  },

  showPicker(events: WechatMiniprogram.CustomEvent<{ field: 'string' }>) {
    const field = events.currentTarget.dataset.field;
    if (field === 'birthday') {
      this.selectComponent('#birthdayPicker').show();
    }
  },

  onBirthdayConfirm(events: WechatMiniprogram.CustomEvent<{ value: number }>) {
    const ts = events.detail.value;

    const birthdayOptions = {
      value: new Date(this.__formatDateDisplay(ts)).getTime().toString(),
      label: ts,
    };

    this.setData({
      'form.birthday': birthdayOptions,
    });
  },

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
      userMbti: '请选择MBTI',
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

  async onNextSetp() {
    DebounceHelper.execute(
      'onNextSetp',
      async () => {
        if (!this.validateForm()) {
          return;
        }

        const { form } = this.data;

        // 如果用户已经填写了微信号，则直接提交
        if (form.wechatAccount && form.wechatAccount.trim() !== '') {
          await this.submitRegistration();
        } else {
          // 只有当用户没有填写微信号时，才显示二次确认弹窗
          wx.showModal({
            title: '确认提交',
            content: '不填写微信号无法报名活动，确认提交注册信息吗？',
            confirmText: '确认',
            cancelText: '取消',
            success: async (res) => {
              if (res.confirm) {
                await this.submitRegistration();
              } else {
                // 用户取消，停留在当前页面
                console.log('用户取消提交');
              }
            }
          });
        }
      },
      500,
    );
  },

  // 封装提交注册信息的逻辑
  async submitRegistration() {
    try {
      wx.showLoading({ title: '提交中...' });

      const { form } = this.data;

      // 确保先调用login获取code
      const data = await wx.login();
      if (!data.code) {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
        wx.hideLoading();
        return;
      }

      const openid = getOpenID();

      const heightValue = form?.userHeight?.label
        ? String(form.userHeight.label).replace('cm', '')
        : '';

      let registerParams: any = {
        openId: openid,
        code: data.code,
        nickName: form.nickName,
        gender: form.gender?.value || 0,  // 修正gender值的处理方式
        userBirthday: form.birthday?.label || '',
        userHeight: heightValue,
        userMbti: String(form.userMbti?.label || ''),
        country: 'CN',
        school: form.school || '',  // 学校字段现在是直接输入的字符串
        language: 'zh_CN',
        telephone: form.telephone,
        occupation: String(form.occupation?.label || ''),  // 添加职业字段 因form中无occupation字段，暂时设置为空字符串，需先在form类定义中添加occupation字段
        wechatAccount: form.wechatAccount || '', // 添加微信号字段
      };

      if (form.hometown) {
        const [province, city] = form.hometown.value.toString().split('-');
        registerParams.province = province;
        registerParams.city = city;
      }

      if (form.location) {
        const [presentProvince, presentCity] = form.location.value.toString().split('-');
        registerParams.presentProvince = presentProvince;
        registerParams.presentCity = presentCity;
      }

      const res = await postRegister(registerParams);

      if (res.code === 0) {
        const { token, userInfo } = res.data;

        if (token) {
          setToken(token);
        }

        if (userInfo) {
          setOpenID(userInfo.openId);
          setUserID(userInfo.id);

          if (app.globalData) {
            app.globalData.isRegistered = true;
            (app.globalData as any).userInfo = userInfo;
          }
        }

        wx.showToast({
          title: '注册成功',
          icon: 'success',
        });

        setTimeout(() => {
          navigateHelper.goPhotoUpload();
        }, 1000);
      } else {
        wx.showToast({
          title: res.msg || '注册失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({
        title: '注册失败，请重试',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },

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


    if (!form.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none',
      });
      return false;
    }

    if (!form.birthday) {
      wx.showToast({
        title: '请选择出生日期',
        icon: 'none',
      });
      return false;
    }

    if (!form.userHeight) {
      wx.showToast({
        title: '请选择身高',
        icon: 'none',
      });
      return false;
    }

    // if (!form.userMbti) {
    //   wx.showToast({
    //     title: '请选择MBTI',
    //     icon: 'none',
    //   });
    //   return false;
    // }

    if (!form.hometown) {
      wx.showToast({
        title: '请选择家乡',
        icon: 'none',
      });
      return false;
    }

    if (!form.location) {
      wx.showToast({
        title: '请选择现居地',
        icon: 'none',
      });
      return false;
    }

    if (!form.occupation) {
      wx.showToast({
        title: '请选择职业',
        icon: 'none',
      });
      return false;
    }



    return true;
  },

  // 学校输入处理
  onSchoolInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({
      'form.school': e.detail.value
    });
  },

  // 微信号输入处理
  onWechatInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({
      'form.wechatAccount': e.detail.value
    });
  },

  onLoad() {
    this.initFormData();
  },

  initFormData() {
    this.setData({
      'form.gender': this.data.pickerOptionsMap.gender[0],
    });
  },

  getUserProfile() {
    // 微信用户信息获取相关代码
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

  async initSchoolOptions() {
    // 使用公共数据源中的学校选项
    const schoolOptions = getSchoolOptions();
    this.setData({
      'pickerOptionsMap.school': schoolOptions,
    });
  },

  async onShow() {
    await this.initHeightOptions();
    await this.initMbtiOptions();
    await this.initCareerOptions();
  },
});
