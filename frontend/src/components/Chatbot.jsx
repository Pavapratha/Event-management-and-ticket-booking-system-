import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './Chatbot.css';

const GUEST_OPTIONS = [
  { id: '1', label: 'View Events', prompt: 'What events are available?' },
  { id: '2', label: 'Book Ticket', prompt: 'How do I book a ticket?' },
  { id: '3', label: 'Payment Help', prompt: 'How do I pay for tickets?' },
];

const AUTH_OPTIONS = [
  { id: '1', label: 'View Events', prompt: 'What events are available?' },
  { id: '2', label: 'Book Ticket', prompt: 'How do I book a ticket?' },
  { id: '3', label: 'My Bookings', prompt: 'Where can I find my bookings?' },
  { id: '4', label: 'Cancel Ticket', prompt: 'How do I cancel a ticket?' },
  { id: '5', label: 'Payment Help', prompt: 'How do I pay for tickets?' },
];

const buildInitialMessage = (isAuthenticated, userName) => {
  if (isAuthenticated) {
    return {
      id: 'welcome',
      sender: 'bot',
      text: userName
        ? `Hello ${userName} 👋 How can I help you today?`
        : 'Hello 👋 How can I help you today?',
      options: AUTH_OPTIONS,
    };
  }

  return {
    id: 'welcome',
    sender: 'bot',
    text: 'Hello 👋 How can I help you today?',
    options: GUEST_OPTIONS,
  };
};

const sensitiveIntentPatterns = [
  /cancel/,
  /cancellation/,
  /my bookings/,
  /my tickets/,
  /booking history/,
  /where are my bookings/,
  /where can i find my bookings/,
  /where can i see my bookings/,
  /manage my bookings/,
];

const Chatbot = () => {
  const { user, authChecked } = useAuth();
  const [authState, setAuthState] = useState(() => {
    return {
      isLoggedIn: Boolean(user),
      userName: user?.name || '',
      authMode: user ? `authenticated:${user?._id || user?.email || 'token'}` : 'guest',
    };
  });
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([buildInitialMessage(authState.isLoggedIn, authState.userName)]);
  const [suggestionsShown, setSuggestionsShown] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const isLoggedIn = Boolean(user);
    const userName = user?.name || '';
    const authMode = isLoggedIn ? `authenticated:${user?._id || user?.email || 'token'}` : 'guest';

    setAuthState((currentState) => {
      if (
        currentState.isLoggedIn === isLoggedIn
        && currentState.userName === userName
        && currentState.authMode === authMode
      ) {
        return currentState;
      }

      return {
        isLoggedIn,
        userName,
        authMode,
      };
    });
  }, [user]);

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    setMessages([buildInitialMessage(authState.isLoggedIn, authState.userName)]);
    setSuggestionsShown(true);
  }, [authChecked, authState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const appendMessage = (message) => {
    setMessages((currentMessages) => [...currentMessages, message]);
  };

  const hideSuggestions = () => {
    setSuggestionsShown(false);
    setMessages((currentMessages) => currentMessages.map((message) => ({
      ...message,
      options: [],
    })));
  };

  const isSensitiveQuery = (message) =>
    sensitiveIntentPatterns.some((pattern) => pattern.test(message.toLowerCase()));

  const appendLoginPrompt = () => {
    appendMessage({
      id: `bot-login-${Date.now()}`,
      sender: 'bot',
      text: 'You need to log in to view or manage your bookings.',
      options: [],
    });
  };

  const handleQuickAction = (option) => {
    if (!authChecked) {
      return;
    }

    hideSuggestions();

    sendMessage(option.prompt || option.label);
  };

  const sendMessage = async (rawMessage) => {
    const message = rawMessage.trim();
    if (!message || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
    };

    if (suggestionsShown) {
      hideSuggestions();
    }

    appendMessage(userMessage);
    setInputValue('');

    if (!authState.isLoggedIn && isSensitiveQuery(message)) {
      appendLoginPrompt();
      return;
    }

    setIsSending(true);

    try {
      const response = await api.post('/api/chatbot/message', { message });
      appendMessage({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.data.reply || 'I could not generate a response.',
        options: [],
      });
    } catch (error) {
      appendMessage({
        id: `bot-error-${Date.now()}`,
        sender: 'bot',
        text: error.response?.status === 401
          ? 'You need to log in to view or manage your bookings.'
          : error.response?.data?.message || 'The assistant is unavailable right now. Please try again.',
        options: [],
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(inputValue);
  };

  return (
    <div className="chatbot-widget">
      {isOpen ? (
        <section className="chatbot-panel" aria-label="AI assistant chat window">
          <header className="chatbot-header">
            <div>
              <p className="chatbot-eyebrow">AI assistant</p>
              <h2 className="chatbot-title">Event support</h2>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message chatbot-message-${message.sender}`}
              >
                <span className="chatbot-message-label">
                  {message.sender === 'bot' ? 'Assistant' : 'You'}
                </span>
                <p>{message.text}</p>
                {message.sender === 'bot' && suggestionsShown && Array.isArray(message.options) && message.options.length > 0 ? (
                  <div className="chatbot-option-list">
                    {message.options.map((option) => (
                      <button
                        key={`${message.id}-${option.id}`}
                        type="button"
                        className="chatbot-option"
                        disabled={!authChecked}
                        onClick={() => handleQuickAction(option)}
                      >
                        <span className="chatbot-option-number">{option.id}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {isSending && (
              <div className="chatbot-message chatbot-message-bot chatbot-message-loading">
                <span className="chatbot-message-label">Assistant</span>
                <p>Thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask about events, bookings, cancellations, or payments"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              maxLength={500}
              disabled={!authChecked || isSending}
            />
            <button type="submit" className="chatbot-send" disabled={!authChecked || isSending || !inputValue.trim()}>
              Send
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label={isOpen ? 'Hide chatbot' : 'Open chatbot'}
      >
        <span className="chatbot-toggle-badge">AI</span>
        <span className="chatbot-toggle-text">Need help?</span>
      </button>
    </div>
  );
};

export default Chatbot;