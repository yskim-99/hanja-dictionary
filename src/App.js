import React, { useState, useEffect } from 'react';
import './App.css';
import HanjaDictionary from './components/HanjaDictionary';

function App() {
  const [hanjaData, setHanjaData] = useState([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 파일 로드
  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        setLoading(true);
        // 데이터 파일 경로 수정
        const dataFileUrl = process.env.PUBLIC_URL + '/data/hanja_database.tsv';
        
        console.log('데이터 파일 로드 시도:', dataFileUrl);
        
        // 파일 로드 시도
        const response = await fetch(dataFileUrl);
        if (!response.ok) {
          console.error('데이터 파일 로드 실패:', response.status, response.statusText);
          throw new Error('데이터 파일을 불러올 수 없습니다.');
        }
        
        const text = await response.text();
        console.log('데이터 파일 내용 일부:', text.substring(0, 200));
        
        // 인코딩 문제 처리: 한글이 깨져보이는지 확인
        const hasEncodingIssue = /[\uFFFD\uD800-\uDBFF]/.test(text) || 
                                !/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
        
        let parsedText = text;
        if (hasEncodingIssue) {
          console.log("인코딩 문제 감지, 다른 인코딩으로 시도합니다.");
          // 여기서는 인코딩 변환을 시뮬레이션합니다
        }
        
        // TSV 파일 파싱
        const lines = parsedText.trim().split('\n');
        const headers = lines[0].split('\t');
        
        // 데이터 매핑
        const parsedData = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split('\t');
          if (values.length >= 5) {
            parsedData.push({
              id: parseInt(values[0]) || i,
              pronunciation: values[1] || '',
              character: values[2] || '',
              tone: values[3] || '',
              rhymeCategory: values[4] || '',
              meanings: values.slice(5).join('\t') || ''
            });
          }
        }
        
        // 인코딩 문제가 심각하면 오류 발생
        if (parsedData.length > 0 && 
            parsedData.every(item => 
              !/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(item.pronunciation + item.meanings)
            )) {
          console.log("파싱된 데이터에 한글이 없습니다.");
          throw new Error('인코딩 문제로 데이터를 읽을 수 없습니다.');
        }
        
        setHanjaData(parsedData);
        setFileLoaded(true);
        setLoading(false);
        console.log(`${parsedData.length}개의 한자 데이터를 로드했습니다.`);
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        setError('데이터 파일을 로드하는 중 오류가 발생했습니다.');
        setLoading(false);
        setFileLoaded(false);
      }
    };
    
    loadDefaultData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>한자 평측사전</h1>
        <p className="version">v1.0</p>
      </header>

      {loading && <div className="loading">데이터를 불러오는 중입니다...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {/* 파일 업로드 부분 제거 */}
      
      {fileLoaded && !loading && (
        <HanjaDictionary hanjaData={hanjaData} />
      )}
      
      <footer className="App-footer">
        © 2025 한자 평측사전 by Y. S. Kim
      </footer>
    </div>
  );
}

export default App;