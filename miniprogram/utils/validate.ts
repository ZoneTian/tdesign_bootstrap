/**
 * 验证工具函数
 */

/**
 * 验证中国大陆手机号
 * 支持的格式:
 * - 1开头的11位数字
 * - 支持三大运营商号段和虚拟运营商号段
 * @param phone 手机号码
 * @returns 是否是有效的中国大陆手机号
 */
export function validateChinesePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // 中国大陆手机号正则表达式
  // 1. 以1开头
  // 2. 第二位是3-9之间的数字
  // 3. 后面是9位数字
  const phoneRegex = /^1[3-9]\d{9}$/;
  
  return phoneRegex.test(phone);
}

/**
 * 格式化手机号为 "***-****-****" 格式
 * @param phone 手机号码
 * @returns 格式化后的手机号
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone || phone.length !== 11) return phone;
  
  return `${phone.substring(0, 3)}****${phone.substring(7)}`;
}