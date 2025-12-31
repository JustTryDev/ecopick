import { useState, useRef, useEffect } from 'react'
import './Chatbot.css'

// 환경변수에서 API 키 가져오기 (.env 파일에 설정 필요)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''

const SYSTEM_PROMPT = `당신은 '에코픽'의 친절한 고객 상담 챗봇입니다.

에코픽 서비스 정보:
- 에코픽은 헌옷 수거 서비스입니다
- 고객이 안 입는 옷을 수거하고, 무게에 따라 현금을 정산해 드립니다
- 옷이 많을수록 더 많은 금액을 받을 수 있습니다
- 최소 5벌 이상부터 수거 가능합니다
- 수거 방식: 방문 수거, 비대면 수거
- 정산은 영업일 기준 3일 이내 입금
- 수거된 옷은 상태에 따라 기부 또는 재활용됩니다
- 고객센터: 1588-0000, help@ecopick.kr

답변 지침:
- 짧고 친절하게 답변하세요 (2-3문장)
- 이모지를 적절히 사용하세요
- 수거 신청은 홈페이지의 "수거 신청하기" 버튼을 안내하세요
- 모르는 질문은 고객센터 연결을 안내하세요
- 사용자가 이미지 생성을 요청하면 "이미지를 생성하고 있습니다..."라고 먼저 안내하세요`

// 이미지 생성 키워드 감지
const isImageRequest = (text) => {
  const keywords = ['이미지 생성', '그림 그려', '이미지 만들어', '그림 만들어', '이미지를 생성', '그림을 그려', '사진 만들어', '이미지 그려', '그려줘', '만들어줘 이미지', 'generate image', 'create image', 'draw']
  return keywords.some(keyword => text.toLowerCase().includes(keyword))
}

// Gemini API로 이미지 생성
const generateImage = async (prompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      })
    }
  )

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  // 응답에서 이미지 데이터 추출
  const parts = data.candidates?.[0]?.content?.parts || []
  let imageData = null
  let textResponse = ''

  for (const part of parts) {
    if (part.inlineData) {
      imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
    }
    if (part.text) {
      textResponse = part.text
    }
  }

  return { imageData, textResponse }
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! 에코픽입니다 🌿\n무엇을 도와드릴까요?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    const userInput = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // 이미지 생성 요청인지 확인
      if (isImageRequest(userInput)) {
        // 이미지 생성 중 메시지 표시
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '이미지를 생성하고 있습니다... 🎨'
        }])

        const { imageData, textResponse } = await generateImage(userInput)

        // 생성 중 메시지를 결과로 교체
        setMessages(prev => {
          const newMessages = prev.slice(0, -1) // 마지막 "생성 중" 메시지 제거
          return [...newMessages, {
            role: 'assistant',
            content: textResponse || '이미지가 생성되었습니다! 🎨',
            image: imageData
          }]
        })
      } else {
        // 일반 텍스트 응답 (OpenAI)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages.slice(-10),
              userMessage
            ],
            max_tokens: 300,
            temperature: 0.7
          })
        })

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error.message)
        }

        const assistantMessage = {
          role: 'assistant',
          content: data.choices[0].message.content
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('챗봇 오류:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다, 일시적인 오류가 발생했습니다. 😅\n고객센터(1588-0000)로 문의해 주세요.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chatbot-wrapper">
      {/* 챗봇 토글 버튼 */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="챗봇 열기/닫기"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="chatbot-container">
          {/* 헤더 */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <span>♻</span>
              </div>
              <div>
                <h3>에코픽 상담봇</h3>
                <span className="chatbot-status">온라인</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="message-avatar">♻</div>
                )}
                <div className="message-bubble">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="생성된 이미지"
                      className="generated-image"
                    />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message assistant">
                <div className="message-avatar">♻</div>
                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="chatbot-send"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chatbot
