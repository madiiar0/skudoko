import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole, Send, Sparkles, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { askAICoach } from '../api/aiCoach'
import { useAuth } from '../hooks/useAuth'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Ask me for a hint, a strategy, or help understanding the current board.',
}

function getRecentHistory(messages) {
  return messages
    .filter(message => message.role === 'user' || message.role === 'assistant')
    .slice(-8)
    .map(message => ({
      role: message.role,
      content: message.content,
    }))
}

export default function AICoach({ gameContext }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isPro = !!user?.isPro
  const messageEndRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [isOpen, messages, isLoading])

  async function handleSend() {
    const message = input.trim()

    if (!message || isLoading || !isPro) {
      return
    }

    if (!gameContext) {
      setError('AI Coach needs an active Sudoku game context.')
      return
    }

    const nextMessages = [...messages, { role: 'user', content: message }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsLoading(true)

    try {
      const response = await askAICoach({
        message,
        gameContext,
        history: getRecentHistory(messages),
      })

      setMessages(current => [
        ...current,
        { role: 'assistant', content: response?.answer || 'I could not generate a useful response.' },
      ])
    } catch (sendError) {
      if (sendError.status === 403) {
        setError('AI Coach is available with Pro.')
      } else {
        setError(sendError.message || 'Unable to reach AI Coach.')
      }
      toast.error(sendError.message || 'Unable to reach AI Coach.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()
    handleSend()
  }

  return (
    <>
      <button
        type="button"
        className="ai-coach-fab"
        aria-label="Open AI Coach"
        onClick={() => setIsOpen(open => !open)}
      >
        <Sparkles size={21} />
      </button>

      {isOpen ? (
        <section className="ai-coach-panel" aria-label="AI Coach chat">
          <div className="ai-coach-header">
            <div>
              <Sparkles size={17} />
              <span>AI Coach</span>
            </div>
            <button type="button" aria-label="Close AI Coach" onClick={() => setIsOpen(false)}>
              <X size={17} />
            </button>
          </div>

          {!isPro ? (
            <div className="ai-coach-locked">
              <LockKeyhole size={28} />
              <h2>AI Coach is available with Pro.</h2>
              <p>
                Upgrade to Pro to get personalized Sudoku guidance based on your current board,
                notes, mistakes, and progress.
              </p>
              <button
                type="button"
                className="ai-coach-upgrade"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/upgrade')
                }}
              >
                Upgrade to Pro
              </button>
            </div>
          ) : (
            <>
              <div className="ai-coach-messages">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`ai-coach-message ai-coach-message-${message.role}`}
                  >
                    {message.content}
                  </div>
                ))}
                {isLoading ? <div className="ai-coach-message ai-coach-message-assistant">Thinking...</div> : null}
                <div ref={messageEndRef} />
              </div>

              {error ? <p className="ai-coach-error">{error}</p> : null}

              <div className="ai-coach-input-row">
                <textarea
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask for a hint..."
                  rows={2}
                  disabled={isLoading}
                />
                <button className="ai-coach-button" type="button" onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </section>
      ) : null}
    </>
  )
}
