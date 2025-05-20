import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthenticated, isAuthenticated, getPassword } from '../utils/auth';
import './HomeScreen.css';

// 사전 표지 이미지 URL (실제 이미지 경로로 수정 필요)
const coverImageUrl = '/images/dictionary-cover.jpg';

const HomeScreen = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showUsageInfo, setShowUsageInfo] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const navigate = useNavigate();
  
  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    // 이미 인증된 상태라면 사전 화면으로 바로 이동
    if (isAuthenticated()) {
      navigate('/dictionary');
    }
  }, [navigate]);
  
  // 비밀번호 입력 처리
  const handlePasswordChange = (e) => {
    // 숫자만 입력 가능하도록 설정
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    // 최대 4자리까지만 입력 가능
    if (value.length <= 4) {
      setPassword(value);
    }
    
    if (error) setError('');
  };
  
  // 비밀번호 검증 및 검색 화면으로 이동
  const handleEnterDictionary = () => {
    // 현재 설정된 비밀번호 가져오기
    const correctPassword = getPassword();
    
    if (password === correctPassword) {
      // 비밀번호가 맞으면 인증 상태 설정
      setAuthenticated(true);
      // 검색 화면으로 이동
      navigate('/dictionary');
    } else {
      // 비밀번호가 틀리면 오류 메시지 표시
      setError('비밀번호가 올바르지 않습니다.');
    }
  };
  
  // 엔터키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEnterDictionary();
    }
  };
  
  // 사용법 버튼 클릭 핸들러
  const handleUsageClick = () => {
    setShowUsageInfo(true);
    setShowNotice(false);
  };
  
  // 일러두기 버튼 클릭 핸들러
  const handleNoticeClick = () => {
    setShowNotice(true);
    setShowUsageInfo(false);
  };
  
  // 모달 닫기 핸들러
  const closeModal = () => {
    setShowUsageInfo(false);
    setShowNotice(false);
  };
  
  return (
    <div className="home-screen">
      <div className="home-container">
        <h1 className="dictionary-title">한자 평측사전</h1>
        <p className="version-text">(v 1.0)</p>
        
        <div className="cover-container">
          <img 
            src={process.env.PUBLIC_URL + coverImageUrl} 
            alt="한자 평측사전 표지" 
            className="cover-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x400?text=한자+평측사전';
            }}
          />
        </div>
        
        <div className="button-group">
          <button 
            className="info-button"
            onClick={handleNoticeClick}
          >
            일러두기
          </button>
          <button 
            className="info-button"
            onClick={handleUsageClick}
          >
            사용법
          </button>
        </div>
        
        <div className="password-container">
          <div className="password-input-wrapper">
            <label htmlFor="password-input">비밀번호 :</label>
            <input
              id="password-input"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="4"
              value={password}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              placeholder="0000"
              className="password-input"
            />
          </div>
          
          <button 
            onClick={handleEnterDictionary}
            className="start-button"
          >
            START
          </button>
          
          {error && <p className="error-message">{error}</p>}
        </div>
        
        <div className="copyright">
          <p>© 2025 한자 평측사전 by Y. S. Kim</p>
        </div>
      </div>
      
      {/* 사용법 모달 */}
      {showUsageInfo && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>사용법</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <ol>
                <li>
                  <strong>발음(音)으로 검색:</strong> 검색 유형을 '발음(音)'으로 선택하고 한자의 음을 입력합니다.
                  <ul>
                    <li>예: '水(물 수)'를 찾으려면 '수'를 입력합니다.</li>
                  </ul>
                </li>
                <li>
                  <strong>의미(訓)로 검색:</strong> 검색 유형을 '의미(訓)'로 선택하고 한자의 뜻을 입력합니다.
                  <ul>
                    <li>예: '즐겁다'를 찾으려면 '즐겁다'를 입력합니다.</li>
                  </ul>
                </li>
                <li>
                  <strong>운목(韻目)으로 검색:</strong> 검색 유형을 '운목(韻目)'으로 선택하고 운목 정보를 입력합니다.
                  <ul>
                    <li>예: '東'운에 속하는 한자를 찾으려면 '東'을 입력합니다.</li>
                  </ul>
                </li>
                <li>
                  <strong>검색 결과 확인:</strong> 검색 결과는 평성, 측성, 평측겸용으로 구분되어 표시됩니다.
                  <ul>
                    <li>각 한자를 클릭하여 상세 정보를 확인할 수 있습니다.</li>
                  </ul>
                </li>
              </ol>
              <p className="tips">* 검색어는 정확히 입력해야 합니다. 부분 검색은 지원하지 않습니다.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 일러두기 모달 */}
      {showNotice && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>일러두기</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <ul>
                <li>이 사전은 한자의 사성(四聲)과 의미 정보 검색에 특화된 사전이므로, 이 사전에 표기하지 않은 정보(예; 부수, 획수, 용례 등)는 다른 옥편이나 자전을 참고하시기 바랍니다.</li>
                <li>검색 결과는 평성, 측성(상성, 거성, 입성), 평측겸용 순으로 정렬되며, 평성은 <span className="ping-color">주황색</span>, 측성은 <span className="ceok-color">파란색</span>, 평측겸용은 <span className="dual-color">빨간색</span>으로 표시됩니다.</li>
                <li>의미와 운목 검색의 결과는 한글 발음의 가나다 순으로 정렬하였습니다.</li>
                <li>수록된 한자의 평측과 의미는 동아출판사의 '동아 백년옥편'을 참고하였습니다.</li>
                <li>오류나 개선을 위한 제안 등은 개발자(dsatkim@naver.com)에게 문의 바랍니다.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;