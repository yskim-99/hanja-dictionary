import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthenticated, isAuthenticated, getPassword } from '../utils/auth';
import './HomeScreen.css';

// 사전 표지 이미지 URL
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
  
  // 사용법 표시 토글
  const toggleUsageInfo = () => {
    setShowUsageInfo(!showUsageInfo);
    if (showNotice) setShowNotice(false);
  };
  
  // 일러두기 표시 토글
  const toggleNotice = () => {
    setShowNotice(!showNotice);
    if (showUsageInfo) setShowUsageInfo(false);
  };
  
  return (
    <div className="home-screen">
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
        
        <h1 className="dictionary-title">한자 평측사전</h1>
        <p className="dictionary-subtitle">중세 한국어의 한자음을 평성, 상성, 거성, 입성으로 구분한 사전</p>
      </div>
      
      <div className="info-buttons">
        <button 
          className={`info-button ${showUsageInfo ? 'active' : ''}`}
          onClick={toggleUsageInfo}
        >
          사용법
        </button>
        <button 
          className={`info-button ${showNotice ? 'active' : ''}`}
          onClick={toggleNotice}
        >
          일러두기
        </button>
      </div>
      
      {/* 사용법 정보 */}
      {showUsageInfo && (
        <div className="info-panel">
          <h2>사용법</h2>
          <ol>
            <li>
              <strong>발음(音)으로 검색:</strong> 검색 유형을 '발음(音)'으로 선택하고 한자의 발음을 입력합니다.
              <ul>
                <li>예: '물 수(水)'를 찾으려면 '수'를 입력합니다.</li>
              </ul>
            </li>
            <li>
              <strong>의미(訓)로 검색:</strong> 검색 유형을 '의미(訓)'로 선택하고 한자의 뜻을 입력합니다.
              <ul>
                <li>예: '물 수(水)'를 찾으려면 '물'을 입력합니다.</li>
              </ul>
            </li>
            <li>
              <strong>운목(韻目)으로 검색:</strong> 검색 유형을 '운목(韻目)'으로 선택하고 운목 정보를 입력합니다.
              <ul>
                <li>예: '東'운에 속하는 한자를 찾으려면 '東'을 입력합니다.</li>
                <li>평측겸용자를 찾으려면 '共'을 입력합니다.</li>
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
      )}
      
      {/* 일러두기 */}
      {showNotice && (
        <div className="info-panel">
          <h2>일러두기</h2>
          <ul>
            <li>이 사전은 중세 한국어의 한자음을 평성, 상성, 거성, 입성의 4성으로 구분하여 제공합니다.</li>
            <li>평성은 <span className="ping-color">주황색</span>, 측성(상성, 거성, 입성)은 <span className="ceok-color">파란색</span>, 평측겸용은 <span className="dual-color">빨간색</span>으로 표시됩니다.</li>
            <li>한자의 운목 정보는 훈몽자회와 동국정운 등의 문헌을 참고하였습니다.</li>
            <li>검색 결과는 평성, 측성, 평측겸용 순으로 정렬됩니다.</li>
            <li>동아출판사의 '동아 백년옥편'의 내용을 기반으로 제작되었습니다.</li>
            <li>현재 수록된 한자는 약 5,000자이며, 지속적으로 업데이트되고 있습니다.</li>
            <li>오류나 제안사항은 개발자에게 문의해주시기 바랍니다.</li>
          </ul>
        </div>
      )}
      
      <div className="password-container">
        <div className="password-input-wrapper">
          <label htmlFor="password-input">4자리 비밀번호</label>
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
          className="enter-button"
          disabled={password.length !== 4}
        >
          사전 입장
        </button>
        
        {error && <p className="error-message">{error}</p>}
      </div>
      
      <div className="copyright">
        <p>© 2024 한자 평측사전. All rights reserved.</p>
      </div>
    </div>
  );
};

export default HomeScreen;