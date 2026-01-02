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
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [isAddressOpen, setIsAddressOpen] = useState(false)
  const [pickupType, setPickupType] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [formErrors, setFormErrors] = useState({
    pickupType: '',
    address: '',
    phone: '',
    preferredDate: ''
  })
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [entrancePassword, setEntrancePassword] = useState('')
  const [vehicleRegistration, setVehicleRegistration] = useState('')
  const addressLayerRef = useRef(null)

  // 챗봇 메시지 상태
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '안녕하세요! 에코픽입니다.\n헌옷 수거 관련 문의사항이 있으시면 편하게 연락주세요!'
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatMessagesEndRef = useRef(null)

  // Before/After 슬라이더 상태
  const [sliderPosition, setSliderPosition] = useState(50)
  const sliderRef = useRef(null)
  const isDragging = useRef(false)

  // 계산기 상태 - 기본 품목
  const [clothesKg, setClothesKg] = useState(0)
  const [shoesKg, setShoesKg] = useState(0)
  const [bagsKg, setBagsKg] = useState(0)

  // 계산기 상태 - 추가 품목
  const [panKg, setPanKg] = useState(0)              // 후라이팬/냄비 (kg)
  const [computerCount, setComputerCount] = useState(0)  // 컴퓨터/노트북 (대)
  const [monitorCount, setMonitorCount] = useState(0)    // 모니터 (대)
  const [phoneCount, setPhoneCount] = useState(0)        // 폐휴대폰 (개)
  const [duckdownKg, setDuckdownKg] = useState(0)        // 덕다운 이불 (kg)
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false)  // 추가 품목 펼침 상태
  const [isGuideOpen, setIsGuideOpen] = useState(false)  // 20kg 가이드 펼침 상태
  const [isCalculatorPanelOpen, setIsCalculatorPanelOpen] = useState(false)  // 계산기 패널 펼침 상태

  // 지역 검증 상태
  const [regionStatus, setRegionStatus] = useState(null) // 'available' | 'unavailable' | null

  // 가능 지역 목록
  const availableRegions = [
    '부천', '안산', '오류동', '개봉동', '고척동', '항동', '궁동', '수궁동',
    '부개동', '삼산동', '은계'
  ]
  const excludedRegions = ['거북섬', '대부도']

  // 지역 검증 함수
  const checkRegion = (addr) => {
    if (!addr) {
      setRegionStatus(null)
      return
    }
    // 제외 지역 체크
    const isExcluded = excludedRegions.some(region => addr.includes(region))
    if (isExcluded) {
      setRegionStatus('unavailable')
      return
    }
    // 가능 지역 체크
    const isAvailable = availableRegions.some(region => addr.includes(region))
    setRegionStatus(isAvailable ? 'available' : 'unavailable')
  }

  // 예상 정산 금액 계산
  const basicTotalKg = clothesKg + shoesKg + bagsKg  // 기본 품목 합산
  const basicPrice = (clothesKg * 350) + (shoesKg * 400) + (bagsKg * 700)  // 기본 품목 정산
  const additionalPrice = (panKg * 200) + (computerCount * 3000) + (monitorCount * 1000) + (phoneCount * 500) + (duckdownKg * 1000)  // 추가 품목 정산

  // 무상 수거 여부 (기본 품목 20kg 이하)
  const isFreePickup = basicTotalKg > 0 && basicTotalKg <= 20

  // 최종 정산 금액 (무상 수거 시 기본품목 0원)
  const estimatedPrice = isFreePickup ? additionalPrice : basicPrice + additionalPrice

  // 신청 가능 여부 (기본 품목 1kg 이상 필수)
  const isMinimumMet = basicTotalKg > 0

  // 최대값 도달 체크
  const isMaxReached = clothesKg >= 500 || shoesKg >= 500 || bagsKg >= 500 ||
    panKg >= 500 || computerCount >= 100 || monitorCount >= 100 || phoneCount >= 100 || duckdownKg >= 300

  // 일요일 체크 함수
  const isSunday = (dateString) => {
    const date = new Date(dateString)
    return date.getDay() === 0
  }

  // 날짜 변경 핸들러 (일요일 휴무)
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    if (isSunday(selectedDate)) {
      alert('일요일은 휴무일입니다. 다른 날짜를 선택해주세요.')
      return
    }
    setPreferredDate(selectedDate)
    if (formErrors.preferredDate) {
      setFormErrors(prev => ({ ...prev, preferredDate: '' }))
    }
  }

  // 연락처 유효성 검증
  const validatePhone = (value) => {
    // 정규식: 01012345678 또는 010-1234-5678 형식 허용
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/

    if (!value) {
      setPhoneError('')
      return false
    }

    if (!phoneRegex.test(value)) {
      setPhoneError('올바른 연락처 형식이 아닙니다. (예: 01012345678 또는 010-1234-5678)')
      return false
    }

    setPhoneError('')
    return true
  }

  // 연락처 입력 핸들러
  const handlePhoneChange = (e) => {
    const value = e.target.value
    setPhone(value)
    validatePhone(value)
    if (formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: '' }))
    }
  }

  // 폼 전체 유효성 검증
  const validateForm = () => {
    const errors = {
      pickupType: '',
      address: '',
      phone: '',
      preferredDate: ''
    }
    let isValid = true

    // 유형 검증
    if (!pickupType) {
      errors.pickupType = '수거 유형을 선택해주세요.'
      isValid = false
    }

    // 주소 검증
    if (!address) {
      errors.address = '방문지 주소를 입력해주세요.'
      isValid = false
    }

    // 연락처 검증
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
    if (!phone) {
      errors.phone = '연락처를 입력해주세요.'
      isValid = false
    } else if (!phoneRegex.test(phone)) {
      errors.phone = '올바른 연락처 형식이 아닙니다.'
      isValid = false
    }

    // 희망 날짜 검증
    if (!preferredDate) {
      errors.preferredDate = '희망 날짜를 선택해주세요.'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwe0kebW-bhj-VksubN6YZ2oc14UFNb5a82yxr_RV6QyUCZ2jBd6tYErbpPDXXFPkfv/exec'

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 폼 유효성 검증
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const formData = {
      pickupType: pickupType === 'visit' ? '대면 수거' : '비대면 수거',
      address,
      addressDetail,
      phone,
      clothesKg: `${clothesKg}KG`,
      shoesKg: `${shoesKg}KG`,
      bagsKg: `${bagsKg}KG`,
      panKg: `${panKg}KG`,
      computerCount: `${computerCount}대`,
      monitorCount: `${monitorCount}대`,
      phoneCount: `${phoneCount}개`,
      duckdownKg: `${duckdownKg}KG`,
      basicTotalKg: `${basicTotalKg}KG`,
      pickupFeeType: isFreePickup ? '무상수거' : '유상수거',
      basicPrice: `${basicPrice.toLocaleString()}원`,
      additionalPrice: `${additionalPrice.toLocaleString()}원`,
      estimatedPrice: `${estimatedPrice.toLocaleString()}원`,
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
    setPhoneError('')
    setFormErrors({
      pickupType: '',
      address: '',
      phone: '',
      preferredDate: ''
    })
    setPreferredDate('')
    setPreferredTime('')
    setEntrancePassword('')
    setVehicleRegistration('')
    setClothesKg(0)
    setShoesKg(0)
    setBagsKg(0)
    setPanKg(0)
    setComputerCount(0)
    setMonitorCount(0)
    setPhoneCount(0)
    setDuckdownKg(0)
    setIsAdditionalOpen(false)
    setIsGuideOpen(false)
    setIsCalculatorPanelOpen(false)
    setRegionStatus(null)
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
          checkRegion(fullAddress)
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

  // Before/After 슬라이더 핸들러
  const handleSliderMouseDown = () => {
    isDragging.current = true
  }

  const handleSliderMove = (e) => {
    if (!isDragging.current || !sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    const position = ((clientX - rect.left) / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, position)))
  }

  // Before/After 슬라이더 이벤트 리스너
  useEffect(() => {
    const handleMouseUp = () => { isDragging.current = false }
    const handleMouseMove = (e) => handleSliderMove(e)

    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchend', handleMouseUp)
    window.addEventListener('touchmove', handleMouseMove)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
    }
  }, [])

  // 자동 슬라이더 시연 애니메이션 (페이지 로드 시 1회)
  useEffect(() => {
    const demonstrateSlider = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5초 대기

      // 50% → 25%
      const animateToPosition = (targetPosition, duration) => {
        return new Promise(resolve => {
          const startPosition = sliderPosition
          const startTime = Date.now()

          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic

            const currentPosition = startPosition + (targetPosition - startPosition) * easeProgress
            setSliderPosition(currentPosition)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              resolve()
            }
          }

          requestAnimationFrame(animate)
        })
      }

      await animateToPosition(25, 800)  // 25%로 이동
      await new Promise(resolve => setTimeout(resolve, 300))  // 잠깐 대기
      await animateToPosition(75, 1200) // 75%로 이동
      await new Promise(resolve => setTimeout(resolve, 300))  // 잠깐 대기
      await animateToPosition(50, 800)  // 다시 50%로 복귀
    }

    demonstrateSlider()
  }, []) // 마운트 시 1회만 실행

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

  // 챗봇 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: chatInput
    }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')

    // 자동 응답 (500ms 딜레이)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: '현재 AI 챗봇 상담 서비스는 준비 중입니다. 최대한 빠른 시일 내에 준비하겠습니다.\n\n아래 "수거 신청하기" 버튼을 눌러 바로 신청하시거나, 전화/이메일로 문의해주세요!'
      }
      setChatMessages(prev => [...prev, botResponse])
    }, 500)
  }

  // 챗봇 메시지 스크롤
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // 카운터 애니메이션
  const stat1 = useCountUp(127849, 2500)
  const stat2 = useCountUp(32451, 2500)
  const stat3 = useCountUp(89, 2000)

  // 섹션 애니메이션
  const heroAnim = useScrollAnimation()
  const serviceAnim = useScrollAnimation()
  const processAnim = useScrollAnimation()
  const environmentAnim = useScrollAnimation()
  const reviewAnim = useScrollAnimation()
  const faqAnim = useScrollAnimation()

  // FAQ 카테고리, 검색, 페이지네이션 상태
  const [faqCategory, setFaqCategory] = useState('all')
  const [faqSearch, setFaqSearch] = useState('')
  const [faqPage, setFaqPage] = useState(1)
  const faqPerPage = 5

  const faqCategories = [
    { id: 'all', name: '전체' },
    { id: 'reservation', name: '예약/상담' },
    { id: 'region', name: '수거 지역/기준' },
    { id: 'possible', name: '수거 가능 품목' },
    { id: 'impossible', name: '수거 불가 품목' }
  ]

  const faqs = [
    // 예약/상담
    {
      category: 'reservation',
      question: "전화 상담이 가능한가요?",
      answer: "네, 가능합니다. 예약 문의 외 일반 전화 상담은 오전 7시부터 오후 7시까지 운영됩니다."
    },
    {
      category: 'reservation',
      question: "당일 방문 수거가 가능한가요?",
      answer: "에코픽은 예약제로 운영되며, 최소 하루 전 예약이 필요합니다."
    },
    {
      category: 'reservation',
      question: "방문 수거 가능 시간은 어떻게 되나요?",
      answer: "방문 수거는 오전 7시부터 오후 4시까지 가능합니다."
    },
    {
      category: 'reservation',
      question: "비대면 수거 신청이 가능한가요?",
      answer: "네, 가능합니다. 전날 저녁에 문 앞에 놓아주시고, 사진을 찍어 전송해 주세요. 수거 후 저울로 계량한 사진을 보내드리고, 정산 금액을 계좌로 송금해 드립니다."
    },
    // 수거 지역/기준
    {
      category: 'region',
      question: "서비스 가능 지역은 어디인가요?",
      answer: "현재 방문 수거 가능 지역은 부천 전지역, 안산 전지역(거북섬·대부도 제외), 서울(오류동, 개봉동, 고척동, 항동, 궁동, 수궁동), 인천 부평구(부개동, 삼산동), 시흥 은계지구입니다."
    },
    {
      category: 'region',
      question: "방문 수거 신청 기준이 있나요?",
      answer: "네, 기본 품목(헌옷, 신발, 가방) 기준 20KG 이상부터 방문 수거가 가능합니다."
    },
    {
      category: 'region',
      question: "헌옷 20KG은 대략 어느 정도의 양인가요?",
      answer: "50L 종량제 봉투 약 4개, 또는 75L 봉투 2~3개 분량이 대략 20KG 전후입니다."
    },
    {
      category: 'region',
      question: "엘리베이터가 없는 곳도 수거가 가능한가요?",
      answer: "네, 가능합니다. 다만 양이 많을 경우 1층에 미리 내려주시거나, 수거 시 함께 내려주셔야 합니다."
    },
    // 수거 가능 품목
    {
      category: 'possible',
      question: "기본 수거 품목은 무엇인가요?",
      answer: "헌옷, 신발, 가방이 기본 수거 품목입니다."
    },
    {
      category: 'possible',
      question: "모자, 스카프, 벨트 등 잡화류도 수거되나요?",
      answer: "네, 가능합니다. 모자, 목도리, 스카프, 벨트, 선글라스, 장갑, 양말, 속옷 등 착용 가능한 모든 잡화 품목을 수거합니다."
    },
    {
      category: 'possible',
      question: "기본 품목 외에 추가로 수거 가능한 품목이 있나요?",
      answer: "네, 기본 품목 20KG 이상일 때 함께 수거 가능합니다: 얇은 이불, 커튼, 카펫, 소형 인형(30cm 이하), 여행용 캐리어(바퀴 정상), 소형 가전류(프린터/안마기 제외), 컴퓨터 본체/노트북/모니터, 헌책, 만화책, CD, LP판, 냄비, 후라이팬, 스텐 제품, 음료수캔, 전선류"
    },
    {
      category: 'possible',
      question: "이불도 수거되나요?",
      answer: "얇은 이불만 무상 수거 가능하며, 솜이 들어간 이불은 수거 불가합니다."
    },
    {
      category: 'possible',
      question: "인형도 수거되나요?",
      answer: "30cm 이하 소형 인형에 한해 무상 수거 가능합니다."
    },
    {
      category: 'possible',
      question: "헌책만 수거 신청이 가능한가요?",
      answer: "아니요, 기본 품목(헌옷, 신발, 가방)이 20KG 이상 있어야 헌책도 함께 수거 가능합니다. 헌책은 노끈으로 묶거나 라면박스 크기 박스에 포장해 주세요. 박스당 20KG 초과 시 수거 거부될 수 있으며, 엘리베이터 없는 경우 1층으로 내려주셔야 합니다."
    },
    // 수거 불가 품목
    {
      category: 'impossible',
      question: "방문 수거가 불가한 품목은 무엇인가요?",
      answer: "솜이불, 솜베개, 목쿠션, 라텍스, 토퍼, 바닥패드, 전기장판, 바퀴 달린 신발, 겨울 털신발, 패딩부츠, 기모신발, 곰팡이가 핀 의류/신발/가방, 심한 얼룩/찢어진 의류, 동물 털이 심하게 묻은 의류, 경화되어 가루가 떨어지는 레자 제품은 수거 불가합니다."
    },
    {
      category: 'impossible',
      question: "카시트도 수거되나요?",
      answer: "아니요, 카시트는 수거 불가 품목입니다."
    },
    {
      category: 'impossible',
      question: "아이들 장난감도 수거되나요?",
      answer: "아니요, 장난감은 수거 불가 품목입니다."
    }
  ]

  // 필터링된 FAQ (카테고리 + 검색어)
  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = faqCategory === 'all' || faq.category === faqCategory
    const searchLower = faqSearch.toLowerCase().trim()
    const matchSearch = !searchLower ||
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower)
    return matchCategory && matchSearch
  })

  // 페이지네이션 계산
  const totalFaqPages = Math.ceil(filteredFaqs.length / faqPerPage)
  const paginatedFaqs = filteredFaqs.slice((faqPage - 1) * faqPerPage, faqPage * faqPerPage)

  // 카테고리 변경 시 페이지 리셋
  const handleCategoryChange = (category) => {
    setFaqCategory(category)
    setFaqPage(1)
    setOpenFaq(null)
  }

  // 검색어 변경 시 페이지 리셋
  const handleSearchChange = (e) => {
    setFaqSearch(e.target.value)
    setFaqPage(1)
    setOpenFaq(null)
  }

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
            <Link to="/guide">수거 가이드</Link>
            <a href="#faq">FAQ</a>
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
            <div
              className="before-after-slider"
              ref={sliderRef}
              onMouseDown={handleSliderMouseDown}
              onTouchStart={handleSliderMouseDown}
            >
              {/* After 이미지 (깨끗한 상태) - 배경 */}
              <img
                src="https://img.kr.gcp-karroter.net/business-profile/bizPlatform/profile/100580618/1765944464723/RklMRV9LSVRfOTA5ODQ0OTY1ODY5NjEwNw==.jpeg?q=95&s=720x720&t=inside"
                alt="수거 후 깨끗한 공간"
                className="slider-img"
              />

              {/* Before 이미지 (더러운 상태) - 클립 */}
              <div
                className="slider-before-wrap"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src="https://img.kr.gcp-karroter.net/business-profile/bizPlatform/profile/100580618/1765944464651/RklMRV9LSVRfNzc3ODM2NjE4NTQ2NzIyMQ==.jpeg?q=95&s=720x720&t=inside"
                  alt="수거 전 어지러운 공간"
                  className="slider-img slider-before"
                />
              </div>

              {/* 슬라이더 핸들 */}
              <div
                className="slider-handle"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="handle-line"></div>
                <div className="handle-circle">
                  <span>&#x2194;</span>
                </div>
                <div className="handle-line"></div>
              </div>

              {/* 라벨 - 슬라이더 위치에 따라 동적으로 표시 */}
              <span
                className="slider-label slider-label-before"
                style={{ opacity: sliderPosition > 15 ? 1 : 0 }}
              >
                수거 전
              </span>
              <span
                className="slider-label slider-label-after"
                style={{ opacity: sliderPosition < 85 ? 1 : 0 }}
              >
                수거 후
              </span>
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

      {/* Environment Impact Section */}
      <section id="environment" className="environment" ref={environmentAnim.ref}>
        <div className="container">
          <p className={`section-label fade-up ${environmentAnim.isVisible ? 'visible' : ''}`}>환경 영향</p>
          <h2 className={`section-title fade-up delay-1 ${environmentAnim.isVisible ? 'visible' : ''}`}>
            에코픽과 함께한<br />
            환경 보호 성과
          </h2>
          <div className="environment-grid">
            {[
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/></svg>,
                value: '64톤',
                label: '탄소 절감량',
                detail: '승용차 약 27대가 1년간 배출하는 CO2와 동일'
              },
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
                value: '2,560만L',
                label: '물 절약량',
                detail: '수영장 약 10개를 채울 수 있는 양'
              },
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
                value: '127,849벌',
                label: '수거된 의류',
                detail: '매립되었을 옷들이 새 생명을 얻었습니다'
              },
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
                value: '32,451명',
                label: '참여 고객',
                detail: '함께 환경을 지키는 에코픽 가족'
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`environment-card fade-up delay-${index + 2} ${environmentAnim.isVisible ? 'visible' : ''}`}
              >
                <div className="environment-icon">{item.icon}</div>
                <div className="environment-value">{item.value}</div>
                <div className="environment-label">{item.label}</div>
                <p className="environment-detail">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section id="review" className="review" ref={reviewAnim.ref}>
        <div className="container review-header-container">
          <p className={`section-label fade-up ${reviewAnim.isVisible ? 'visible' : ''}`}>고객 후기</p>
          <h2 className={`section-title fade-up delay-1 ${reviewAnim.isVisible ? 'visible' : ''}`}>
            에코픽을 이용한<br />
            고객님들의 이야기
          </h2>
        </div>

        {/* 마키 슬라이드 - 첫 번째 줄 (왼쪽으로) */}
        <div className="review-marquee-wrapper">
          <div className="review-marquee-fade review-marquee-fade-left"></div>
          <div className="review-marquee-fade review-marquee-fade-right"></div>

          <div className="review-marquee review-marquee-left">
            <div className="review-marquee-track">
              {[
                {
                  name: '김지은',
                  location: '서울 강남구',
                  rating: 5,
                  text: '이사하면서 안 입는 옷들이 많았는데, 에코픽 덕분에 깔끔하게 정리하고 용돈까지 받았어요!',
                  date: '2024.12.15'
                },
                {
                  name: '박민수',
                  location: '경기 성남시',
                  rating: 5,
                  text: '환경도 지키고 돈도 벌 수 있어서 일석이조예요. 수거 기사님도 친절하시고, 정산도 빨라서 만족합니다.',
                  date: '2024.12.10'
                },
                {
                  name: '이수진',
                  location: '인천 연수구',
                  rating: 5,
                  text: '옷장에 쌓여있던 옷들 정리하니 너무 시원해요. 다음에도 또 이용할게요!',
                  date: '2024.12.08'
                },
                {
                  name: '최영호',
                  location: '서울 마포구',
                  rating: 4,
                  text: '아이 옷이 계속 작아져서 고민이었는데, 에코픽으로 한번에 해결했어요.',
                  date: '2024.12.05'
                }
              ].concat([
                {
                  name: '김지은',
                  location: '서울 강남구',
                  rating: 5,
                  text: '이사하면서 안 입는 옷들이 많았는데, 에코픽 덕분에 깔끔하게 정리하고 용돈까지 받았어요!',
                  date: '2024.12.15'
                },
                {
                  name: '박민수',
                  location: '경기 성남시',
                  rating: 5,
                  text: '환경도 지키고 돈도 벌 수 있어서 일석이조예요. 수거 기사님도 친절하시고, 정산도 빨라서 만족합니다.',
                  date: '2024.12.10'
                },
                {
                  name: '이수진',
                  location: '인천 연수구',
                  rating: 5,
                  text: '옷장에 쌓여있던 옷들 정리하니 너무 시원해요. 다음에도 또 이용할게요!',
                  date: '2024.12.08'
                },
                {
                  name: '최영호',
                  location: '서울 마포구',
                  rating: 4,
                  text: '아이 옷이 계속 작아져서 고민이었는데, 에코픽으로 한번에 해결했어요.',
                  date: '2024.12.05'
                }
              ]).map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="review-info">
                      <span className="review-name">{review.name}</span>
                      <span className="review-location">{review.location}</span>
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="review-text">"{review.text}"</p>
                  <span className="review-date">{review.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 마키 슬라이드 - 두 번째 줄 (오른쪽으로) */}
          <div className="review-marquee review-marquee-right">
            <div className="review-marquee-track">
              {[
                {
                  name: '정미영',
                  location: '경기 수원시',
                  rating: 5,
                  text: '카카오톡으로 진행 상황 알려주셔서 안심이 됐어요. 정산 금액도 생각보다 많이 나왔습니다!',
                  date: '2024.11.28'
                },
                {
                  name: '한상우',
                  location: '서울 송파구',
                  rating: 5,
                  text: '버리기엔 아깝고 팔기엔 귀찮았던 옷들, 에코픽이 다 가져가니 속 시원해요.',
                  date: '2024.11.25'
                },
                {
                  name: '윤서연',
                  location: '경기 고양시',
                  rating: 5,
                  text: '시간 약속도 잘 지켜주시고 친절하게 응대해주셔서 좋았어요. 강력 추천합니다!',
                  date: '2024.11.20'
                },
                {
                  name: '장현우',
                  location: '서울 영등포구',
                  rating: 5,
                  text: '묵혀둔 옷들 정리하고 환경도 지키고 돈도 받고! 완전 좋아요.',
                  date: '2024.11.15'
                }
              ].concat([
                {
                  name: '정미영',
                  location: '경기 수원시',
                  rating: 5,
                  text: '카카오톡으로 진행 상황 알려주셔서 안심이 됐어요. 정산 금액도 생각보다 많이 나왔습니다!',
                  date: '2024.11.28'
                },
                {
                  name: '한상우',
                  location: '서울 송파구',
                  rating: 5,
                  text: '버리기엔 아깝고 팔기엔 귀찮았던 옷들, 에코픽이 다 가져가니 속 시원해요.',
                  date: '2024.11.25'
                },
                {
                  name: '윤서연',
                  location: '경기 고양시',
                  rating: 5,
                  text: '시간 약속도 잘 지켜주시고 친절하게 응대해주셔서 좋았어요. 강력 추천합니다!',
                  date: '2024.11.20'
                },
                {
                  name: '장현우',
                  location: '서울 영등포구',
                  rating: 5,
                  text: '묵혀둔 옷들 정리하고 환경도 지키고 돈도 받고! 완전 좋아요.',
                  date: '2024.11.15'
                }
              ]).map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="review-info">
                      <span className="review-name">{review.name}</span>
                      <span className="review-location">{review.location}</span>
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="review-text">"{review.text}"</p>
                  <span className="review-date">{review.date}</span>
                </div>
              ))}
            </div>
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
                <div className="kakao-notice">
                  카카오톡으로 발송된 [담당 기사 배정] 버튼을 클릭해 주세요.
                </div>
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
                <label className="form-label">유형 <span className="required">*</span></label>
                <div className="form-radio-group">
                  <label className={`form-radio ${pickupType === 'visit' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="pickupType"
                      value="visit"
                      checked={pickupType === 'visit'}
                      onChange={(e) => {
                        setPickupType(e.target.value)
                        if (formErrors.pickupType) {
                          setFormErrors(prev => ({ ...prev, pickupType: '' }))
                        }
                      }}
                    />
                    <span className="radio-label">대면 수거</span>
                  </label>
                  <label className={`form-radio ${pickupType === 'contactless' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="pickupType"
                      value="contactless"
                      checked={pickupType === 'contactless'}
                      onChange={(e) => {
                        setPickupType(e.target.value)
                        if (formErrors.pickupType) {
                          setFormErrors(prev => ({ ...prev, pickupType: '' }))
                        }
                      }}
                    />
                    <span className="radio-label">비대면 수거</span>
                  </label>
                </div>
                {formErrors.pickupType && (
                  <div className="field-error">
                    <span className="error-icon">!</span>
                    {formErrors.pickupType}
                  </div>
                )}
              </div>

              {/* 방문지 주소 */}
              <div className="form-group">
                <label className="form-label">방문지 주소 <span className="required">*</span></label>
                <div className="address-input-wrapper">
                  <input
                    type="text"
                    placeholder="주소 검색 (클릭)"
                    className={`form-input ${formErrors.address && !address ? 'form-input-error' : ''}`}
                    value={address}
                    onClick={() => {
                      openAddressSearch()
                      if (formErrors.address) {
                        setFormErrors(prev => ({ ...prev, address: '' }))
                      }
                    }}
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
                {regionStatus === 'available' && (
                  <div className="region-message region-available">
                    <span className="region-icon">✓</span>
                    수거 가능 지역입니다
                  </div>
                )}
                {regionStatus === 'unavailable' && (
                  <div className="region-message region-unavailable">
                    <span className="region-icon">✕</span>
                    현재 수거 불가 지역입니다 (부천, 안산, 서울 일부, 인천 부평구, 시흥 은계 지역만 가능)
                  </div>
                )}
                {formErrors.address && !address && (
                  <div className="field-error">
                    <span className="error-icon">!</span>
                    {formErrors.address}
                  </div>
                )}
              </div>

              {/* 연락처 */}
              <div className="form-group">
                <label className="form-label">연락처 <span className="required">*</span></label>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  className={`form-input ${(phoneError || formErrors.phone) ? 'form-input-error' : ''}`}
                  value={phone}
                  onChange={handlePhoneChange}
                />
                {(phoneError || formErrors.phone) && (
                  <div className="field-error">
                    <span className="error-icon">!</span>
                    {phoneError || formErrors.phone}
                  </div>
                )}
              </div>

              {/* 희망 날짜 및 시간 */}
              <div className="form-group">
                <label className="form-label">희망 날짜 및 시간 <span className="required">*</span></label>
                <div className="form-row form-row-datetime">
                  <input
                    type="date"
                    className={`form-input ${formErrors.preferredDate && !preferredDate ? 'form-input-error' : ''}`}
                    value={preferredDate}
                    onChange={handleDateChange}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                  <select
                    className="form-input"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                  >
                    <option value="">시간대 선택</option>
                    <option value="오전 (07:00-10:00)">오전 (07:00-10:00)</option>
                    <option value="오전 (10:00-12:00)">오전 (10:00-12:00)</option>
                    <option value="오후 (12:00-14:00)">오후 (12:00-14:00)</option>
                    <option value="오후 (14:00-16:00)">오후 (14:00-16:00)</option>
                  </select>
                </div>
                {formErrors.preferredDate && !preferredDate && (
                  <div className="field-error">
                    <span className="error-icon">!</span>
                    {formErrors.preferredDate}
                  </div>
                )}
                <div className="time-notice">
                  당일 수거량과 교통 상황에 따라 희망 시간에 수거가 불가능할 수 있습니다.
                  비대면 수거가 가능하오니, 문 앞에 놓아주시면 최대한 빠르게 수거해드리겠습니다.
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

              {/* 수거량 계산기 아코디언 */}
              <div className="calculator-accordion">
                <div
                  className={`calculator-accordion-header ${isCalculatorPanelOpen ? 'open' : ''}`}
                  onClick={() => setIsCalculatorPanelOpen(!isCalculatorPanelOpen)}
                >
                  <div className="calculator-accordion-title">
                    <span className="calc-accordion-icon">🧮</span>
                    <span>예상 정산 금액 계산</span>
                  </div>
                  <div className="calculator-accordion-right">
                    <span className="calc-accordion-price">{estimatedPrice.toLocaleString()}원</span>
                    <span className="calc-accordion-toggle">{isCalculatorPanelOpen ? '−' : '+'}</span>
                  </div>
                </div>

                <div className={`calculator-accordion-content ${isCalculatorPanelOpen ? 'open' : ''}`}>
                  {/* 20kg 가이드 */}
                  <div className="kg-guide-wrapper">
                    <button
                      type="button"
                      className={`kg-guide-toggle ${isGuideOpen ? 'open' : ''}`}
                      onClick={() => setIsGuideOpen(!isGuideOpen)}
                    >
                      <span className="guide-icon">💡</span>
                      <span>20kg이 얼마나 될까요?</span>
                      <span className={`guide-arrow ${isGuideOpen ? 'open' : ''}`}>▼</span>
                    </button>
                    <div className={`kg-guide-content ${isGuideOpen ? 'open' : ''}`}>
                      <div className="guide-image-wrap">
                        <img
                          src="https://img.kr.gcp-karroter.net/business-profile/bizPlatform/profile/100580618/1756421405553/YmM2MWRiNzBiZmQ2YTM0ZDhlYWNlNWFkMjZjMTFkNjRmODMzYWY1MzVkMjVkYThkNDliMjU4MmU2ZGRkNWNhMl8wLmpwZWc=.jpeg?q=95&s=1440x1440&t=inside"
                          alt="다이소 90L 재활용봉투"
                          className="guide-image"
                        />
                      </div>
                      <div className="guide-item">
                        <span className="guide-emoji">🛍️</span>
                        <span>다이소 90L 재활용봉투 <strong>3~4개</strong> ≈ 20kg</span>
                      </div>
                      <div className="guide-item">
                        <span className="guide-emoji">📦</span>
                        <span>김장용 비닐 <strong>3~4개</strong> ≈ 20kg</span>
                      </div>
                      <div className="guide-tip">
                        무게가 정확히 안 맞아도 괜찮아요!<br/>
                        연락 주시면 최대한 맞춰드립니다
                      </div>
                    </div>
                  </div>

                  <div className="calculator-section-label">기본 수거 품목 (필수)</div>

                  {/* 헌옷 */}
                  <div className="calculator-row">
                    <div className="calculator-label">
                      <span className="calc-icon">👕</span>
                      <span>헌옷</span>
                      <span className="calc-price">350원/KG</span>
                    </div>
                    <div className="calculator-control">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={clothesKg}
                        onChange={(e) => setClothesKg(Number(e.target.value))}
                        className="calc-slider"
                      />
                      <div className="calc-input-wrap">
                        <input
                          type="number"
                          min="0"
                          max="500"
                          value={clothesKg}
                          onChange={(e) => setClothesKg(Math.max(0, Math.min(500, Number(e.target.value) || 0)))}
                          className="calc-input"
                        />
                        <span className="calc-unit">KG</span>
                      </div>
                    </div>
                  </div>

                  {/* 신발 */}
                  <div className="calculator-row">
                    <div className="calculator-label">
                      <span className="calc-icon">👟</span>
                      <span>신발</span>
                      <span className="calc-price">400원/KG</span>
                    </div>
                    <div className="calculator-control">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={shoesKg}
                        onChange={(e) => setShoesKg(Number(e.target.value))}
                        className="calc-slider"
                      />
                      <div className="calc-input-wrap">
                        <input
                          type="number"
                          min="0"
                          max="500"
                          value={shoesKg}
                          onChange={(e) => setShoesKg(Math.max(0, Math.min(500, Number(e.target.value) || 0)))}
                          className="calc-input"
                        />
                        <span className="calc-unit">KG</span>
                      </div>
                    </div>
                  </div>

                  {/* 가방 */}
                  <div className="calculator-row">
                    <div className="calculator-label">
                      <span className="calc-icon">👜</span>
                      <span>가방</span>
                      <span className="calc-price">700원/KG</span>
                    </div>
                    <div className="calculator-control">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={bagsKg}
                        onChange={(e) => setBagsKg(Number(e.target.value))}
                        className="calc-slider"
                      />
                      <div className="calc-input-wrap">
                        <input
                          type="number"
                          min="0"
                          max="500"
                          value={bagsKg}
                          onChange={(e) => setBagsKg(Math.max(0, Math.min(500, Number(e.target.value) || 0)))}
                          className="calc-input"
                        />
                        <span className="calc-unit">KG</span>
                      </div>
                    </div>
                  </div>

                  {/* 신발/가방 분류 안내 */}
                  {(shoesKg > 0 || bagsKg > 0) && (
                    <div className="sorting-notice">
                      <span className="notice-icon">ℹ️</span>
                      신발 또는 가방은 별도로 분리해주셔야 합니다.
                    </div>
                  )}

                  {/* 추가 품목 아코디언 */}
                  <div className="additional-accordion">
                    <div
                      className={`additional-header ${isAdditionalOpen ? 'open' : ''}`}
                      onClick={() => setIsAdditionalOpen(!isAdditionalOpen)}
                    >
                      <div className="additional-header-content">
                        <span className="additional-title">추가 수거 품목 (선택)</span>
                        <span className="additional-items">🍳 냄비/후라이팬 · 💻 컴퓨터 · 🖥️ 모니터 · 📱 폐휴대폰 · 🛏️ 덕다운이불</span>
                      </div>
                      <span className="additional-toggle">{isAdditionalOpen ? '−' : '+'}</span>
                    </div>

                    <div className={`additional-content ${isAdditionalOpen ? 'open' : ''}`}>
                      {/* 후라이팬/냄비 */}
                      <div className="calculator-row">
                        <div className="calculator-label">
                          <span className="calc-icon">🍳</span>
                          <span>후라이팬/냄비</span>
                          <span className="calc-price">200원/KG</span>
                        </div>
                        <div className="calculator-control">
                          <input
                            type="range"
                            min="0"
                            max="500"
                            value={panKg}
                            onChange={(e) => setPanKg(Number(e.target.value))}
                            className="calc-slider"
                          />
                          <div className="calc-input-wrap">
                            <input
                              type="number"
                              min="0"
                              max="500"
                              value={panKg}
                              onChange={(e) => setPanKg(Math.max(0, Math.min(500, Number(e.target.value) || 0)))}
                              className="calc-input"
                            />
                            <span className="calc-unit">KG</span>
                          </div>
                        </div>
                      </div>

                      {/* 컴퓨터/노트북 */}
                      <div className="calculator-row">
                        <div className="calculator-label">
                          <span className="calc-icon">💻</span>
                          <span>컴퓨터/노트북</span>
                          <span className="calc-price">3,000원/대</span>
                        </div>
                        <div className="calculator-control">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={computerCount}
                            onChange={(e) => setComputerCount(Number(e.target.value))}
                            className="calc-slider"
                          />
                          <div className="calc-input-wrap">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={computerCount}
                              onChange={(e) => setComputerCount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                              className="calc-input"
                            />
                            <span className="calc-unit">대</span>
                          </div>
                        </div>
                      </div>

                      {/* 모니터 */}
                      <div className="calculator-row">
                        <div className="calculator-label">
                          <span className="calc-icon">🖥️</span>
                          <span>모니터</span>
                          <span className="calc-price">1,000원/대</span>
                        </div>
                        <div className="calculator-control">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={monitorCount}
                            onChange={(e) => setMonitorCount(Number(e.target.value))}
                            className="calc-slider"
                          />
                          <div className="calc-input-wrap">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={monitorCount}
                              onChange={(e) => setMonitorCount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                              className="calc-input"
                            />
                            <span className="calc-unit">대</span>
                          </div>
                        </div>
                      </div>

                      {/* 폐휴대폰 */}
                      <div className="calculator-row">
                        <div className="calculator-label">
                          <span className="calc-icon">📱</span>
                          <span>폐휴대폰</span>
                          <span className="calc-price">500원/개</span>
                        </div>
                        <div className="calculator-control">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={phoneCount}
                            onChange={(e) => setPhoneCount(Number(e.target.value))}
                            className="calc-slider"
                          />
                          <div className="calc-input-wrap">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={phoneCount}
                              onChange={(e) => setPhoneCount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                              className="calc-input"
                            />
                            <span className="calc-unit">개</span>
                          </div>
                        </div>
                      </div>

                      {/* 덕다운 이불 */}
                      <div className="calculator-row">
                        <div className="calculator-label">
                          <span className="calc-icon">🛏️</span>
                          <span>덕다운 이불</span>
                          <span className="calc-price">1,000원/KG</span>
                        </div>
                        <div className="calculator-control">
                          <input
                            type="range"
                            min="0"
                            max="300"
                            value={duckdownKg}
                            onChange={(e) => setDuckdownKg(Number(e.target.value))}
                            className="calc-slider"
                          />
                          <div className="calc-input-wrap">
                            <input
                              type="number"
                              min="0"
                              max="300"
                              value={duckdownKg}
                              onChange={(e) => setDuckdownKg(Math.max(0, Math.min(300, Number(e.target.value) || 0)))}
                              className="calc-input"
                            />
                            <span className="calc-unit">KG</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 총합 및 예상 정산 */}
                  <div className="calculator-summary">
                    <div className="summary-row">
                      <span>기본 품목 무게</span>
                      <span className="summary-value">{basicTotalKg} KG</span>
                    </div>
                    {isFreePickup ? (
                      <div className="summary-row free-pickup-row">
                        <span>기본 품목 정산</span>
                        <span className="summary-value free-text">무상 수거</span>
                      </div>
                    ) : basicTotalKg > 20 && (
                      <div className="summary-row">
                        <span>기본 품목 정산</span>
                        <span className="summary-value">{basicPrice.toLocaleString()}원</span>
                      </div>
                    )}
                    {additionalPrice > 0 && (
                      <div className="summary-row">
                        <span>추가 품목 정산</span>
                        <span className="summary-value">{additionalPrice.toLocaleString()}원</span>
                      </div>
                    )}
                    <div className="summary-row summary-price">
                      <span>예상 정산 금액</span>
                      <span className="summary-value">{estimatedPrice.toLocaleString()}원</span>
                    </div>
                  </div>

                  {/* 무상 수거 안내 */}
                  {isFreePickup && (
                    <div className="free-pickup-notice">
                      <span className="notice-icon">✓</span>
                      기본 품목 20kg 이하 무상 수거 대상입니다
                    </div>
                  )}

                  {/* 기본 품목 필수 안내 */}
                  {!isMinimumMet && (
                    <div className="minimum-warning">
                      <span className="warning-icon">⚠</span>
                      기본 품목(헌옷+신발+가방)을 1kg 이상 입력해주세요
                    </div>
                  )}

                  {/* 최대값 도달 안내 */}
                  {isMaxReached && (
                    <div className="max-reached-notice">
                      <span className="notice-icon">📞</span>
                      대량 수거는 010-8186-7982로 연락주세요
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-animated"
                disabled={isSubmitting || regionStatus === 'unavailable' || !isMinimumMet}
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

          {/* 검색 입력 */}
          <div className={`faq-search fade-up delay-2 ${faqAnim.isVisible ? 'visible' : ''}`}>
            <svg className="faq-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="faq-search-input"
              placeholder="궁금한 내용을 검색해보세요"
              value={faqSearch}
              onChange={handleSearchChange}
            />
            {faqSearch && (
              <button className="faq-search-clear" onClick={() => { setFaqSearch(''); setFaqPage(1); setOpenFaq(null); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* 카테고리 탭 */}
          <div className={`faq-tabs fade-up delay-2 ${faqAnim.isVisible ? 'visible' : ''}`}>
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                className={`faq-tab ${faqCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 검색 결과 없음 */}
          {filteredFaqs.length === 0 && (
            <div className="faq-no-results">
              <p>검색 결과가 없습니다.</p>
              <span>다른 검색어로 시도해보세요.</span>
            </div>
          )}

          <div className="faq-list">
            {paginatedFaqs.map((faq, index) => (
              <div
                key={`${faqCategory}-${faqPage}-${index}`}
                className={`faq-item fade-up ${faqAnim.isVisible ? 'visible' : ''} ${openFaq === index ? 'open' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
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

          {/* 페이지네이션 */}
          {totalFaqPages > 1 && (
            <div className={`faq-pagination fade-up ${faqAnim.isVisible ? 'visible' : ''}`}>
              <button
                className="faq-page-btn"
                onClick={() => setFaqPage(prev => Math.max(prev - 1, 1))}
                disabled={faqPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalFaqPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`faq-page-btn ${faqPage === page ? 'active' : ''}`}
                  onClick={() => { setFaqPage(page); setOpenFaq(null); }}
                >
                  {page}
                </button>
              ))}
              <button
                className="faq-page-btn"
                onClick={() => setFaqPage(prev => Math.min(prev + 1, totalFaqPages))}
                disabled={faqPage === totalFaqPages}
              >
                ›
              </button>
            </div>
          )}
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
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>서비스</h4>
                <button onClick={() => setIsModalOpen(true)} className="footer-link-btn">수거 신청</button>
                <Link to="/guide">수거 가이드</Link>
                <a href="#process">이용 방법</a>
                <a href="#faq">자주 묻는 질문</a>
              </div>
              <div className="footer-column">
                <h4>고객센터</h4>
                <a href="tel:010-8186-7982">010-8186-7982</a>
                <a href="mailto:scissorsin@naver.com">scissorsin@naver.com</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 헌옷마을 (에코픽). All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">이용약관</a>
              <a href="#">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Floating Button */}
      <div className="chatbot-container">
        <button
          className={`chatbot-button ${isChatOpen ? 'active' : ''}`}
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="채팅 상담"
        >
          {isChatOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )}
        </button>

        {/* Chat Window */}
        {isChatOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <span className="chatbot-title">에코픽 상담</span>
                <span className="chatbot-status">상담 가능</span>
              </div>
              <button
                className="chatbot-close"
                onClick={() => setIsChatOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`chatbot-message ${message.type}`}>
                  {message.type === 'bot' && <div className="message-avatar">🤖</div>}
                  <div className="message-content">
                    <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
                  </div>
                  {message.type === 'user' && <div className="message-avatar user-avatar">👤</div>}
                </div>
              ))}
              <div ref={chatMessagesEndRef} />
            </div>
            <div className="chatbot-input-wrapper">
              <form onSubmit={handleSendMessage} className="chatbot-input-form">
                <input
                  type="text"
                  className="chatbot-input"
                  placeholder="메시지를 입력하세요..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="chatbot-send-button" disabled={!chatInput.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            </div>
            <div className="chatbot-footer">
              <button
                className="chatbot-apply-button"
                onClick={() => {
                  setIsChatOpen(false)
                  setIsModalOpen(true)
                }}
              >
                수거 신청하기
              </button>
            </div>
          </div>
        )}
      </div>

    </>
  )
}

export default App
