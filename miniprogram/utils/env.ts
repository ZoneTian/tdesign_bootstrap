// utils/env.ts

type EnvVersion = 'develop' | 'trial' | 'release';

interface EnvConfig {
  envVersion: EnvVersion;
  apiHost: string;
  userDataPath: string;
}

// 缓存已初始化的配置
let _config: EnvConfig | null = null;
// 用户手动覆盖的环境值
let _overrideEnv: EnvVersion | null = null;

/**
 * 初始化环境配置
 * @param overrideEnv 若传入，则优先使用此值；否则调用 wx.getAccountInfoSync()
 */
function initEnv(overrideEnv?: EnvVersion): EnvConfig {
  if (_config) return _config;

  // 决定最终的 envVersion：手动传入 > 模块缓存 > 微信 sync 读取
  const finalEnv: EnvVersion =
    overrideEnv || _overrideEnv || (wx.getAccountInfoSync().miniProgram.envVersion as EnvVersion);

  // 根据环境选择不同的 Host
  let apiHost = '';
  switch (finalEnv) {
    case 'develop':
      apiHost = 'https://www.womenshike.top/mp-api';
      break;
    case 'trial':
      apiHost = 'https://www.womenshike.top/mp-api';
      break;
    case 'release':
      apiHost = 'https://www.womenshike.top/mp-api';
      break;
  }

  _config = {
    envVersion: finalEnv,
    apiHost,
    userDataPath: wx.env.USER_DATA_PATH,
  };
  return _config;
}

/**
 * 对外暴露：获取环境配置
 * 如果之前调用过 setEnvVersion，initEnv 会优先用 override
 */
export function getEnv(): EnvConfig {
  return initEnv();
}

/**
 * 对外暴露：手动设置环境版本，并清空缓存以便重新初始化
 * @param env 想要切换到的环境，只能是 'develop' | 'trial' | 'release'
 */
export function setEnvVersion(env: EnvVersion): void {
  _overrideEnv = env;
  _config = null; // 重置缓存，下次调用 getEnv() 会重新走 initEnv
}
