import Groq from 'groq-sdk';
import { config } from '../config.js';

// Abstract Classifier Provider interface
class GroqClassifierProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = apiKey ? new Groq({ apiKey }) : null;
  }

  async classifyWindow(textWindow) {
    if (!this.client) {
      throw new Error('Groq client not initialized');
    }

    const systemPrompt = `You are an educational NLP analyzer. Analyze the provided lecture transcript segment for emphasis and key learning tags.
Respond ONLY with a valid JSON object matching this schema:
{
  "tag": "EMPHASIS" | "EXAM_POINT" | "DEFINITION" | "QUESTION" | "NEW_TOPIC" | "HOMEWORK" | "NONE",
  "confidence": number between 0.0 and 1.0,
  "label": "short human readable explanation"
}
Do NOT include markdown formatting or extra text outside JSON.`;

    const completion = await this.client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Lecture window text: "${textWindow}"` }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      max_tokens: 100
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      tag: parsed.tag || 'NONE',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
      label: parsed.label || ''
    };
  }
}

// Instantiate Groq provider by default (swappable to WatsonX Provider)
const classifierProvider = new GroqClassifierProvider(config.GROQ_API_KEY);

// State for debounce
let lastNewTopicTimestamp = 0;

export function analyzeRules(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Cue phrase patterns
  if (/\b(exam|test|midterm|final|will appear on|on the exam|grading)\b/.test(lower)) {
    return { tag: 'EXAM_POINT', confidence: 0.95, label: 'Exam point cue detected' };
  }
  if (/\b(remember|important|note this|make sure|don't forget|pay attention|crucial|vital)\b/.test(lower)) {
    return { tag: 'EMPHASIS', confidence: 0.88, label: 'Teacher emphasis phrase' };
  }
  if (/\b(defined as|definition|means that|refers to|is basically|is known as)\b/.test(lower)) {
    return { tag: 'DEFINITION', confidence: 0.85, label: 'Concept definition' };
  }
  if (/\b(homework|assignment|due next|submit by|read chapter|problem set)\b/.test(lower)) {
    return { tag: 'HOMEWORK', confidence: 0.90, label: 'Homework / assignment' };
  }
  if (/\b(next topic|moving on to|now let's look at|turning our attention to|new section|chapter)\b/.test(lower)) {
    return { tag: 'NEW_TOPIC', confidence: 0.85, label: 'Topic transition' };
  }
  if (/^(what|why|how|does|is|can|could|would|where|when|who)\b/.test(lower.trim()) || lower.includes('?')) {
    return { tag: 'QUESTION', confidence: 0.80, label: 'Question asked' };
  }

  return null;
}

export async function analyzeSegment({ segmentId, text, timestamp, slidingWindow = '' }) {
  if (!text || text.trim().length === 0) return null;

  // 1. Rule-based detection (Instant & 100% offline reliable)
  const ruleResult = analyzeRules(text);

  // 2. Asynchronous LLM Classification with 1.5s strict timeout
  let llmResult = null;
  if (config.GROQ_API_KEY) {
    try {
      const llmPromise = classifierProvider.classifyWindow(slidingWindow || text);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('LLM classification timeout')), 1500)
      );
      llmResult = await Promise.race([llmPromise, timeoutPromise]);
    } catch (err) {
      // Fail silently and rely on rule engine
    }
  }

  // Combine layers into single result
  let finalTag = null;
  let confidence = 0;
  let source = 'rules';
  let label = '';

  if (llmResult && llmResult.tag !== 'NONE' && llmResult.confidence >= (config.DEFAULT_CONFIDENCE_THRESHOLD || 0.65)) {
    finalTag = llmResult.tag;
    confidence = llmResult.confidence;
    source = 'llm';
    label = llmResult.label;
  } else if (ruleResult) {
    finalTag = ruleResult.tag;
    confidence = ruleResult.confidence;
    source = 'rules';
    label = ruleResult.label;
  }

  if (!finalTag) return null;

  // Enforce Debounce: Max 1 NEW_TOPIC per 60 seconds
  if (finalTag === 'NEW_TOPIC') {
    const now = Date.now();
    if (now - lastNewTopicTimestamp < config.NEW_TOPIC_DEBOUNCE_MS) {
      return null; // Suppress debounced NEW_TOPIC
    }
    lastNewTopicTimestamp = now;
  }

  return {
    segmentId,
    type: finalTag,
    confidence,
    source,
    label,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };
}
