import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLectureStore } from '../store/useLectureStore';
import { useSettingsStore } from '../store/useSettingsStore';

const BACKEND_URL = '/api/groq';

export function useGroqAI() {
  const { actions, isSummarizing } = useLectureStore();
  const { targetLanguage, groqApiKey } = useSettingsStore();
  const [loadingSummary, setLoadingSummary] = useState(false);

  // 1. Generate Summary
  const generateSummary = useCallback(async (transcript) => {
    if (!transcript || transcript.trim().length < 50) {
      toast.error('Lecture transcript is too short. Please capture more speech first.');
      return;
    }

    setLoadingSummary(true);
    actions.setIsSummarizing(true);
    actions.clearSummary();

    try {
      const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, language: targetLanguage })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      actions.setSummary(data);
      toast.success('Lecture analysis complete!');
    } catch (error) {
      console.error('Summarize API Error:', error);
      toast.error(`Summarization failed: ${error.message}`);
    } finally {
      setLoadingSummary(false);
      actions.setIsSummarizing(false);
    }
  }, [actions, targetLanguage]);

  return {
    generateSummary,
    loadingSummary: loadingSummary || isSummarizing
  };
}

export function useAskAI() {
  const { chatHistory, isAiTyping, actions } = useLectureStore();
  const { targetLanguage } = useSettingsStore();

  const askQuestion = useCallback(async (question, transcript) => {
    if (!question || question.trim().length < 5) {
      toast.error('Question must be at least 5 characters long.');
      return;
    }

    if (!transcript || transcript.trim().length === 0) {
      toast.error('Transcript is empty. Capture some speech or start the demo first.');
      return;
    }

    // Add user question to history
    actions.addChatMessage({ role: 'user', content: question });
    actions.setIsAiTyping(true);

    // Add placeholder assistant message that we'll stream into
    actions.addChatMessage({ role: 'assistant', content: '' });

    try {
      const response = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, transcript, language: targetLanguage })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to assistant.');
      }

      const contentType = response.headers.get('Content-Type') || '';

      // If the response is JSON (Vercel serverless), read it all at once
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.error) {
          toast.error(data.error);
          useLectureStore.setState((state) => {
            const updatedHistory = [...state.chatHistory];
            if (updatedHistory.length > 0) {
              updatedHistory[updatedHistory.length - 1] = { role: 'assistant', content: `Error: ${data.error}` };
            }
            return { chatHistory: updatedHistory };
          });
        } else {
          useLectureStore.setState((state) => {
            const updatedHistory = [...state.chatHistory];
            if (updatedHistory.length > 0) {
              updatedHistory[updatedHistory.length - 1] = { role: 'assistant', content: data.text || '' };
            }
            return { chatHistory: updatedHistory };
          });
        }
      } else {
        // SSE streaming mode (local Express server)
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let assistantText = '';
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            if (cleanLine.startsWith('data: ')) {
              const jsonStr = cleanLine.slice(6);
              if (jsonStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.text) {
                  assistantText += parsed.text;
                  useLectureStore.setState((state) => {
                    const updatedHistory = [...state.chatHistory];
                    if (updatedHistory.length > 0) {
                      updatedHistory[updatedHistory.length - 1] = { role: 'assistant', content: assistantText };
                    }
                    return { chatHistory: updatedHistory };
                  });
                } else if (parsed.error) {
                  toast.error(parsed.error);
                  useLectureStore.setState((state) => {
                    const updatedHistory = [...state.chatHistory];
                    if (updatedHistory.length > 0) {
                      updatedHistory[updatedHistory.length - 1] = { role: 'assistant', content: `Error: ${parsed.error}` };
                    }
                    return { chatHistory: updatedHistory };
                  });
                }
              } catch (err) {
                console.error('Failed to parse stream chunk:', err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Q&A streaming error:', error);
      toast.error(`Failed to connect to AI: ${error.message}`);
      // Update assistant message with error notice
      useLectureStore.setState((state) => {
        const updatedHistory = [...state.chatHistory];
        if (updatedHistory.length > 0) {
          updatedHistory[updatedHistory.length - 1] = {
            role: 'assistant',
            content: `Error: Could not retrieve answer. Check if your server is running. (${error.message})`
          };
        }
        return { chatHistory: updatedHistory };
      });
    } finally {
      actions.setIsAiTyping(false);
    }
  }, [actions, targetLanguage]);

  return {
    chatHistory,
    isAiTyping,
    askQuestion
  };
}
