// src/utils/auth.js

// 비밀번호 초기값 - localStorage에 저장되어 있지 않을 경우 사용됨
const DEFAULT_PASSWORD = "4778";

// 관리자 비밀번호 (이 비밀번호를 아는 사람만 비밀번호 변경 가능)
const ADMIN_PASSWORD = "0920";

// 비밀번호 가져오기
export const getPassword = () => {
  try {
    // localStorage에서 저장된 비밀번호 가져오기
    const savedPassword = localStorage.getItem('hanjaDictionaryPassword');
    // 저장된 비밀번호가 있으면 그 값을, 없으면 초기값 반환
    return savedPassword || DEFAULT_PASSWORD;
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
    return DEFAULT_PASSWORD;
  }
};

// 관리자 비밀번호 확인
export const checkAdminPassword = (inputPassword) => {
  return inputPassword === ADMIN_PASSWORD;
};

// 비밀번호 변경
export const changePassword = (newPassword, adminPassword) => {
  try {
    // 관리자 비밀번호 검증
    if (!checkAdminPassword(adminPassword)) {
      return { success: false, message: '관리자 비밀번호가 올바르지 않습니다.' };
    }
    
    // 새 비밀번호가 4자리 숫자인지 검증
    if (/^\d{4}$/.test(newPassword)) {
      localStorage.setItem('hanjaDictionaryPassword', newPassword);
      return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
    } else {
      return { success: false, message: '비밀번호는 4자리 숫자여야 합니다.' };
    }
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
    return { success: false, message: '비밀번호 변경 중 오류가 발생했습니다.' };
  }
};

// 인증 상태를 localStorage에 저장
export const setAuthenticated = (value) => {
  try {
    localStorage.setItem('hanjaDictionaryAuth', value ? 'true' : 'false');
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
  }
};

// 인증 상태 확인
export const isAuthenticated = () => {
  try {
    return localStorage.getItem('hanjaDictionaryAuth') === 'true';
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
    return false;
  }
};

// 인증 상태 초기화 (로그아웃)
export const clearAuthentication = () => {
  try {
    localStorage.removeItem('hanjaDictionaryAuth');
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
  }
};