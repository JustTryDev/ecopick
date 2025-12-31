import { useSearchParams } from 'react-router-dom'
import './Statement.css'

function Statement() {
  const [searchParams] = useSearchParams()

  // URL 파라미터에서 데이터 가져오기
  const customerName = searchParams.get('name') || '홍길동'
  const customerPhone = searchParams.get('phone') || '010-1234-5678'
  const customerAddress = searchParams.get('address') || '서울시 강남구 테헤란로 123'
  const pickupDate = searchParams.get('date') || new Date().toLocaleDateString('ko-KR')
  const totalWeight = searchParams.get('weight') || '15.5'
  const pricePerKg = searchParams.get('price') || '500'
  const totalAmount = searchParams.get('amount') || (parseFloat(totalWeight) * parseFloat(pricePerKg)).toLocaleString()
  const statementNo = searchParams.get('no') || `EP${Date.now().toString().slice(-8)}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="statement-page">
      <div className="statement-container">
        {/* 헤더 */}
        <header className="statement-header">
          <div className="statement-logo">
            <span className="logo-icon">♻</span>
            <span className="logo-text">에코픽</span>
          </div>
          <div className="statement-title">
            <h1>헌옷 수거 명세서</h1>
            <p className="statement-no">No. {statementNo}</p>
          </div>
        </header>

        {/* 고객 정보 */}
        <section className="statement-section">
          <h2 className="section-title">고객 정보</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">고객명</span>
              <span className="info-value">{customerName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">연락처</span>
              <span className="info-value">{customerPhone}</span>
            </div>
            <div className="info-item full-width">
              <span className="info-label">주소</span>
              <span className="info-value">{customerAddress}</span>
            </div>
          </div>
        </section>

        {/* 수거 정보 */}
        <section className="statement-section">
          <h2 className="section-title">수거 정보</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">수거일</span>
              <span className="info-value">{pickupDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">총 무게</span>
              <span className="info-value highlight">{totalWeight} kg</span>
            </div>
          </div>
        </section>

        {/* 정산 정보 */}
        <section className="statement-section">
          <h2 className="section-title">정산 내역</h2>
          <table className="statement-table">
            <thead>
              <tr>
                <th>항목</th>
                <th>무게</th>
                <th>단가</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>헌옷 수거</td>
                <td>{totalWeight} kg</td>
                <td>{parseInt(pricePerKg).toLocaleString()}원/kg</td>
                <td>{parseInt(totalAmount).toLocaleString()}원</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">총 정산 금액</td>
                <td className="total-amount">{parseInt(totalAmount).toLocaleString()}원</td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* 안내 문구 */}
        <section className="statement-notice">
          <p>• 정산 금액은 영업일 기준 3일 이내에 입금됩니다.</p>
          <p>• 수거된 의류는 상태에 따라 기부 또는 재활용됩니다.</p>
          <p>• 문의사항은 고객센터(1588-0000)로 연락해 주세요.</p>
        </section>

        {/* 푸터 */}
        <footer className="statement-footer">
          <div className="footer-info">
            <p>에코픽 | 사업자등록번호: 123-45-67890</p>
            <p>서울시 강남구 테헤란로 123 에코빌딩 5층</p>
            <p>고객센터: 1588-0000 | help@ecopick.kr</p>
          </div>
          <div className="footer-stamp">
            <div className="stamp">
              <span>에코픽</span>
              <span className="stamp-date">{pickupDate}</span>
            </div>
          </div>
        </footer>

        {/* 인쇄 버튼 (인쇄시 숨김) */}
        <button className="print-button" onClick={handlePrint}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          인쇄하기
        </button>
      </div>
    </div>
  )
}

export default Statement
