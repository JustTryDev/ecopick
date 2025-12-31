/**
 * Store.jsx - 스토어 페이지 (수거한 옷 판매)
 *
 * 에코픽에서 수거한 중고 의류를 판매하는 페이지입니다.
 * 카테고리별 필터링, 정렬, 검색 기능을 제공합니다.
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Store.css'

// 샘플 상품 데이터 (실제 서비스에서는 서버에서 가져옴)
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
    isNew: true
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
    isNew: false
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
    isNew: true
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
    isNew: false
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
    isNew: true
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
    isNew: false
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
    isNew: false
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
    isNew: true
  }
]

// 카테고리 목록
const categories = [
  { id: 'all', name: '전체' },
  { id: 'outer', name: '아우터' },
  { id: 'top', name: '상의' },
  { id: 'bottom', name: '하의' },
  { id: 'dress', name: '원피스' }
]

// 정렬 옵션
const sortOptions = [
  { id: 'newest', name: '최신순' },
  { id: 'price-low', name: '낮은 가격순' },
  { id: 'price-high', name: '높은 가격순' },
  { id: 'discount', name: '할인율순' }
]

function Store() {
  // URL 파라미터 관리
  const [searchParams, setSearchParams] = useSearchParams()

  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  // 스크롤 감지 (네비게이션 스타일 변경용)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 카테고리 변경 시 URL 업데이트
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    if (categoryId === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', categoryId)
    }
    setSearchParams(searchParams)
  }

  // 상품 필터링 및 정렬
  const filteredProducts = sampleProducts
    // 카테고리 필터링
    .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
    // 검색어 필터링
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // 정렬
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'discount':
          const discountA = (a.originalPrice - a.price) / a.originalPrice
          const discountB = (b.originalPrice - b.price) / b.originalPrice
          return discountB - discountA
        case 'newest':
        default:
          return b.id - a.id
      }
    })

  // 할인율 계산
  const getDiscountRate = (original, current) => {
    return Math.round((1 - current / original) * 100)
  }

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

      {/* Store Header */}
      <section className="store-header">
        <div className="container">
          <h1 className="store-title">에코픽 스토어</h1>
          <p className="store-description">
            새 주인을 기다리는 옷들을 만나보세요.<br />
            모든 수익금은 환경 보호 활동에 사용됩니다.
          </p>
        </div>
      </section>

      {/* Store Content */}
      <section className="store-content">
        <div className="container">
          {/* Filters */}
          <div className="store-filters">
            {/* Category Filter */}
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Search and Sort */}
            <div className="filter-controls">
              <div className="search-box">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="상품명, 브랜드 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    {product.isNew && <span className="product-badge new">NEW</span>}
                    <span className="product-badge discount">-{getDiscountRate(product.originalPrice, product.price)}%</span>
                  </div>
                  <div className="product-info">
                    <span className="product-brand">{product.brand}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-meta">
                      <span className="product-size">{product.size}</span>
                      <span className="product-condition">상태 {product.condition}</span>
                    </div>
                    <div className="product-price">
                      <span className="current-price">{product.price.toLocaleString()}원</span>
                      <span className="original-price">{product.originalPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-products">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>검색 결과가 없습니다</p>
                <span>다른 검색어나 카테고리를 선택해 보세요</span>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="results-info">
            총 <strong>{filteredProducts.length}</strong>개의 상품
          </div>
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

export default Store
