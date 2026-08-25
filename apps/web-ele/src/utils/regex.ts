/**
 * 常用表单校验正则表达式与判断方法
 */

/** 11位中国大陆手机号码正则 */
export const PHONE_REGEX = /^1[3-9]\d{9}$/;

/** 电子邮箱正则 */
export const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** 身份证号码 (15位或18位，含末尾X/x) 正则 */
export const ID_CARD_REGEX =
  /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i;

/** 员工工号正则 (2~20位字母、数字、下划线或连字符) */
export const EMPLOYEE_NO_REGEX = /^[a-zA-Z0-9_-]{2,20}$/;

/** 密码长度 6~32 位正则 */
export const PASSWORD_REGEX = /^.{6,32}$/;

/** 校验是否为合法手机号 */
export function isPhone(value: string | number): boolean {
  return PHONE_REGEX.test(String(value || '').trim());
}

/** 校验是否为合法邮箱 */
export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(String(value || '').trim());
}

/** 校验是否为合法身份证号 */
export function isIdCard(value: string): boolean {
  return ID_CARD_REGEX.test(String(value || '').trim());
}

/** 校验是否为合法工号 */
export function isEmployeeNo(value: string): boolean {
  return EMPLOYEE_NO_REGEX.test(String(value || '').trim());
}
