import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Guide.css'

function Guide() {
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState('possible')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const possibleItems = [
    { category: '의류', items: ['티셔츠, 셔츠, 블라우스', '바지, 청바지, 슬랙스', '원피스, 스커트', '자켓, 코트, 패딩', '니트, 가디건, 후드티', '정장, 수트'] },
    { category: '신발', items: ['운동화, 스니커즈', '구두, 로퍼', '부츠 (롱부츠 제외)', '샌들, 슬리퍼 (욕실용 제외)'] },
    { category: '가방', items: ['백팩, 크로스백', '토트백, 숄더백', '클러치, 파우치', '에코백 (상태 양호 시)'] },
    { category: '기타', items: ['모자 (털모자 제외)', '스카프, 머플러', '홑이불, 담요', '커튼, 베개커버'] }
  ]

  const impossibleItems = [
    { category: '침구류', items: ['솜이불, 솜베개', '방석, 쿠션', '라텍스 침구', '전기장판, 전기요', '쿨매트'] },
    { category: '속옷/잡화', items: ['속옷, 팬티, 브라', '양말, 스타킹', '수영복', '잠옷, 수면바지'] },
    { category: '특수의류', items: ['교복, 유니폼', '단체복, 조끼', '스키복, 등산복 (고어텍스)', '웨딩드레스'] },
    { category: '신발/가방', items: ['바퀴 달린 신발 (롤러스케이트, 힐리스)', '캐리어, 바퀴 달린 가방', '털신, 장화', '가죽 롱부츠'] },
    { category: '기타 불가', items: ['심하게 오염/훼손된 의류', '젖은 의류', '애완동물 털/배설물 묻은 의류', '인형, 봉제완구'] }
  ]

  const gradeInfo = [
    { grade: 'A+', description: '새것 같은 상태', price: '800원/kg', detail: '태그가 붙어있거나 1-2회 착용, 오염/훼손 없음' },
    { grade: 'A', description: '양호한 상태', price: '600원/kg', detail: '약간의 착용감 있으나 깨끗하고 손상 없음' },
    { grade: 'B+', description: '보통 상태', price: '500원/kg', detail: '착용감 있고 약간의 보풀이나 색바램 있음' },
    { grade: 'B', description: '재활용 상태', price: '300원/kg', detail: '착용은 어렵지만 재활용 원료로 사용 가능' }
  ]

  const packingTips = [
    { icon: '📦', title: '봉투/박스 준비', desc: '비닐봉투, 종이봉투, 박스 등 어떤 것이든 OK!' },
    { icon: '👕', title: '깨끗하게 세탁', desc: '세탁 후 건조된 상태로 담아주세요' },
    { icon: '👟', title: '신발은 짝 맞춰서', desc: '신발은 반드시 짝을 맞춰 끈으로 묶어주세요' },
    { icon: '🚪', title: '문 앞에 배치', desc: '수거 당일 아침에 문 앞에 두시면 됩니다' }
  ]

  return (
    <>
      {/* Navigation */}
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">♻</span>
            <span className="logo-text">에코픽</span>
          </Link>
          <div className="nav-links">
            <Link to="/#service">서비스 소개</Link>
            <Link to="/store">스토어</Link>
            <Link to="/guide" className="active">수거 가이드</Link>
          </div>
          <Link to="/" className="nav-cta">수거 신청</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="guide-hero">
        <div className="container">
          <h1>수거 가이드</h1>
          <p>수거 가능 품목과 정산 기준을 확인하세요</p>
        </div>
      </section>

      {/* Items Section */}
      <section className="guide-items">
        <div className="container">
          <div className="guide-tabs">
            <button
              className={`guide-tab ${activeTab === 'possible' ? 'active' : ''}`}
              onClick={() => setActiveTab('possible')}
            >
              <span className="tab-icon">✓</span>
              수거 가능 품목
            </button>
            <button
              className={`guide-tab ${activeTab === 'impossible' ? 'active' : ''}`}
              onClick={() => setActiveTab('impossible')}
            >
              <span className="tab-icon">✕</span>
              수거 불가 품목
            </button>
          </div>

          {activeTab === 'possible' && (
            <div className="items-grid">
              {possibleItems.map((category, index) => (
                <div key={index} className="item-card possible">
                  <h3>{category.category}</h3>
                  <ul>
                    {category.items.map((item, idx) => (
                      <li key={idx}>
                        <span className="item-check">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'impossible' && (
            <div className="items-grid impossible-grid">
              {impossibleItems.map((category, index) => (
                <div key={index} className="item-card impossible">
                  <h3>{category.category}</h3>
                  <ul>
                    {category.items.map((item, idx) => (
                      <li key={idx}>
                        <span className="item-x">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grade Section */}
      <section className="guide-grade">
        <div className="container">
          <h2>의류 등급 및 정산 기준</h2>
          <p className="section-desc">의류 상태에 따라 등급이 나뉘며, 등급별로 정산 금액이 달라집니다.</p>

          <div className="grade-table">
            <div className="grade-header">
              <span>등급</span>
              <span>상태</span>
              <span>정산 단가</span>
              <span>상세 기준</span>
            </div>
            {gradeInfo.map((grade, index) => (
              <div key={index} className={`grade-row grade-${grade.grade.toLowerCase().replace('+', '-plus')}`}>
                <span className="grade-badge">{grade.grade}</span>
                <span className="grade-desc">{grade.description}</span>
                <span className="grade-price">{grade.price}</span>
                <span className="grade-detail">{grade.detail}</span>
              </div>
            ))}
          </div>

          <div className="grade-notice">
            <span className="notice-icon">💡</span>
            <p>최종 정산 금액은 검수 후 확정되며, 수거 완료 후 3~5일 이내에 입금됩니다.</p>
          </div>
        </div>
      </section>

      {/* Packing Section */}
      <section className="guide-packing">
        <div className="container">
          <h2>포장 방법</h2>
          <p className="section-desc">간단한 포장으로 수거 준비를 완료하세요!</p>

          <div className="packing-grid">
            {packingTips.map((tip, index) => (
              <div key={index} className="packing-card">
                <span className="packing-icon">{tip.icon}</span>
                <h3>{tip.title}</h3>
                <p>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="guide-cta">
        <div className="container">
          <h2>준비되셨나요?</h2>
          <p>지금 바로 수거 신청하고 옷장도 정리하고 용돈도 받아가세요!</p>
          <Link to="/" className="btn btn-primary btn-large">
            수거 신청하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>© 2024 에코픽. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">이용약관</a>
              <a href="#">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Guide
