import React, { useState, useRef } from 'react';
import './HanjaDictionary.css';

const HanjaDictionary = ({ hanjaData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('발음(音)');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedHanja, setSelectedHanja] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  // 검색 입력 필드에 대한 참조 추가
  const searchInputRef = useRef(null);
  
  // 검색 처리
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    let results = [];
    const term = searchTerm.trim();
    
    switch (searchType) {
      case '발음(音)':
        results = hanjaData.filter(hanja => 
          hanja.pronunciation === term
        );
        break;
      case '의미(訓)':
        results = hanjaData.filter(hanja => {
          // 의미를 세미콜론으로 분리하여 각 의미별로 확인
          const meanings = hanja.meanings.split(';');
          
          // 전처리된 검색어 만들기
          const noSpaceTerm = term.replace(/\s+/g, ''); // 공백 제거
          
          // 검색어로 시작하는 의미가 있는지 확인
          return meanings.some(meaning => {
            const cleanMeaning = meaning.trim();
            
            // 1. 정확히 일치하는 경우
            if (cleanMeaning === term) return true;
            
            // 2. 검색어 + 괄호로 시작하는 경우 (예: '절' → '절(寺)')
            if (cleanMeaning.startsWith(term + '(')) return true;
            
            // 3. 검색어 + 공백으로 시작하는 경우 (예: '홀로' → '홀로 가다')
            if (cleanMeaning.startsWith(term + ' ')) return true;
            
            // 4. 전처리된 의미 생성 (괄호 제거, 공백 제거, 가운뎃점 제거)
            // a. 모든 괄호와 그 내용 제거 (예: '안치(安置)하다' → '안치하다')
            let processedMeaning = cleanMeaning.replace(/\([^)]*\)/g, '');
            // b. 가운뎃점 제거 (예: '남녀·자웅의' → '남녀자웅의')
            processedMeaning = processedMeaning.replace(/·/g, '');
            // c. 공백 제거
            processedMeaning = processedMeaning.replace(/\s+/g, '');
            
            // 5. 전처리된 의미와 전처리된 검색어 비교
            // 5-1. 정확히 일치하는 경우
            if (processedMeaning === noSpaceTerm) return true;
            
            // 5-2. 전처리된 의미가 전처리된 검색어로 시작하는 경우
            if (processedMeaning.startsWith(noSpaceTerm)) {
              // 검색어 뒤에 다른 문자가 있는지 확인 (접두어 검색)
              // 예: '안치하다'로 검색했을 때 '안치하다', '안치하다가' 등이 포함됨
              return true;
            }
            
            // 6. 원본 의미에서 띄어쓰기 차이만 처리
            const noSpaceMeaning = cleanMeaning.replace(/\s+/g, '');
            if (noSpaceMeaning === noSpaceTerm) return true;
            
            // 7. 검색어에 띄어쓰기가 있는 경우 처리 (예: '들어 올리다' → '들어올리다')
            if (term.includes(' ') && noSpaceMeaning.startsWith(noSpaceTerm)) {
              if (noSpaceMeaning.length <= noSpaceTerm.length + 2) return true;
            }
            
            return false;
          });
        });
        
        // 검색 결과 정렬 (관련성 높은 순)
        results.sort((a, b) => {
          const meaningsA = a.meanings.split(';');
          const meaningsB = b.meanings.split(';');
          
          // 관련성 점수 계산 함수
          const calculateRelevance = (meaning) => {
            const cleanMeaning = meaning.trim();
            
            // 정확히 일치하는 경우
            if (cleanMeaning === term) return 5;
            
            // 검색어 + 괄호로 시작하는 경우 (예: '절' → '절(寺)')
            if (cleanMeaning.startsWith(term + '(')) return 4;
            
            // 검색어 + 공백으로 시작하는 경우 (예: '홀로' → '홀로 가다')
            if (cleanMeaning.startsWith(term + ' ')) return 3;
            
            // 괄호나 가운뎃점 제거 후 일치하는 경우
            let processedMeaning = cleanMeaning.replace(/\([^)]*\)/g, '').replace(/·/g, '').replace(/\s+/g, '');
            const noSpaceTerm = term.replace(/\s+/g, '');
            
            if (processedMeaning === noSpaceTerm) return 2;
            
            // 띄어쓰기 차이만 있는 경우
            if (cleanMeaning.replace(/\s+/g, '') === noSpaceTerm) return 1;
            
            return 0;
          };
          
          // a의 관련성 점수 계산
          const relevanceA = Math.max(...meaningsA.map(calculateRelevance));
          
          // b의 관련성 점수 계산
          const relevanceB = Math.max(...meaningsB.map(calculateRelevance));
          
          // 관련성 점수로 정렬 (내림차순)
          return relevanceB - relevanceA;
        });
        break;
      case '운목(韻目)':
        // 수정된 부분: 특정 운목을 검색하는 경우와 '共'을 검색하는 경우 구분
        if (term === '共') {
          // '共'을 검색하는 경우 평측겸용자만 표시
          results = hanjaData.filter(hanja => 
            hanja.rhymeCategory === '共'
          );
        } else {
          // 수정: 운목에 검색어가 포함된 모든 항목을 표시 (1글자 이상의 운목도 포함)
          results = hanjaData.filter(hanja => 
            hanja.rhymeCategory.includes(term) && hanja.rhymeCategory !== '共'
          );
        }
        break;
      default:
        break;
    }
    
    console.log(`검색 조건: ${searchType}, 검색어: ${term}, 결과 수: ${results.length}`);
    setSearchResults(results);
    setSelectedHanja(null);
  };

  // 검색어 초기화 처리
  const handleClearSearch = () => {
    setSearchTerm('');
    // 검색창에 포커스 주기
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // 검색 입력 시 엔터키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 한자 선택
  const handleHanjaSelect = (hanja) => {
    setSelectedHanja(hanja);
    // 상세 정보 영역으로 스크롤
    setTimeout(() => {
      const detailElement = document.querySelector('.hanja-detail');
      if (detailElement) {
        detailElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // 성조 표시
  const getToneDisplay = (tone) => {
    switch (tone) {
      case '平': return '평성';
      case '上': return '상성';
      case '去': return '거성';
      case '入': return '입성';
      case '共': return '평측겸용';
      default: return tone;
    }
  };

  // 성조 그룹화 (평성, 측성, 공용 순으로)
  const getToneGroup = (tone) => {
    if (tone === '平') return 1; // 평성
    if (tone === '共') return 3; // 평측겸용
    return 2; // 측성 (上, 去, 入)
  };

  // 결과 정렬 (평성, 측성, 공용 순으로)
  const sortedResults = [...searchResults].sort((a, b) => {
    // 먼저 성조 그룹으로 정렬
    const toneGroupA = getToneGroup(a.tone);
    const toneGroupB = getToneGroup(b.tone);
    
    if (toneGroupA !== toneGroupB) {
      return toneGroupA - toneGroupB;
    }
    
    // 같은 성조 그룹 내에서 발음(音)의 가나다 순으로 정렬
    return a.pronunciation.localeCompare(b.pronunciation, 'ko');
  });

  // 성조에 따른 CSS 클래스
  const getToneClass = (tone) => {
    if (tone === '平') return 'ping';
    if (tone === '共') return 'dual';
    return 'ceok'; // 측성
  };

  return (
    <div className="hanja-dictionary">
      {/* 검색 영역 */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="검색어 입력..."
            className="search-input"
            ref={searchInputRef} // ref 추가
          />
          {searchTerm && (
            <button 
              className="clear-search-button" 
              onClick={handleClearSearch}
              aria-label="검색어 지우기"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="search-options">
          <div className="dropdown-container">
            <div
              onClick={() => setShowOptions(!showOptions)}
              className="selected-option"
            >
              <span>{searchType}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            
            {showOptions && (
              <div className="options-dropdown">
                <div 
                  onClick={() => {
                    setSearchType('발음(音)');
                    setShowOptions(false);
                  }}
                  className="option-item"
                >
                  <div className={`radio-button ${searchType === '발음(音)' ? 'selected' : ''}`}>
                    {searchType === '발음(音)' && <div className="radio-dot"></div>}
                  </div>
                  <span>발음(音)</span>
                </div>
                
                <div 
                  onClick={() => {
                    setSearchType('의미(訓)');
                    setShowOptions(false);
                  }}
                  className="option-item"
                >
                  <div className={`radio-button ${searchType === '의미(訓)' ? 'selected' : ''}`}>
                    {searchType === '의미(訓)' && <div className="radio-dot"></div>}
                  </div>
                  <span>의미(訓)</span>
                </div>
                
                <div 
                  onClick={() => {
                    setSearchType('운목(韻目)');
                    setShowOptions(false);
                  }}
                  className="option-item"
                >
                  <div className={`radio-button ${searchType === '운목(韻目)' ? 'selected' : ''}`}>
                    {searchType === '운목(韻目)' && <div className="radio-dot"></div>}
                  </div>
                  <span>운목(韻目)</span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSearch}
            className="search-button"
          >
            검색
          </button>
        </div>
      </div>
      
      {/* 검색 결과 */}
      {sortedResults.length > 0 ? (
        <div className="search-results">
          <h2 className="results-title">
            검색 결과 ({sortedResults.length}개)
          </h2>
          
          {/* 평성 결과 - 간략 표시 */}
          {sortedResults.some(hanja => hanja.tone === '平') && (
            <div className="tone-group">
              <h3 className="tone-title">
                <span className="tone-indicator ping"></span>
                평성
              </h3>
              
              <div className="simplified-results">
                {sortedResults
                  .filter(hanja => hanja.tone === '平')
                  .map(hanja => (
                    <div 
                      key={hanja.id}
                      onClick={() => handleHanjaSelect(hanja)}
                      className="simplified-hanja-item dual"
                    >
                      <span className="hanja-char">{hanja.character}</span>
                      <span className="hanja-pronunciation">({hanja.pronunciation} - 평측겸용)</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      ) : searchTerm || (searchType === '필기인식' && recognizedChars.length === 0) ? (
        <div className="no-results">
          <p>
            {searchType === '필기인식' 
              ? '한자를 그리고 인식 버튼을 눌러주세요.'
              : '검색 결과가 없습니다!'}
          </p>
        </div>
      ) : null}
      
      {/* 한자 상세 정보 */}
      {selectedHanja && (
        <div className="hanja-detail">
          <h2 className="detail-title">한자 상세 정보</h2>
          
          <div className="detail-header">
            <div className="detail-character">
              <span>{selectedHanja.character}</span>
            </div>
            
            <div className="detail-info">
              <div className="detail-pronunciation">
                <span className={`tone-badge ${getToneClass(selectedHanja.tone)}`}>
                  {selectedHanja.pronunciation} ({getToneDisplay(selectedHanja.tone)})
                </span>
              </div>
              
              <div className="detail-rhyme">
                운목(韻目): <span className="rhyme-value">{selectedHanja.rhymeCategory}</span>
              </div>
              
              <div className="detail-id">
                ID: <span>{selectedHanja.id}</span>
              </div>
            </div>
          </div>
          
          <div className="detail-meanings">
            <h3 className="meanings-title">
              의미(訓) - 전체 {selectedHanja.meanings.split(';').length}개
            </h3>
            <p className="meanings-list">
              {selectedHanja.meanings.split(';').map((meaning, idx) => (
                <span key={idx} className="meaning-item">
                  {meaning}
                  {idx < selectedHanja.meanings.split(';').length - 1 && ", "}
                </span>
              ))}
            </p>
          </div>
          
          <button 
            className="back-to-results"
            onClick={() => setSelectedHanja(null)}
          >
            검색 결과로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default HanjaDictionary;
                      key={hanja.id}
                      onClick={() => handleHanjaSelect(hanja)}
                      className="simplified-hanja-item"
                    >
                      <span className="hanja-char">{hanja.character}</span>
                      <span className="hanja-pronunciation">({hanja.pronunciation})</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* 측성 결과 - 간략 표시 */}
          {sortedResults.some(hanja => ['上', '去', '入'].includes(hanja.tone)) && (
            <div className="tone-group">
              <h3 className="tone-title">
                <span className="tone-indicator ceok"></span>
                측성
              </h3>
              
              <div className="simplified-results">
                {sortedResults
                  .filter(hanja => ['上', '去', '入'].includes(hanja.tone))
                  .map(hanja => (
                    <div 
                      key={hanja.id}
                      onClick={() => handleHanjaSelect(hanja)}
                      className="simplified-hanja-item"
                    >
                      <span className="hanja-char">{hanja.character}</span>
                      <span className="hanja-pronunciation">({hanja.pronunciation} - {getToneDisplay(hanja.tone)})</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* 평측겸용 결과 - 간략 표시 */}
          {sortedResults.some(hanja => hanja.tone === '共') && (
            <div className="tone-group">
              <h3 className="tone-title">
                <span className="tone-indicator dual"></span>
                평측겸용
              </h3>
              
              <div className="simplified-results">
                {sortedResults
                  .filter(hanja => hanja.tone === '共')
                  .map(hanja => (
                    <div 
                      key={hanja.id}
                      onClick={() => handleHanjaSelect(hanja)}
                      className="simplified-hanja-item dual"
                    >
                      <span className="hanja-char">{hanja.character}</span>
                      <span className="hanja-pronunciation">({hanja.pronunciation} - 평측겸용)</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      ) : searchTerm ? (
        <div className="no-results">
          <p>검색 결과가 없습니다!</p>
        </div>
      ) : null}
      
      {/* 한자 상세 정보 */}
      {selectedHanja && (
        <div className="hanja-detail">
          <h2 className="detail-title">한자 상세 정보</h2>
          
          <div className="detail-header">
            <div className="detail-character">
              <span>{selectedHanja.character}</span>
            </div>
            
            <div className="detail-info">
              <div className="detail-pronunciation">
                <span className={`tone-badge ${getToneClass(selectedHanja.tone)}`}>
                  {selectedHanja.pronunciation} ({getToneDisplay(selectedHanja.tone)})
                </span>
              </div>
              
              <div className="detail-rhyme">
                운목(韻目): <span className="rhyme-value">{selectedHanja.rhymeCategory}</span>
              </div>
              
              <div className="detail-id">
                ID: <span>{selectedHanja.id}</span>
              </div>
            </div>
          </div>
          
          <div className="detail-meanings">
            <h3 className="meanings-title">
              의미(訓) - 전체 {selectedHanja.meanings.split(';').length}개
            </h3>
            <p className="meanings-list">
              {selectedHanja.meanings.split(';').map((meaning, idx) => (
                <span key={idx} className="meaning-item">
                  {meaning}
                  {idx < selectedHanja.meanings.split(';').length - 1 && ", "}
                </span>
              ))}
            </p>
          </div>
          
          <button 
            className="back-to-results"
            onClick={() => setSelectedHanja(null)}
          >
            검색 결과로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default HanjaDictionary;';').length}개
            </h3>
            <p className="meanings-list">
              {selectedHanja.meanings.split(';').map((meaning, idx) => (
                <span key={idx} className="meaning-item">
                  {meaning}
                  {idx < selectedHanja.meanings.split(';').length - 1 && ", "}
                </span>
              ))}
            </p>
          </div>
          
          <button 
            className="back-to-results"
            onClick={() => setSelectedHanja(null)}
          >
            검색 결과로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default HanjaDictionary;