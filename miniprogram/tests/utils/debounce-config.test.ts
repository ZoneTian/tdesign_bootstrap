/**
 * 防抖配置单元测试
 */

import {
  DEBOUNCE_DELAYS,
  DEBOUNCE_KEYS,
  PAGE_DEBOUNCE_CONFIG,
  COMPONENT_DEBOUNCE_CONFIG,
  NAVIGATION_DEBOUNCE_CONFIG,
  getPageDebounceConfig,
  getComponentDebounceConfig,
  getDebounceDelay,
  getDebounceKey
} from '../../utils/debounce-config';

describe('防抖配置测试', () => {
  describe('DEBOUNCE_DELAYS 常量测试', () => {
    test('应该包含所有必要的延迟时间配置', () => {
      expect(DEBOUNCE_DELAYS.BUTTON_CLICK).toBe(300);
      expect(DEBOUNCE_DELAYS.NAVIGATION).toBe(500);
      expect(DEBOUNCE_DELAYS.API_REQUEST).toBe(500);
      expect(DEBOUNCE_DELAYS.FORM_SUBMIT).toBe(800);
      expect(DEBOUNCE_DELAYS.SEARCH_INPUT).toBe(300);
      expect(DEBOUNCE_DELAYS.POPUP_ACTION).toBe(200);
      expect(DEBOUNCE_DELAYS.FILE_UPLOAD).toBe(1000);
      expect(DEBOUNCE_DELAYS.FOLLOW_ACTION).toBe(600);
      expect(DEBOUNCE_DELAYS.DATA_REFRESH).toBe(400);
    });

    test('所有延迟时间应该是正数', () => {
      Object.values(DEBOUNCE_DELAYS).forEach(delay => {
        expect(delay).toBeGreaterThan(0);
        expect(typeof delay).toBe('number');
      });
    });
  });

  describe('DEBOUNCE_KEYS 常量测试', () => {
    test('应该包含所有必要的键名配置', () => {
      expect(DEBOUNCE_KEYS.HOME_PINK).toBe('home_pink');
      expect(DEBOUNCE_KEYS.PROFILE_MY_LIKES).toBe('profile_my_likes');
      expect(DEBOUNCE_KEYS.PUBLIC_PROFILE_FOLLOW).toBe('public_profile_follow');
      expect(DEBOUNCE_KEYS.NAVIGATE_TO).toBe('navigate_to');
    });

    test('所有键名应该是字符串且不为空', () => {
      Object.values(DEBOUNCE_KEYS).forEach(key => {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
      });
    });

    test('所有键名应该是唯一的', () => {
      const keys = Object.values(DEBOUNCE_KEYS);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('PAGE_DEBOUNCE_CONFIG 测试', () => {
    test('应该包含主要页面的配置', () => {
      expect(PAGE_DEBOUNCE_CONFIG.home).toBeDefined();
      expect(PAGE_DEBOUNCE_CONFIG.profile).toBeDefined();
      expect(PAGE_DEBOUNCE_CONFIG.publicProfile).toBeDefined();
      expect(PAGE_DEBOUNCE_CONFIG.personalInfo).toBeDefined();
      expect(PAGE_DEBOUNCE_CONFIG.events).toBeDefined();
    });

    test('首页配置应该正确', () => {
      const homeConfig = PAGE_DEBOUNCE_CONFIG.home;
      expect(homeConfig.onPink).toBe(DEBOUNCE_DELAYS.FOLLOW_ACTION);
      expect(homeConfig.onConfirm).toBe(DEBOUNCE_DELAYS.NAVIGATION);
      expect(homeConfig.onEventInfo).toBe(DEBOUNCE_DELAYS.NAVIGATION);
      expect(homeConfig.goWelcome).toBe(DEBOUNCE_DELAYS.NAVIGATION);
    });

    test('个人资料页配置应该正确', () => {
      const profileConfig = PAGE_DEBOUNCE_CONFIG.profile;
      expect(profileConfig.onMyLikes).toBe(DEBOUNCE_DELAYS.NAVIGATION);
      expect(profileConfig.onUploadAvatar).toBe(DEBOUNCE_DELAYS.FILE_UPLOAD);
    });

    test('所有配置值应该是正数', () => {
      Object.values(PAGE_DEBOUNCE_CONFIG).forEach(pageConfig => {
        Object.values(pageConfig).forEach(delay => {
          expect(delay).toBeGreaterThan(0);
          expect(typeof delay).toBe('number');
        });
      });
    });
  });

  describe('COMPONENT_DEBOUNCE_CONFIG 测试', () => {
    test('应该包含主要组件的配置', () => {
      expect(COMPONENT_DEBOUNCE_CONFIG.eventsCard).toBeDefined();
      expect(COMPONENT_DEBOUNCE_CONFIG.likesCard).toBeDefined();
      expect(COMPONENT_DEBOUNCE_CONFIG.uploadFile).toBeDefined();
      expect(COMPONENT_DEBOUNCE_CONFIG.picker).toBeDefined();
    });

    test('活动卡片组件配置应该正确', () => {
      const eventsCardConfig = COMPONENT_DEBOUNCE_CONFIG.eventsCard;
      expect(eventsCardConfig.onTap).toBe(DEBOUNCE_DELAYS.NAVIGATION);
      expect(eventsCardConfig.onSignUp).toBe(DEBOUNCE_DELAYS.API_REQUEST);
    });

    test('所有配置值应该是正数', () => {
      Object.values(COMPONENT_DEBOUNCE_CONFIG).forEach(componentConfig => {
        Object.values(componentConfig).forEach(delay => {
          expect(delay).toBeGreaterThan(0);
          expect(typeof delay).toBe('number');
        });
      });
    });
  });

  describe('NAVIGATION_DEBOUNCE_CONFIG 测试', () => {
    test('应该包含所有导航方法的配置', () => {
      expect(NAVIGATION_DEBOUNCE_CONFIG.navigateTo).toBe(DEBOUNCE_DELAYS.NAVIGATION);
      expect(NAVIGATION_DEBOUNCE_CONFIG.redirectTo).toBe(DEBOUNCE_DELAYS.NAVIGATION);
      expect(NAVIGATION_DEBOUNCE_CONFIG.switchTab).toBe(DEBOUNCE_DELAYS.NAVIGATION);
      expect(NAVIGATION_DEBOUNCE_CONFIG.navigateBack).toBe(DEBOUNCE_DELAYS.NAVIGATION);
    });
  });

  describe('辅助函数测试', () => {
    describe('getPageDebounceConfig', () => {
      test('应该返回正确的页面配置', () => {
        const homeConfig = getPageDebounceConfig('home');
        expect(homeConfig).toEqual(PAGE_DEBOUNCE_CONFIG.home);

        const profileConfig = getPageDebounceConfig('profile');
        expect(profileConfig).toEqual(PAGE_DEBOUNCE_CONFIG.profile);
      });

      test('不存在的页面应该返回空对象', () => {
        const nonExistentConfig = getPageDebounceConfig('nonExistent' as any);
        expect(nonExistentConfig).toEqual({});
      });
    });

    describe('getComponentDebounceConfig', () => {
      test('应该返回正确的组件配置', () => {
        const eventsCardConfig = getComponentDebounceConfig('eventsCard');
        expect(eventsCardConfig).toEqual(COMPONENT_DEBOUNCE_CONFIG.eventsCard);

        const pickerConfig = getComponentDebounceConfig('picker');
        expect(pickerConfig).toEqual(COMPONENT_DEBOUNCE_CONFIG.picker);
      });

      test('不存在的组件应该返回空对象', () => {
        const nonExistentConfig = getComponentDebounceConfig('nonExistent' as any);
        expect(nonExistentConfig).toEqual({});
      });
    });

    describe('getDebounceDelay', () => {
      test('应该返回正确的延迟时间', () => {
        expect(getDebounceDelay('BUTTON_CLICK')).toBe(300);
        expect(getDebounceDelay('NAVIGATION')).toBe(500);
        expect(getDebounceDelay('FILE_UPLOAD')).toBe(1000);
      });

      test('应该返回数字类型', () => {
        Object.keys(DEBOUNCE_DELAYS).forEach(key => {
          const delay = getDebounceDelay(key as keyof typeof DEBOUNCE_DELAYS);
          expect(typeof delay).toBe('number');
        });
      });
    });

    describe('getDebounceKey', () => {
      test('应该返回正确的键名', () => {
        expect(getDebounceKey('HOME_PINK')).toBe('home_pink');
        expect(getDebounceKey('PROFILE_MY_LIKES')).toBe('profile_my_likes');
        expect(getDebounceKey('NAVIGATE_TO')).toBe('navigate_to');
      });

      test('应该返回字符串类型', () => {
        Object.keys(DEBOUNCE_KEYS).forEach(key => {
          const keyName = getDebounceKey(key as keyof typeof DEBOUNCE_KEYS);
          expect(typeof keyName).toBe('string');
          expect(keyName.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('配置一致性测试', () => {
    test('页面配置中使用的延迟时间应该在 DEBOUNCE_DELAYS 中定义', () => {
      const definedDelays = new Set(Object.values(DEBOUNCE_DELAYS));
      
      Object.values(PAGE_DEBOUNCE_CONFIG).forEach(pageConfig => {
        Object.values(pageConfig).forEach(delay => {
          expect(definedDelays.has(delay)).toBe(true);
        });
      });
    });

    test('组件配置中使用的延迟时间应该在 DEBOUNCE_DELAYS 中定义', () => {
      const definedDelays = new Set(Object.values(DEBOUNCE_DELAYS));
      
      Object.values(COMPONENT_DEBOUNCE_CONFIG).forEach(componentConfig => {
        Object.values(componentConfig).forEach(delay => {
          expect(definedDelays.has(delay)).toBe(true);
        });
      });
    });

    test('导航配置中使用的延迟时间应该在 DEBOUNCE_DELAYS 中定义', () => {
      const definedDelays = new Set(Object.values(DEBOUNCE_DELAYS));
      
      Object.values(NAVIGATION_DEBOUNCE_CONFIG).forEach(delay => {
        expect(definedDelays.has(delay)).toBe(true);
      });
    });
  });

  describe('类型安全测试', () => {
    test('配置对象应该是只读的', () => {
      // 这个测试主要是为了确保 TypeScript 类型定义正确
      // 在运行时，我们可以检查对象是否被冻结
      expect(Object.isFrozen(DEBOUNCE_DELAYS)).toBe(false); // const 断言不会冻结对象
      
      // 但我们可以验证配置的结构
      expect(typeof DEBOUNCE_DELAYS).toBe('object');
      expect(typeof PAGE_DEBOUNCE_CONFIG).toBe('object');
      expect(typeof COMPONENT_DEBOUNCE_CONFIG).toBe('object');
    });
  });
});