/**
 * ProductDetail.jsx - 상품 상세 페이지
 *
 * 개별 상품의 상세 정보를 보여주는 페이지입니다.
 * 상품 이미지, 가격, 상태, 사이즈 등 상세 정보와 구매 기능을 제공합니다.
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './ProductDetail.css'

// 샘플 상품 데이터 (Store.jsx와 동일한 데이터)
const sampleProducts = [
  {
    id: 1,
    name: '빈티지 데님 자켓',
    price: 25000,
    originalPrice: 89000,
    category: 'outer',
    size: 'M',
    condition: 'A',
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=500&fit=crop&q=80',
    brand: 'ZARA',
    isNew: true,
    description: '클래식한 디자인의 빈티지 데님 자켓입니다. 약간의 워싱 처리로 자연스러운 빈티지 느낌을 연출합니다. 봄, 가을에 가볍게 걸치기 좋은 아이템입니다.',
    material: '면 100%',
    color: '인디고 블루',
    measurements: {
      shoulder: '44cm',
      chest: '108cm',
      length: '62cm',
      sleeve: '60cm'
    }
  },
  {
    id: 2,
    name: '화이트 코튼 셔츠',
    price: 15000,
    originalPrice: 45000,
    category: 'top',
    size: 'S',
    condition: 'A+',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&q=80',
    brand: 'UNIQLO',
    isNew: false,
    description: '깔끔한 화이트 코튼 셔츠입니다. 기본에 충실한 디자인으로 다양한 스타일링이 가능합니다. 출근룩부터 캐주얼룩까지 활용도가 높습니다.',
    material: '면 100%',
    color: '화이트',
    measurements: {
      shoulder: '38cm',
      chest: '96cm',
      length: '68cm',
      sleeve: '58cm'
    }
  },
  {
    id: 3,
    name: '블랙 슬랙스',
    price: 18000,
    originalPrice: 65000,
    category: 'bottom',
    size: 'L',
    condition: 'A',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop&q=80',
    brand: '8SECONDS',
    isNew: true,
    description: '슬림핏 블랙 슬랙스입니다. 구김이 적고 편안한 착용감을 제공합니다. 오피스룩에 필수 아이템입니다.',
    material: '폴리에스터 65%, 레이온 30%, 스판덱스 5%',
    color: '블랙',
    measurements: {
      waist: '84cm',
      hip: '102cm',
      length: '103cm',
      thigh: '58cm'
    }
  },
  {
    id: 4,
    name: '캐시미어 니트',
    price: 35000,
    originalPrice: 120000,
    category: 'top',
    size: 'M',
    condition: 'A+',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop&q=80',
    brand: 'COS',
    isNew: false,
    description: '부드러운 캐시미어 블렌드 니트입니다. 고급스러운 소재감과 심플한 디자인이 특징입니다. 겨울철 따뜻하게 입기 좋습니다.',
    material: '캐시미어 30%, 울 70%',
    color: '베이지',
    measurements: {
      shoulder: '42cm',
      chest: '104cm',
      length: '64cm',
      sleeve: '59cm'
    }
  },
  {
    id: 5,
    name: '롱 트렌치코트',
    price: 45000,
    originalPrice: 180000,
    category: 'outer',
    size: 'M',
    condition: 'A',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&q=80',
    brand: 'MANGO',
    isNew: true,
    description: '클래식한 롱 트렌치코트입니다. 허리 벨트로 실루엣을 조절할 수 있으며, 봄가을 시즌에 활용도가 높습니다.',
    material: '면 65%, 폴리에스터 35%',
    color: '카멜',
    measurements: {
      shoulder: '40cm',
      chest: '100cm',
      length: '110cm',
      sleeve: '60cm'
    }
  },
  {
    id: 6,
    name: '플리츠 미디스커트',
    price: 12000,
    originalPrice: 49000,
    category: 'bottom',
    size: 'S',
    condition: 'B+',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj5a?w=400&h=500&fit=crop&q=80',
    brand: 'H&M',
    isNew: false,
    description: '여성스러운 플리츠 미디스커트입니다. 잔잔한 플리츠가 움직일 때마다 우아하게 흔들립니다.',
    material: '폴리에스터 100%',
    color: '네이비',
    measurements: {
      waist: '66cm',
      hip: '90cm',
      length: '68cm'
    }
  },
  {
    id: 7,
    name: '스트라이프 원피스',
    price: 22000,
    originalPrice: 79000,
    category: 'dress',
    size: 'M',
    condition: 'A',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&q=80',
    brand: 'ZARA',
    isNew: false,
    description: '세로 스트라이프 패턴의 원피스입니다. 날씬해 보이는 효과가 있으며, 단독으로 또는 레이어드하여 입을 수 있습니다.',
    material: '비스코스 100%',
    color: '네이비/화이트',
    measurements: {
      shoulder: '36cm',
      chest: '92cm',
      length: '118cm',
      sleeve: '소매 없음'
    }
  },
  {
    id: 8,
    name: '울 블렌드 코트',
    price: 55000,
    originalPrice: 250000,
    category: 'outer',
    size: 'L',
    condition: 'A+',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop&q=80',
    brand: 'MASSIMO DUTTI',
    isNew: true,
    description: '고급스러운 울 블렌드 코트입니다. 클래식한 테일러링과 깔끔한 실루엣이 특징입니다. 겨울철 포멀한 자리에 어울립니다.',
    material: '울 60%, 폴리에스터 30%, 기타 10%',
    color: '차콜 그레이',
    measurements: {
      shoulder: '46cm',
      chest: '112cm',
      length: '105cm',
      sleeve: '62cm'
    }
  }
]

// 상태 설명
const conditionDescriptions = {
  'A+': '새 상품에 가까운 최상급 상태',
  'A': '약간의 착용감만 있는 우수한 상태',
  'B+': '눈에 띄지 않는 작은 사용감이 있는 양호한 상태',
  'B': '착용에 문제 없는 보통 상태'
}

function ProductDetail() {
  // URL에서 상품 ID 가져오기
  const { id } = useParams()
  const navigate = useNavigate()

  // 상태 관리
  const [product, setProduct] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [selectedTab, setSelectedTab] = useState('description')
  const [isWishlisted, setIsWishlisted] = useState(false)

  // 상품 데이터 로드
  useEffect(() => {
    const foundProduct = sampleProducts.find(p => p.id === parseInt(id))
    if (foundProduct) {
      setProduct(foundProduct)
    }
    window.scrollTo(0, 0)
  }, [id])

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 할인율 계산
  const getDiscountRate = (original, current) => {
    return Math.round((1 - current / original) * 100)
  }

  // 구매하기 핸들러
  const handlePurchase = () => {
    alert('구매 기능은 준비 중입니다.\n빠른 시일 내에 서비스를 제공하겠습니다!')
  }

  // 찜하기 토글
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  // 상품을 찾지 못한 경우
  if (!product) {
    return (
      <>
        <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
          <div className="nav-container">
            <Link to="/" className="logo">
              <span className="logo-icon">♻</span>
              <span className="logo-text">에코픽</span>
            </Link>
            <div className="nav-links">
              <Link to="/#service">서비스 소개</Link>
              <Link to="/store">스토어</Link>
              <Link to="/#faq">자주 묻는 질문</Link>
            </div>
            <Link to="/" className="nav-cta">수거 신청</Link>
          </div>
        </nav>
        <div className="not-found">
          <h2>상품을 찾을 수 없습니다</h2>
          <p>요청하신 상품이 존재하지 않거나 판매가 종료되었습니다.</p>
          <Link to="/store" className="btn btn-primary">스토어로 돌아가기</Link>
        </div>
      </>
    )
  }

  // 추천 상품 (같은 카테고리의 다른 상품)
  const relatedProducts = sampleProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

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
            <Link to="/store" className="active">스토어</Link>
            <Link to="/#faq">자주 묻는 질문</Link>
          </div>
          <Link to="/" className="nav-cta">수거 신청</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">홈</Link>
          <span className="separator">/</span>
          <Link to="/store">스토어</Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <section className="product-detail">
        <div className="container">
          <div className="product-detail-grid">
            {/* Product Image */}
            <div className="product-detail-image">
              <img src={product.image} alt={product.name} />
              {product.isNew && <span className="detail-badge new">NEW</span>}
              <span className="detail-badge discount">-{getDiscountRate(product.originalPrice, product.price)}%</span>
            </div>

            {/* Product Info */}
            <div className="product-detail-info">
              <span className="detail-brand">{product.brand}</span>
              <h1 className="detail-name">{product.name}</h1>

              <div className="detail-price">
                <span className="detail-current-price">{product.price.toLocaleString()}원</span>
                <span className="detail-original-price">{product.originalPrice.toLocaleString()}원</span>
                <span className="detail-discount-badge">-{getDiscountRate(product.originalPrice, product.price)}%</span>
              </div>

              <div className="detail-meta">
                <div className="meta-item">
                  <span className="meta-label">사이즈</span>
                  <span className="meta-value">{product.size}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">상태</span>
                  <span className="meta-value condition">
                    {product.condition}
                    <span className="condition-desc">{conditionDescriptions[product.condition]}</span>
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">컬러</span>
                  <span className="meta-value">{product.color}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">소재</span>
                  <span className="meta-value">{product.material}</span>
                </div>
              </div>

              <div className="detail-actions">
                <button className="btn btn-primary btn-purchase" onClick={handlePurchase}>
                  구매하기
                </button>
                <button
                  className={`btn btn-wishlist ${isWishlisted ? 'active' : ''}`}
                  onClick={toggleWishlist}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              <div className="detail-notice">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4M12 8h.01"></path>
                </svg>
                <span>모든 판매 수익금은 환경 보호 활동에 사용됩니다</span>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="product-tabs">
            <div className="tab-buttons">
              <button
                className={`tab-button ${selectedTab === 'description' ? 'active' : ''}`}
                onClick={() => setSelectedTab('description')}
              >
                상품 설명
              </button>
              <button
                className={`tab-button ${selectedTab === 'measurements' ? 'active' : ''}`}
                onClick={() => setSelectedTab('measurements')}
              >
                사이즈 정보
              </button>
              <button
                className={`tab-button ${selectedTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setSelectedTab('shipping')}
              >
                배송 안내
              </button>
            </div>

            <div className="tab-content">
              {selectedTab === 'description' && (
                <div className="tab-panel">
                  <p>{product.description}</p>
                </div>
              )}
              {selectedTab === 'measurements' && (
                <div className="tab-panel">
                  <table className="measurements-table">
                    <tbody>
                      {Object.entries(product.measurements).map(([key, value]) => (
                        <tr key={key}>
                          <th>{key === 'shoulder' ? '어깨' : key === 'chest' ? '가슴' : key === 'length' ? '총장' : key === 'sleeve' ? '소매' : key === 'waist' ? '허리' : key === 'hip' ? '엉덩이' : key === 'thigh' ? '허벅지' : key}</th>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="measurements-notice">* 측정 방법에 따라 1-3cm 오차가 있을 수 있습니다</p>
                </div>
              )}
              {selectedTab === 'shipping' && (
                <div className="tab-panel">
                  <ul className="shipping-info">
                    <li>배송비: 3,000원 (50,000원 이상 무료배송)</li>
                    <li>배송 기간: 결제 후 2-3일 이내 출고</li>
                    <li>교환/반품: 수령 후 7일 이내 가능</li>
                    <li>중고 상품 특성상 단순 변심 반품 시 왕복 배송비가 부과됩니다</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h2>이런 상품은 어떠세요?</h2>
              <div className="related-grid">
                {relatedProducts.map(relatedProduct => (
                  <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="product-card">
                    <div className="product-image">
                      <img src={relatedProduct.image} alt={relatedProduct.name} />
                      {relatedProduct.isNew && <span className="product-badge new">NEW</span>}
                      <span className="product-badge discount">-{getDiscountRate(relatedProduct.originalPrice, relatedProduct.price)}%</span>
                    </div>
                    <div className="product-info">
                      <span className="product-brand">{relatedProduct.brand}</span>
                      <h3 className="product-name">{relatedProduct.name}</h3>
                      <div className="product-price">
                        <span className="current-price">{relatedProduct.price.toLocaleString()}원</span>
                        <span className="original-price">{relatedProduct.originalPrice.toLocaleString()}원</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link to="/" className="logo">
                <span className="logo-icon">♻</span>
                <span className="logo-text">에코픽</span>
              </Link>
              <p className="footer-slogan">옷의 새로운 여정을 함께합니다</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>서비스</h4>
                <Link to="/">수거 신청</Link>
                <Link to="/store">스토어</Link>
                <Link to="/#faq">자주 묻는 질문</Link>
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

export default ProductDetail
