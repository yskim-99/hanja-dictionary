import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HanjaDictionary from './HanjaDictionary';
import { clearAuthentication, changePassword, getPassword, checkAdminPassword } from '../utils/auth';
import './DictionaryScreen.css';

const DictionaryScreen = () => {
  const navigate = useNavigate();
  const [hanjaData, setHanjaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 비밀번호 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
  
  // TSV 파일 불러오기
  useEffect(() => {
    const fetchHanjaData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.PUBLIC_URL}/data/hanja_database.tsv`);
        
        if (!response.ok) {
          throw new Error('한자 데이터를 불러오는데 실패했습니다.');
        }
        
        const tsvText = await response.text();
        const parsedData = parseTSV(tsvText);
        
        setHanjaData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error('한자 데이터 로딩 오류:', err);
        setError('한자 데이터를 불러오는데 문제가 발생했습니다.');
        setLoading(false);
      }
    };
    
    fetchHanjaData();
  }, []);
  
  // TSV 파일 파싱 함수
  const parseTSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split('\t');
    
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const entry = {};
      
      headers.forEach((header, index) => {
        entry[header.trim()] = values[index] ? values[index].trim() : '';
      });
      
      return entry;
    });
  };
  
  // 로그아웃 및 홈 화면으로 돌아가기
  const handleLogout = () => {
    // 인증 상태 초기화
    clearAuthentication();
    // 홈 화면으로 이동
    navigate('/');
  };
  
  // 비밀번호 변경 모달 열기
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setNewPassword('');
    setConfirmPassword('');
    setAdminPassword('');
    setPasswordMessage({ text: '', type: '' });
  };
  
  // 비밀번호 변경 모달 닫기
  const closePasswordModal = () => {
    setShowPasswordModal(false);
  };
  
  // 비밀번호 입력 처리 (숫자만 입력 가능, 4자리까지)
  const handlePasswordInput = (e, setter) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setter(value);
    }
    setPasswordMessage({ text: '', type: '' });
  };
  
  // 비밀번호 변경 처리
  const handleChangePassword = () => {
    // 새 비밀번호 유효성 검사
    if (newPassword.length !== 4) {
      setPasswordMessage({ 
        text: '비밀번호는 4자리 숫자여야 합니다.', 
        type: 'error' 
      });
      return;
    }
    
    // 새 비밀번호 확인
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ 
        text: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.', 
        type: 'error' 
      });
      return;
    }
    
    // 관리자 비밀번호 확인 후 비밀번호 변경
    const result = changePassword(newPassword, adminPassword);
    
    if (result.success) {
      setPasswordMessage({ 
        text: '비밀번호가 성공적으로 변경되었습니다.', 
        type: 'success' 
      });
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        closePasswordModal();
      }, 3000);
    } else {
      setPasswordMessage({ 
        text: result.message, 
        type: 'error' 
      });
    }
  };
  
  if (loading) {
    return <div className="loading-indicator">한자 데이터를 불러오는 중...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="dictionary-screen">
      <div className="dictionary-header">
        <div className="header-buttons">
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            ← 로그아웃
          </button>
          
          <button 
            className="change-password-button"
            onClick={openPasswordModal}
          >
            비밀번호 변경
          </button>
        </div>
        
        <h1 className="dictionary-screen-title">한자 평측사전</h1>
      </div>
      
      <div className="dictionary-container">
        <HanjaDictionary hanjaData={hanjaData} />
      </div>
      
      <div className="dictionary-footer">
        <p>© 2025 한자 평측사전 by Y. S. Kim</p>
      </div>
      
      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <div className="modal-header">
              <h2>비밀번호 변경</h2>
              <button 
                className="close-modal-button"
                onClick={closePasswordModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="password-field">
                <label htmlFor="admin-password">관리자 비밀번호</label>
                <input
                  id="admin-password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="4"
                  value={adminPassword}
                  onChange={(e) => handlePasswordInput(e, setAdminPassword)}
                  placeholder="관리자 비밀번호 입력"
                />
              </div>
              
              <div className="password-field">
                <label htmlFor="new-password">새 비밀번호 (4자리 숫자)</label>
                <input
                  id="new-password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="4"
                  value={newPassword}
                  onChange={(e) => handlePasswordInput(e, setNewPassword)}
                  placeholder="새 비밀번호 입력"
                />
              </div>
              
              <div className="password-field">
                <label htmlFor="confirm-password">새 비밀번호 확인</label>
                <input
                  id="confirm-password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="4"
                  value={confirmPassword}
                  onChange={(e) => handlePasswordInput(e, setConfirmPassword)}
                  placeholder="새 비밀번호 재입력"
                />
              </div>
              
              {passwordMessage.text && (
                <p className={`password-message ${passwordMessage.type}`}>
                  {passwordMessage.text}
                </p>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={closePasswordModal}
              >
                취소
              </button>
              <button 
                className="change-button"
                onClick={handleChangePassword}
                disabled={!adminPassword || !newPassword || !confirmPassword || newPassword.length !== 4}
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryScreen;