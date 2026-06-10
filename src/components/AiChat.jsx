/**
 * AI Chat — conversational interface powered by Google Gemini
 */

import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Send, Bot, User, Loader, Trash2, Key, Eye, EyeOff } from 'lucide-react';
import { sendMessageToAssistant } from '../utils/aiAssistant.js';
import { formatEmission } from '../utils/carbonCalc.js';

function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant';
  return (
    <div
      className={`chat-message ${isAssistant ? 'chat-message--ai' : 'chat-message--user'}`}
      role="article"
      aria-label={`${isAssistant ? 'EcoTrace AI' : 'You'}: ${message.content}`}
    >
      <div className="chat-avatar" aria-hidden="true">
        {isAssistant ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className="chat-bubble">
        <div className="chat-sender">{isAssistant ? 'EcoTrace AI' : 'You'}</div>
        <div className="chat-text">{message.content}</div>
      </div>
    </div>
  );
}

const STARTER_QUESTIONS = [
  "What's my biggest source of emissions?",
  'How can I reduce my food footprint?',
  "What's the Paris climate target?",
  'Give me a personalised action plan',
];

export default function AiChat({ messages, onAddMessage, onClearHistory, userContext }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const envKey = import.meta.env.VITE_MISTRAL_API_KEY || '';
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [keySubmitted, setKeySubmitted] = useState(
    () => !!(localStorage.getItem('gemini_api_key') || envKey)
  );
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleSaveKey(e) {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) {return;}
    localStorage.setItem('gemini_api_key', trimmed);
    setKeySubmitted(true);
    setApiError(null);
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) {return;}

    setInput('');
    setApiError(null);
    onAddMessage('user', trimmed);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const storedKey = localStorage.getItem('gemini_api_key') || apiKey;
      const reply = await sendMessageToAssistant(trimmed, history, userContext, storedKey);
      onAddMessage('assistant', reply);
    } catch (err) {
      const isQuota =
        err.message?.toLowerCase().includes('quota') ||
        err.message?.toLowerCase().includes('limit');
      setApiError(
        isQuota
          ? '⏳ Rate limit reached on all models. Please wait 1 minute and try again, or check your Google AI quota at ai.google.dev/rate-limit'
          : err.message || 'Something went wrong. Check your API key and try again.'
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleChangeKey() {
    setKeySubmitted(false);
    setApiError(null);
  }

  const contextSummary = userContext?.annualProjectionKg
    ? `Your annual projection: ${formatEmission(userContext.annualProjectionKg)}`
    : null;

  return (
    <section className="chat-container" aria-label="AI carbon advisor chat">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <Bot size={20} aria-hidden="true" />
          <div>
            <div className="chat-title">
              EcoTrace AI <span className="powered-by">· Gemini</span>
            </div>
            {contextSummary && <div className="chat-subtitle">{contextSummary}</div>}
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            onClick={handleChangeKey}
            className="btn-icon"
            aria-label="Change API key"
            title="Change API key"
          >
            <Key size={15} />
          </button>
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="btn-icon"
              aria-label="Clear chat history"
              title="Clear chat history"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* API Key Entry */}
      {!keySubmitted && (
        <form className="apikey-form" onSubmit={handleSaveKey} aria-label="Enter Gemini API key">
          <div className="apikey-info">
            <Key size={18} aria-hidden="true" />
            <span>
              Enter your <strong>Gemini API key</strong> to activate the AI chat
            </span>
          </div>
          <p className="apikey-hint">
            Get a free key at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
            >
              aistudio.google.com
            </a>
            . Your key is stored only in your browser.
          </p>
          <div className="apikey-row">
            <div className="apikey-input-wrap">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="field-input"
                aria-label="Gemini API key"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className="apikey-toggle"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button type="submit" className="btn-primary apikey-save" disabled={!apiKey.trim()}>
              Save & Start
            </button>
          </div>
        </form>
      )}

      {/* Chat messages */}
      {keySubmitted && (
        <>
          <div className="chat-messages" role="log" aria-label="Chat messages" aria-live="polite">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <Bot size={40} aria-hidden="true" />
                <p>Ask me anything about your carbon footprint.</p>
                <ul className="starter-questions" aria-label="Suggested questions">
                  {STARTER_QUESTIONS.map((q) => (
                    <li key={q}>
                      <button
                        className="starter-btn"
                        onClick={() => sendMessage(q)}
                        disabled={loading}
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              messages.map((m) => <ChatMessage key={m.id} message={m} />)
            )}

            {loading && (
              <div className="chat-message chat-message--ai" aria-label="AI is thinking">
                <div className="chat-avatar" aria-hidden="true">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble chat-bubble--loading">
                  <Loader size={16} className="spin" aria-hidden="true" />
                  <span>Thinking…</span>
                </div>
              </div>
            )}

            {apiError && (
              <div className="chat-error" role="alert">
                ⚠️ {apiError}
              </div>
            )}

            <div ref={bottomRef} aria-hidden="true" />
          </div>

          <form className="chat-input-row" onSubmit={handleSubmit} aria-label="Send a message">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your footprint…"
              className="chat-input"
              aria-label="Message to AI assistant"
              disabled={loading}
              maxLength={500}
            />
            <button
              type="submit"
              className="btn-send"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </>
      )}
    </section>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.string,
  }).isRequired,
};

AiChat.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      role: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAddMessage: PropTypes.func.isRequired,
  onClearHistory: PropTypes.func.isRequired,
  userContext: PropTypes.shape({
    annualProjectionKg: PropTypes.number,
    totalLoggedKg: PropTypes.number,
    topCategory: PropTypes.string,
    streak: PropTypes.number,
  }),
};
AiChat.defaultProps = { userContext: {} };
