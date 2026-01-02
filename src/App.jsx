import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

// 숫자 카운터 애니메이션 훅
function useCountUp(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime = null
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // easeOutExpo 이징
      const easeProgress = 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(easeProgress * (end - start) + start))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, start, duration])

  return { count, ref }
}

// 스크롤 애니메이션 훅
function useScrollAnimation() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

function App() {
  const [openFaq, setOpenFaq] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [isAddressOpen, setIsAddressOpen] = useState(false)
  const [pickupType, setPickupType] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phone, setPhone] = useState('')
  const [clothesAmount, setClothesAmount] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [entrancePassword, setEntrancePassword] = useState('')
  const [vehicleRegistration, setVehicleRegistration] = useState('')
  const addressLayerRef = useRef(null)

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwe0kebW-bhj-VksubN6YZ2oc14UFNb5a82yxr_RV6QyUCZ2jBd6tYErbpPDXXFPkfv/exec'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = {
      pickupType: pickupType === 'visit' ? '방문 수거' : '비대면 수거',
      address,
      addressDetail,
      phone,
      clothesAmount,
      preferredDate,
      preferredTime,
      entrancePassword,
      vehicleRegistration
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      setIsSubmitted(true)
    } catch (error) {
      console.error('제출 오류:', error)
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsSubmitted(false)
    setAddress('')
    setAddressDetail('')
    setPickupType('')
    setPhone('')
    setClothesAmount('')
    setPreferredDate('')
    setPreferredTime('')
    setEntrancePassword('')
    setVehicleRegistration('')
  }

  const openAddressSearch = () => {
    setIsAddressOpen(true)
    setTimeout(() => {
      new window.daum.Postcode({
        oncomplete: function(data) {
          let fullAddress = data.address
          let extraAddress = ''

          if (data.addressType === 'R') {
            if (data.bname !== '') {
              extraAddress += data.bname
            }
            if (data.buildingName !== '') {
              extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName)
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '')
          }

          setAddress(fullAddress)
          setIsAddressOpen(false)
        },
        onclose: function() {
          setIsAddressOpen(false)
        },
        width: '100%',
        height: '100%'
      }).embed(addressLayerRef.current)
    }, 100)
  }

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  // 카운터 애니메이션
  const stat1 = useCountUp(127849, 2500)
  const stat2 = useCountUp(32451, 2500)
  const stat3 = useCountUp(89, 2000)

  // 섹션 애니메이션
  const heroAnim = useScrollAnimation()
  const serviceAnim = useScrollAnimation()
  const processAnim = useScrollAnimation()
  const faqAnim = useScrollAnimation()

  const faqs = [
    {
      question: "어떤 옷이든 수거가 가능한가요?",
      answer: "네, 상태와 관계없이 모든 의류를 수거합니다. 깨끗한 옷은 기부되고, 상태가 좋지 않은 옷은 재활용 원료로 사용됩니다."
    },
    {
      question: "얼마를 받을 수 있나요?",
      answer: "의류 상태와 수량에 따라 정산 금액이 달라집니다. 옷이 많을수록 더 많은 금액을 받으실 수 있어요!"
    },
    {
      question: "최소 수거 수량이 있나요?",
      answer: "5벌 이상부터 수거가 가능합니다. 효율적인 수거와 환경을 위해 양해 부탁드립니다."
    }
  ]

  return (
    <>
      {/* Navigation */}
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#" className="logo">
            <span className="logo-icon">♻</span>
            <span className="logo-text">에코픽</span>
          </a>
          <div className="nav-links">
            <a href="#service">서비스 소개</a>
            <Link to="/store">스토어</Link>
            <a href="#faq">자주 묻는 질문</a>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="nav-cta">수거 신청</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" ref={heroAnim.ref}>
        <div className="container hero-container">
          <div className="hero-content">
            <p className={`hero-label fade-up ${heroAnim.isVisible ? 'visible' : ''}`}>
              옷장 정리부터 환경 보호까지
            </p>
            <h1 className={`hero-title fade-up delay-1 ${heroAnim.isVisible ? 'visible' : ''}`}>
              안 입는 옷,<br />
              <span className="highlight">에코픽</span>이 가져갈게요
            </h1>
            <p className={`hero-description fade-up delay-2 ${heroAnim.isVisible ? 'visible' : ''}`}>
              옷장 정리하면서 용돈까지!<br />
              옷이 많을수록 더 많이 받아가세요.
            </p>
            <div className={`hero-actions fade-up delay-3 ${heroAnim.isVisible ? 'visible' : ''}`}>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-animated">
                <span>수거 신청하기</span>
                <svg className="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <a href="#service" className="btn btn-secondary">자세히 알아보기</a>
            </div>
            <div className={`hero-stats fade-up delay-4 ${heroAnim.isVisible ? 'visible' : ''}`}>
              <div className="stat" ref={stat1.ref}>
                <span className="stat-number">{stat1.count.toLocaleString()}</span>
                <span className="stat-label">수거된 의류 (벌)</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat" ref={stat2.ref}>
                <span className="stat-number">{stat2.count.toLocaleString()}</span>
                <span className="stat-label">참여 고객</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat" ref={stat3.ref}>
                <span className="stat-number">{stat3.count}%</span>
                <span className="stat-label">재활용률</span>
              </div>
            </div>
          </div>
          <div className={`hero-image fade-up delay-2 ${heroAnim.isVisible ? 'visible' : ''}`}>
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop&q=80"
                alt="정리된 옷장"
                className="hero-img hero-img-main"
              />
              <img
                src="https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=300&h=380&fit=crop&q=80"
                alt="옷 기부"
                className="hero-img hero-img-secondary"
              />
              <div className="hero-image-badge">
                <span className="badge-icon">♻</span>
                <span className="badge-text">친환경 수거</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bg-gradient"></div>
      </section>

      {/* Service Section */}
      <section id="service" className="service" ref={serviceAnim.ref}>
        <div className="container">
          <p className={`section-label fade-up ${serviceAnim.isVisible ? 'visible' : ''}`}>서비스 소개</p>
          <h2 className={`section-title fade-up delay-1 ${serviceAnim.isVisible ? 'visible' : ''}`}>
            버려지는 옷에<br />
            새로운 가치를 더합니다
          </h2>
          <div className="service-grid">
            {[
              {
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>,
                title: "간편 수거",
                desc: "원하는 날짜에 문 앞에서\n편리하게 수거해 가요"
              },
              {
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>,
                title: "책임 재활용",
                desc: "수거된 의류는 상태에 따라\n기부, 업사이클링, 재활용됩니다"
              },
              {
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>,
                title: "현금 정산",
                desc: "수거된 의류에 따라\n현금으로 정산해 드려요"
              }
            ].map((service, index) => (
              <div
                key={index}
                className={`service-card fade-up delay-${index + 2} ${serviceAnim.isVisible ? 'visible' : ''}`}
              >
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="process" ref={processAnim.ref}>
        <div className="container">
          <p className={`section-label fade-up ${processAnim.isVisible ? 'visible' : ''}`}>수거 과정</p>
          <h2 className={`section-title fade-up delay-1 ${processAnim.isVisible ? 'visible' : ''}`}>3단계면 충분해요</h2>
          <div className="process-steps">
            {[
              { num: 1, title: "수거 신청", desc: "원하는 날짜와 시간을 선택하고\n주소를 입력해 주세요" },
              { num: 2, title: "옷 준비", desc: "안 입는 옷을 봉투에 담아\n문 앞에 두세요" },
              { num: 3, title: "수거 완료", desc: "에코픽이 수거 후\n재활용 리포트를 보내드려요" }
            ].map((step, index) => (
              <div key={index} className="step-wrapper">
                <div className={`step scale-up delay-${index + 2} ${processAnim.isVisible ? 'visible' : ''}`}>
                  <div className="step-number">
                    <span>{step.num}</span>
                  </div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
                {index < 2 && <div className={`step-line fade-in delay-${index + 3} ${processAnim.isVisible ? 'visible' : ''}`}></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            {isSubmitted ? (
              <div className="submit-success">
                <div className="success-icon">✓</div>
                <h2 className="modal-title">신청이 완료되었습니다!</h2>
                <p className="modal-description">
                  24시간 이내에 확인 연락을 드리겠습니다.<br />
                  감사합니다.
                </p>
                <button className="btn btn-primary btn-full" onClick={closeModal}>
                  확인
                </button>
              </div>
            ) : (
              <>
                <h2 className="modal-title">수거 신청</h2>
                <p className="modal-description">
                  옷장 정리하고 용돈도 벌어가세요
                </p>
                <form className="apply-form" onSubmit={handleSubmit}>
              {/* 유형 */}
              <div className="form-group">
                <label className="form-label">유형</label>
                <div className="form-radio-group">
                  <label className={`form-radio ${pickupType === 'visit' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="pickupType"
                      value="visit"
                      checked={pickupType === 'visit'}
                      onChange={(e) => setPickupType(e.target.value)}
                    />
                    <span className="radio-label">방문 수거</span>
                  </label>
                  <label className={`form-radio ${pickupType === 'contactless' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="pickupType"
                      value="contactless"
                      checked={pickupType === 'contactless'}
                      onChange={(e) => setPickupType(e.target.value)}
                    />
                    <span className="radio-label">비대면 수거</span>
                  </label>
                </div>
              </div>

              {/* 방문지 주소 */}
              <div className="form-group">
                <label className="form-label">방문지 주소</label>
                <div className="address-input-wrapper">
                  <input
                    type="text"
                    placeholder="주소 검색 (클릭)"
                    className="form-input"
                    value={address}
                    onClick={openAddressSearch}
                    readOnly
                  />
                  {isAddressOpen && (
                    <div className="address-layer">
                      <div className="address-layer-header">
                        <span>주소 검색</span>
                        <button type="button" onClick={() => setIsAddressOpen(false)}>✕</button>
                      </div>
                      <div ref={addressLayerRef} className="address-layer-content"></div>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="상세 주소 입력"
                  className="form-input"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </div>

              {/* 연락처 */}
              <div className="form-group">
                <label className="form-label">연락처</label>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* 헌옷양 */}
              <div className="form-group">
                <label className="form-label">헌옷양</label>
                <select
                  className="form-input"
                  value={clothesAmount}
                  onChange={(e) => setClothesAmount(e.target.value)}
                >
                  <option value="">선택해주세요</option>
                  <option value="소량 (5~10벌)">소량 (5~10벌)</option>
                  <option value="중량 (11~30벌)">중량 (11~30벌)</option>
                  <option value="대량 (31~50벌)">대량 (31~50벌)</option>
                  <option value="대량 (50벌 이상)">대량 (50벌 이상)</option>
                </select>
              </div>

              {/* 희망 날짜 및 시간 */}
              <div className="form-group">
                <label className="form-label">희망 날짜 및 시간</label>
                <div className="form-row">
                  <input
                    type="date"
                    className="form-input"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                  />
                  <select
                    className="form-input"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                  >
                    <option value="">시간대 선택</option>
                    <option value="오전 (9:00-12:00)">오전 (9:00-12:00)</option>
                    <option value="오후 (13:00-18:00)">오후 (13:00-18:00)</option>
                    <option value="저녁 (18:00-21:00)">저녁 (18:00-21:00)</option>
                  </select>
                </div>
              </div>

              {/* 기타 특이사항 */}
              <div className="form-group">
                <label className="form-label">기타 특이사항</label>
                <input
                  type="text"
                  placeholder="공동현관 비밀번호 (비대면 수거시)"
                  className="form-input"
                  value={entrancePassword}
                  onChange={(e) => setEntrancePassword(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="아파트 출입 차량 사전 등록 (필요시)"
                  className="form-input"
                  value={vehicleRegistration}
                  onChange={(e) => setVehicleRegistration(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-animated"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? '신청 중...' : '수거 신청하기'}</span>
                {!isSubmitting && (
                  <svg className="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </button>
              <p className="form-notice">신청 후 24시간 이내에 확인 연락을 드립니다</p>
              </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <section id="faq" className="faq" ref={faqAnim.ref}>
        <div className="container">
          <p className={`section-label fade-up ${faqAnim.isVisible ? 'visible' : ''}`}>자주 묻는 질문</p>
          <h2 className={`section-title fade-up delay-1 ${faqAnim.isVisible ? 'visible' : ''}`}>궁금한 점이 있으신가요?</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item fade-up delay-${index + 2} ${faqAnim.isVisible ? 'visible' : ''} ${openFaq === index ? 'open' : ''}`}
              >
                <div className="faq-question" onClick={() => toggleFaq(index)}>
                  <span>{faq.question}</span>
                  <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
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
            <div className="footer-links">
              <div className="footer-column">
                <h4>서비스</h4>
                <button onClick={() => setIsModalOpen(true)} className="footer-link-btn">수거 신청</button>
                <a href="#process">이용 방법</a>
                <a href="#faq">자주 묻는 질문</a>
              </div>
              <div className="footer-column">
                <h4>회사</h4>
                <a href="#">회사 소개</a>
                <a href="#">채용</a>
                <a href="#">블로그</a>
              </div>
              <div className="footer-column">
                <h4>고객센터</h4>
                <a href="tel:1588-0000">1588-0000</a>
                <a href="mailto:help@ecopick.kr">help@ecopick.kr</a>
              </div>
            </div>
          </div>
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

export default App
