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
          // 실제로는 TextDecoder 등을 사용해 다양한 인코딩을 시도해야 합니다
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
  
  // 파일 업로드 처리
  const handleFileUpload = (file) => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        
        // 파일이 CSV인지 TSV인지 자동 감지
        const firstLine = text.split('\n')[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';
        
        console.log(`파일 구분자: ${delimiter === '\t' ? 'Tab(TSV)' : 'Comma(CSV)'}`);
        
        // 파일 파싱
        const lines = text.trim().split('\n');
        const headers = lines[0].split(delimiter);
        
        // 헤더 검증
        const requiredFields = ['id', 'pronunciation', 'character', 'tone', 'rhymeCategory', 'meanings'];
        const headerValid = requiredFields.every(field => 
          headers.some(h => h.toLowerCase().includes(field.toLowerCase()))
        );
        
        if (!headerValid) {
          throw new Error('필수 필드가 누락되었습니다. 파일 형식을 확인하세요.');
        }
        
        // 데이터 매핑
        const parsedData = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(delimiter);
          if (values.length >= 5) {
            parsedData.push({
              id: parseInt(values[0]) || i,
              pronunciation: values[1] || '',
              character: values[2] || '',
              tone: values[3] || '',
              rhymeCategory: values[4] || '',
              meanings: values.slice(5).join(delimiter) || ''
            });
          }
        }
        
        setHanjaData(parsedData);
        setFileLoaded(true);
        setLoading(false);
        console.log(`${parsedData.length}개의 한자 데이터를 로드했습니다.`);
      } catch (err) {
        console.error('파일 파싱 오류:', err);
        setError(err.message || '파일 형식이 올바르지 않습니다.');
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>한자 평측사전</h1>
        <p className="version">v1.0</p>
      </header>

      {loading && <div className="loading">데이터를 불러오는 중입니다...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="file-upload-container">
        <label className="file-upload-label">
          <input 
            type="file" 
            accept=".tsv,.csv,.txt" 
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="file-input"
          />
        </label>
      </div>
      
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