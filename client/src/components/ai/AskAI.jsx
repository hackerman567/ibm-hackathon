import React, { useState, useRef, useEffect } from 'react';
import { useAskAI } from '../../hooks/useGroqAI';
import { useCaptionStore } from '../../store/useCaptionStore';
import Button from '../ui/Button';
import { Send, Bot, User } from 'lucide-react';

export default function AskAI() {
  const { finalTranscript, interimText } = useCaptionStore();
  const { chatHistory, isAiTyping, askQuestion } = useAskAI();
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef(null);

  const fullTranscript = [...finalTranscript, interimText].filter(Boolean).join(' ');
  const hasTranscript = fullTranscript.trim().length > 0;

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAiTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || isAiTyping || !hasTranscript) return;

    askQuestion(question.trim(), fullTranscript);
    setQuestion('');
  };

  return (
    <div className="flex flex-col h-[480px] bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border-subtle bg-bg-surface/50 backdrop-blur-sm z-10 shrink-0">
        <Bot className="w-5 h-5 text-accent-coral" />
        <div>
          <h3 className="font-bold text-text-primary text-xs font-display">AI Assistant</h3>
          <p className="text-[10px] text-text-secondary">Ask questions in real-time about what was said</p>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/10">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-[240px] mx-auto space-y-3">
            <Bot className="w-8 h-8 text-text-muted" />
            <div>
              <p className="text-xs text-text-primary font-bold">Ask anything about the lecture</p>
              <p className="text-[10px] text-text-secondary mt-1">
                {hasTranscript 
                  ? "Type a question below. The AI assistant can answer based on the lecture material."
                  : "Start recording or try the demo first to ask questions."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${
                    isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 text-xs ${
                      isAssistant
                        ? 'bg-accent-coral/10 text-accent-coral border-accent-coral/25'
                        : 'bg-bg-elevated text-text-primary border-border-subtle'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`rounded-xl px-4 py-2.5 text-xs leading-relaxed border ${
                      isAssistant
                        ? 'bg-bg-elevated text-text-secondary border-border-subtle'
                        : 'bg-accent-coral/10 text-text-primary border-accent-coral/20'
                    }`}
                  >
                    {/* Preserve line breaks for paragraphs */}
                    <div className="whitespace-pre-line">{msg.content || '...'}</div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isAiTyping && chatHistory[chatHistory.length - 1]?.content === '' && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center border bg-accent-coral/10 text-accent-coral border-accent-coral/25 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-bg-elevated text-text-secondary border border-border-subtle rounded-xl px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent-coral rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 bg-accent-coral rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 bg-accent-coral rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-border-subtle bg-bg-surface flex gap-2 items-center shrink-0"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isAiTyping || !hasTranscript}
          placeholder={
            hasTranscript 
              ? "Ask a question about this lecture..." 
              : "Start lecture first to ask questions..."
          }
          className="flex-1 bg-bg-elevated border border-border-subtle hover:border-accent-coral/20 focus:border-accent-coral focus:ring-1 focus:ring-accent-coral/30 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-colors"
        />
        <Button
          type="submit"
          disabled={!question.trim() || isAiTyping || !hasTranscript}
          variant="primary"
          size="sm"
          className="h-[34px] w-[34px] !p-0 rounded-lg flex items-center justify-center"
        >
          <Send className="w-4 h-4 text-bg-base" />
        </Button>
      </form>
    </div>
  );
}
