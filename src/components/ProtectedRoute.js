import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  // 인증 상태 확인
  if (!isAuthenticated()) {
    // 인증되지 않은 경우 홈 화면으로 리다이렉트
    return <Navigate to="/" replace />;
  }
  
  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;