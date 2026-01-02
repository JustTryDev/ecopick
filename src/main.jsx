/**
 * main.jsx - React 앱의 진입점 (Entry Point)
 *
 * 이 파일은 React 앱이 시작되는 곳입니다.
 * HTML의 'root' 요소에 React 앱을 연결하고,
 * 페이지 라우팅(URL에 따라 다른 페이지 보여주기)을 설정합니다.
 */

// React 라이브러리에서 StrictMode 가져오기
// StrictMode: 개발 중 잠재적 문제를 찾아주는 도구
import { StrictMode } from 'react'

// ReactDOM에서 createRoot 가져오기
// createRoot: React 앱을 HTML에 연결하는 함수
import { createRoot } from 'react-dom/client'

// React Router 라이브러리에서 라우팅 관련 컴포넌트 가져오기
// BrowserRouter: URL 기반 라우팅을 가능하게 함
// Routes: 여러 Route를 감싸는 컨테이너
// Route: 특정 URL과 컴포넌트를 연결
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// CSS 파일 가져오기 (전역 스타일)
import './index.css'

// 페이지 컴포넌트들 가져오기
import App from './App.jsx'           // 메인 페이지 (홈)
import Statement from './Statement.jsx' // 명세서 페이지
import Store from './Store.jsx'       // 스토어 페이지 (중고 의류 판매)
import ProductDetail from './ProductDetail.jsx' // 상품 상세 페이지
import Guide from './Guide.jsx'       // 수거 가이드 페이지

/**
 * createRoot(): HTML에서 id가 'root'인 요소를 찾아서 React 앱의 시작점으로 설정
 * render(): 그 안에 React 컴포넌트들을 그려줌 (렌더링)
 */
createRoot(document.getElementById('root')).render(
  // StrictMode: 개발 모드에서 추가 검사 실행 (배포 시에는 영향 없음)
  <StrictMode>
    {/* BrowserRouter: 브라우저의 URL을 React가 관리할 수 있게 함 */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Routes: 여러 개의 Route 중 URL에 맞는 하나만 보여줌 */}
      <Routes>
        {/*
          Route: URL 경로와 보여줄 컴포넌트를 연결
          - path="/": 기본 주소 (예: localhost:5173/)
          - element={<App />}: 해당 URL일 때 App 컴포넌트를 보여줌
        */}
        <Route path="/" element={<App />} />

        {/*
          /statement 경로로 접속하면 Statement 컴포넌트를 보여줌
          예: localhost:5173/statement
        */}
        <Route path="/statement" element={<Statement />} />

        {/*
          /store 경로로 접속하면 Store 컴포넌트를 보여줌
          수거한 중고 의류를 판매하는 스토어 페이지
          예: localhost:5173/store
        */}
        <Route path="/store" element={<Store />} />

        {/*
          /product/:id 경로로 접속하면 ProductDetail 컴포넌트를 보여줌
          :id는 동적 파라미터로, 상품 ID에 따라 다른 상품 정보를 보여줌
          예: localhost:5173/product/1 → 1번 상품 상세 페이지
        */}
        <Route path="/product/:id" element={<ProductDetail />} />

        {/*
          /guide 경로로 접속하면 Guide 컴포넌트를 보여줌
          수거 가능/불가 품목, 정산 기준, 포장 방법 안내 페이지
          예: localhost:5173/guide
        */}
        <Route path="/guide" element={<Guide />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
