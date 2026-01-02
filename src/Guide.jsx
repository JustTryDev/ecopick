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
    {
      category: '기본 품목',
      items: ['헌옷 (티셔츠, 바지, 원피스, 자켓 등)', '신발 (운동화, 구두, 샌들 등)', '가방 (백팩, 크로스백, 토트백 등)'],
      note: '기본 품목 20kg 이상부터 방문 수거 가능'
    },
    {
      category: '잡화류',
      items: ['모자, 목도리, 스카프', '벨트, 선글라스', '장갑, 양말, 속옷'],
      note: '착용 가능한 모든 잡화 품목 수거'
    },
    {
      category: '추가 품목',
      items: ['얇은 이불, 커튼, 카펫', '소형 인형 (30cm 이하)', '여행용 캐리어 (바퀴 정상)', '소형 가전류 (프린터/안마기 제외)'],
      note: '기본 품목 20kg 이상일 때 함께 수거 가능'
    },
    {
      category: '기타 수거 품목',
      items: ['컴퓨터 본체, 노트북, 모니터', '헌책, 만화책, CD, LP판', '냄비, 후라이팬, 스텐 제품', '폐휴대폰, 음료수캔, 전선류', '덕다운 이불'],
      note: '기본 품목 20kg 이상일 때 함께 수거 가능'
    }
  ]

  const impossibleItems = [
    {
      category: '침구류',
      items: ['솜이불, 솜베개', '목쿠션, 라텍스, 토퍼', '바닥패드, 전기장판']
    },
    {
      category: '신발류',
      items: ['바퀴 달린 신발 (롤러스케이트, 힐리스)', '겨울 털신발, 패딩부츠', '기모신발']
    },
    {
      category: '손상된 의류',
      items: ['곰팡이가 핀 의류/신발/가방', '심한 얼룩, 찢어진 의류', '동물 털이 심하게 묻은 의류', '경화되어 가루가 떨어지는 레자 제품']
    },
    {
      category: '기타 불가',
      items: ['카시트', '장난감', '대형 인형 (30cm 초과)']
    }
  ]

  const priceInfo = [
    { category: '기본 품목', items: [
      { name: '헌옷', price: '350원/kg', icon: '👕' },
      { name: '신발', price: '400원/kg', icon: '👟' },
      { name: '가방', price: '700원/kg', icon: '👜' }
    ]},
    { category: '추가 품목', items: [
      { name: '냄비/후라이팬', price: '200원/kg', icon: '🍳' },
      { name: '컴퓨터/노트북', price: '3,000원/대', icon: '💻' },
      { name: '모니터', price: '1,000원/대', icon: '🖥️' },
      { name: '폐휴대폰', price: '500원/개', icon: '📱' },
      { name: '덕다운 이불', price: '1,000원/kg', icon: '🛏️' }
    ]}
  ]

  const packingTips = [
    { icon: '📦', title: '20kg 기준', desc: '다이소 90L 재활용봉투 3~4개 = 약 20kg' },
    { icon: '👟', title: '신발/가방 분리', desc: '신발과 가방은 헌옷과 분리하여 따로 포장해 주세요' },
    { icon: '🚪', title: '비대면 수거', desc: '문 앞에 놓아주시면 수거 후 정산해드립니다' },
    { icon: '📞', title: '예약 필수', desc: '최소 하루 전 예약이 필요합니다' }
  ]

  const serviceInfo = [
    { icon: '📍', title: '수거 가능 지역', desc: '부천 전지역, 안산 전지역(거북섬·대부도 제외), 서울(오류동, 개봉동, 고척동, 항동, 궁동, 수궁동), 인천 부평구(부개동, 삼산동), 시흥 은계지구' },
    { icon: '⏰', title: '운영 시간', desc: '전화상담: 오전 7시~오후 7시 / 방문수거: 오전 7시~오후 4시' },
    { icon: '📅', title: '휴무일', desc: '매주 일요일 휴무' },
    { icon: '📏', title: '최소 수거량', desc: '기본 품목(헌옷+신발+가방) 20kg 이상' }
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

      {/* Service Info Section */}
      <section className="guide-service-info">
        <div className="container">
          <div className="service-info-grid">
            {serviceInfo.map((info, index) => (
              <div key={index} className="service-info-card">
                <span className="service-info-icon">{info.icon}</span>
                <h3>{info.title}</h3>
                <p>{info.desc}</p>
              </div>
            ))}
          </div>
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
                  {category.note && (
                    <p className="item-note">{category.note}</p>
                  )}
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

      {/* Price Section */}
      <section className="guide-grade">
        <div className="container">
          <h2>품목별 정산 기준</h2>
          <p className="section-desc">품목별로 정산 금액이 다르며, 기본 품목 20kg 이하는 무상 수거됩니다.</p>

          <div className="price-section">
            {priceInfo.map((section, index) => (
              <div key={index} className="price-category">
                <h3 className="price-category-title">{section.category}</h3>
                <div className="price-items">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="price-item">
                      <span className="price-icon">{item.icon}</span>
                      <span className="price-name">{item.name}</span>
                      <span className="price-value">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grade-notice free-notice">
            <span className="notice-icon">🎁</span>
            <p><strong>무상 수거:</strong> 기본 품목(헌옷+신발+가방) 합계 20kg 이하는 무상으로 수거해드립니다!</p>
          </div>

          <div className="grade-notice">
            <span className="notice-icon">💡</span>
            <p>추가 품목은 기본 품목 20kg 이상일 때만 함께 수거 가능합니다. 대량 수거는 010-8186-7982로 연락주세요.</p>
          </div>
        </div>
      </section>

      {/* Packing Section */}
      <section className="guide-packing">
        <div className="container">
          <h2>포장 방법 및 안내</h2>
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
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#" className="logo">
                <span className="logo-icon">♻</span>
                <span className="logo-text">에코픽</span>
              </a>
              <p className="footer-slogan">옷의 새로운 여정을 함께합니다</p>
            </div>
            <div className="footer-info">
              <div className="footer-info-row">
                <span className="info-label">상호명</span>
                <span className="info-value">헌옷마을 (에코픽)</span>
              </div>
              <div className="footer-info-row">
                <span className="info-label">대표자명</span>
                <span className="info-value">신재영</span>
              </div>
              <div className="footer-info-row">
                <span className="info-label">사업자번호</span>
                <span className="info-value">316-19-00023</span>
              </div>
              <div className="footer-info-row">
                <span className="info-label">통신판매신고번호</span>
                <span className="info-value">2016-경기부천-1758</span>
              </div>
              <div className="footer-info-row">
                <span className="info-label">소재지</span>
                <span className="info-value">경기도 부천시 원미구 부흥로296번길 25, 지층(중동)</span>
              </div>
              <div className="footer-info-row">
                <span className="info-label">전화번호</span>
                <span className="info-value"><a href="tel:010-8186-7982">010-8186-7982</a></span>
              </div>
              <div className="footer-info-row">
                <span className="info-label">이메일</span>
                <span className="info-value"><a href="mailto:scissorsin@naver.com">scissorsin@naver.com</a></span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 헌옷마을 (에코픽). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Guide
