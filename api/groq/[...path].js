import Groq from 'groq-sdk';

// Helper to determine the lecture topic based on keywords in the transcript
function detectTopic(transcript = '') {
  const text = transcript.toLowerCase();
  if (text.includes('react') || text.includes('component') || text.includes('state') || text.includes('hooks') || text.includes('css') || text.includes('javascript') || text.includes('html')) {
    return 'React & Web Development';
  }
  if (text.includes('cell') || text.includes('dna') || text.includes('rna') || text.includes('protein') || text.includes('gene') || text.includes('mitochondria') || text.includes('biology')) {
    return 'Introduction to Cellular Biology';
  }
  if (text.includes('gravity') || text.includes('physics') || text.includes('force') || text.includes('quantum') || text.includes('energy') || text.includes('speed') || text.includes('einstein')) {
    return 'Principles of Physics';
  }
  if (text.includes('equation') || text.includes('math') || text.includes('calculus') || text.includes('integral') || text.includes('derivative') || text.includes('algebra')) {
    return 'Advanced Mathematics';
  }
  if (text.includes('history') || text.includes('empire') || text.includes('war') || text.includes('revolution') || text.includes('president') || text.includes('century')) {
    return 'Modern World History';
  }
  return 'General Academic Studies';
}

function generateMockSummary(transcript, language = 'English') {
  const topic = detectTopic(transcript);

  let summary = '';
  let keyPoints = [];
  let examQuestions = [];

  if (topic === 'React & Web Development') {
    summary = `### Summary of React & Web Development Lecture\n\nThis lecture provided a comprehensive introduction to modern frontend web development using React. The speaker discussed how React allows developers to build fast, interactive user interfaces by using reusable UI components. By dividing the screen into isolated components, developers can manage state independently, reducing visual complexity and improving code organization.\n\nThe discussion highlighted key React features, including JSX syntax, components, props, and state management. The lecturer emphasized that components are essentially JavaScript functions that return UI elements. Additionally, state is used to keep track of changing data in the app, and hooks like \`useState\` and \`useEffect\` provide direct access to state and lifecycle methods in functional components.\n\nFinally, the lecture covered styling practices, noting the benefits of using utility-first CSS frameworks like Tailwind CSS to accelerate design workflow. The speaker concluded by stressing the importance of accessibility (WCAG compliance) to ensure web applications are usable by all individuals, including those with hearing or visual impairments.`;
    keyPoints = [
      'React is a component-based JavaScript library designed for building dynamic user interfaces.',
      'JSX stands for JavaScript XML, allowing developers to write HTML-like structures directly inside JavaScript.',
      'State is used to maintain local variable storage that triggers re-rendering upon modification.',
      'Hooks such as `useState` and `useEffect` enable state management and side-effect handling inside functional components.',
      'Accessibility best practices ensure that web apps comply with global standards like WCAG 2.1.'
    ];
    examQuestions = [
      'Explain the difference between Props and State in React components.',
      'What are React Hooks and why were they introduced in React 16.8?',
      'How does the Virtual DOM optimize rendering speed in large-scale web applications?'
    ];
  } else if (topic === 'Introduction to Cellular Biology') {
    summary = `### Summary of Introduction to Cellular Biology Lecture\n\nThis lecture focused on the fundamental building blocks of life: cells. The lecturer outlined the primary differences between prokaryotic and eukaryotic cells, noting that eukaryotic cells possess membrane-bound organelles, including a defined nucleus holding genetic material. Prokaryotic cells, like bacteria, lack this compartmentalization.\n\nThe discussion then delved into key organelles, focusing heavily on the mitochondria, which acts as the powerhouse of the cell by producing adenosine triphosphate (ATP) via cellular respiration. The cell membrane was also explored, highlighting its phospholipid bilayer structure which allows for selective permeability and cell communication.\n\nLastly, the lecture introduced genetic transcription and translation. DNA, housed in the nucleus, is transcribed into RNA, which then exits the nucleus to guide protein synthesis. Proteins serve as the biological workhorses performing chemical reactions, structural support, and cellular signaling.`;
    keyPoints = [
      'Cells are categorized into prokaryotic (simple, no nucleus) and eukaryotic (complex, contains nucleus).',
      'The mitochondria produces ATP through cellular respiration, supplying energy for cellular processes.',
      'The plasma membrane uses a selectively-permeable lipid bilayer to control entry and exit of molecules.',
      'DNA is transcribed into messenger RNA (mRNA), which is then translated by ribosomes into proteins.',
      'Proteins carry out crucial functions including acting as catalysts (enzymes) for chemical reactions.'
    ];
    examQuestions = [
      'Detail the primary structural differences between prokaryotes and eukaryotes.',
      'Describe the process of cellular respiration and where ATP synthesis occurs.',
      'Explain the flow of genetic information according to the central dogma of molecular biology.'
    ];
  } else if (topic === 'Principles of Physics') {
    summary = `### Summary of Principles of Physics Lecture\n\nThis lecture introduced core physics principles, including classical mechanics, gravity, and force. The instructor reviewed Isaac Newton's three laws of motion, which form the bedrock of classical physics. These laws describe how objects move in response to forces, linking mass, acceleration, and inertia.\n\nThe focus then shifted to gravity, describing it as an attractive force between two masses. The lecturer discussed Albert Einstein's General Theory of Relativity, which explains gravity not just as a force, but as the curvature of spacetime caused by mass and energy. This transition from Newtonian physics to relativistic physics highlights how theories evolve with new discoveries.\n\nFinally, the lecture touched upon energy conservation. The first law of thermodynamics states that energy cannot be created or destroyed, only transformed from one form to another (e.g. potential energy to kinetic energy). Understanding these energy transitions is key to resolving mechanical, electrical, and quantum physics problems.`;
    keyPoints = [
      "Newton's laws of motion describe the relationship between an object's motion and the forces acting on it.",
      'Gravity is a fundamental attractive force that is proportional to mass and inversely proportional to the square of distance.',
      "Einstein's General Relativity models gravity as the warping of spacetime rather than an instantaneous pull.",
      'The Law of Conservation of Energy dictates that total energy in a closed system remains constant.',
      'Kinetic energy relates to motion, whereas potential energy relates to position within a force field.'
    ];
    examQuestions = [
      "State Newton's three laws of motion and provide a real-world example for each.",
      "How does Einstein's explanation of gravity differ from Newton's Law of Universal Gravitation?",
      'Explain the difference between conservative and non-conservative forces in mechanics.'
    ];
  } else {
    summary = `### Summary of ${topic} Lecture\n\nThis lecture provided a thorough examination of core concepts associated with ${topic}. The speaker introduced the historical background, foundational theories, and current advancements in the field. Students were encouraged to think critically about how these concepts apply to modern scientific and social landscapes.\n\nThe middle segment of the lecture examined specific case studies, illustrating the practical applications of these theories. The discussion emphasized methodology, data collection, and experimental analysis. Key variables and external constraints were analyzed to understand their impact on outcomes.\n\nThe session concluded with a look toward future developments and open questions in the discipline. The lecturer emphasized that ongoing research and collaboration are critical to overcoming current limitations. Students were reminded to complete the reading assignments and prepare for interactive discussions next week.`;
    keyPoints = [
      `The lecture laid out the fundamental framework defining ${topic}.`,
      'Practical examples and case studies were used to demonstrate core theories.',
      'Analytical methodologies and data accuracy were highlighted as essential parameters.',
      'Understanding external variables is key to explaining unexpected anomalies.',
      'Future developments depend heavily on interdisciplinary research and technological tools.'
    ];
    examQuestions = [
      `What are the primary theoretical arguments supporting the study of ${topic}?`,
      'Identify two variables discussed in the lecture and explain their relationship.',
      'How does current research aim to solve the primary challenges outlined by the lecturer?'
    ];
  }

  if (language !== 'English') {
    summary = `[Translated to ${language} in Demo Mode]\n\n${summary}`;
  }

  return { summary, keyPoints, examQuestions };
}

function getMockAnswer(question, transcript) {
  const q = question.toLowerCase();
  const topic = detectTopic(transcript);

  if (q.includes('what') && q.includes('topic')) {
    return `The current lecture topic appears to be "${topic}", based on keywords in the transcript.`;
  }
  if (q.includes('summary') || q.includes('summarize')) {
    return `In short, this lecture covers "${topic}". The instructor is explaining key terminologies, building blocks, and practical applications, emphasizing how these concepts form the foundation of this field.`;
  }
  if (q.includes('react') || q.includes('component') || q.includes('state')) {
    return "React is a JavaScript library for building user interfaces. Components are the building blocks of React, allowing you to split the UI into independent, reusable pieces. State is an object that holds information that may change over the lifetime of the component.";
  }
  if (q.includes('cell') || q.includes('dna') || q.includes('mitochondria')) {
    return "Cells are the basic units of life. Eukaryotic cells contain membrane-bound organelles like the nucleus (which houses DNA) and mitochondria (which generates ATP energy for cellular processes). Transcription converts DNA to RNA, and translation makes proteins.";
  }
  if (q.includes('gravity') || q.includes('force') || q.includes('physics')) {
    return "Gravity is the force that pulls objects toward each other. Newton explained it as a universal attraction between masses, while Einstein's General Relativity described it as the bending of space and time around massive objects.";
  }
  if (q.includes('exam') || q.includes('question')) {
    return "Typical exam questions on this topic include: 1) Defining the core concepts, 2) Drawing/explaining relationships between key variables, and 3) Explaining practical real-world applications of the theories discussed.";
  }

  return `This is a helpful response generated in offline/mock tutor mode. You asked: "${question}". Based on the transcript for "${topic}", this lecture is introducing foundational concepts, defining core parameters, and providing relevant examples to ensure students understand the material. Let me know if you need specific details about keywords in the transcript!`;
}

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new Groq({ apiKey });
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `https://${req.headers.host}`);

  // --- POST /api/groq/summarize ---
  if (req.method === 'POST' && pathname.endsWith('/summarize')) {
    try {
      const { transcript, language = 'English' } = req.body;

      if (!transcript || transcript.length < 50) {
        return res.status(400).json({
          error: 'Transcript is too short. Please capture at least 50 characters before summarizing.'
        });
      }

      const groq = getGroqClient();

      if (!groq) {
        const mockResult = generateMockSummary(transcript, language);
        return res.json(mockResult);
      }

      const systemPrompt = `You are an educational AI assistant for deaf students. Analyze the following lecture transcript and provide:
1) A concise 3-paragraph summary (with clean Markdown subheaders if appropriate).
2) 5 key learning points as bullet points.
3) 3 possible exam questions.
Format with clear markdown headers. Be educational, clear, and structured. 
Return the output strictly in valid JSON format with keys: "summary" (string containing markdown), "keyPoints" (array of 5 strings), and "examQuestions" (array of 3 strings). Keep the response in ${language} language.`;

      const response = await groq.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the lecture transcript to analyze: \n\n${transcript}` }
        ],
        response_format: { type: "json_object" },
        stream: false
      });

      const content = response.choices[0]?.message?.content;
      const parsedData = JSON.parse(content);

      return res.json({
        summary: parsedData.summary || '',
        keyPoints: parsedData.keyPoints || [],
        examQuestions: parsedData.examQuestions || []
      });
    } catch (error) {
      console.error('Groq summarization failed:', error);
      const mockResult = generateMockSummary(req.body.transcript, req.body.language);
      return res.json({ ...mockResult, isMocked: true, errorMsg: error.message });
    }
  }

  // --- POST /api/groq/ask (non-streaming for serverless) ---
  if (req.method === 'POST' && pathname.endsWith('/ask')) {
    const { question, transcript, language = 'English' } = req.body;

    if (!question || question.length < 5) {
      return res.status(400).json({ error: 'Question is too short. Ask a question with at least 5 characters.' });
    }

    const groq = getGroqClient();

    if (!groq) {
      const answer = getMockAnswer(question, transcript);
      return res.json({ text: answer });
    }

    try {
      const systemPrompt = `You are a helpful tutor for a deaf student. You have access to the lecture transcript below. Answer the student's question clearly and concisely in ${language} based on the lecture content. If the answer isn't in the transcript, say so and provide general knowledge. Keep the response educational and easy to follow.`;

      const response = await groq.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Lecture Transcript:\n${transcript}\n\nStudent's Question:\n${question}` }
        ],
        stream: false
      });

      const content = response.choices[0]?.message?.content || '';
      return res.json({ text: content });
    } catch (error) {
      console.error('Groq Q&A failed:', error);
      const answer = getMockAnswer(question, transcript);
      return res.json({ text: answer, isMocked: true });
    }
  }

  // --- POST /api/groq/analyze-chunk ---
  if (req.method === 'POST' && pathname.endsWith('/analyze-chunk')) {
    const { chunk } = req.body;

    if (!chunk || chunk.trim().length < 10) {
      return res.json({ type: 'normal', importance: 'low', label: '', reason: '' });
    }

    const groq = getGroqClient();

    if (!groq) {
      return res.json({ type: 'normal', importance: 'low', label: 'Mock normal', reason: 'Mock fallback' });
    }

    try {
      const systemPrompt = `You are analyzing a live lecture transcript chunk for a deaf student accessibility app.
Classify this chunk and respond ONLY with valid JSON, no markdown:
{
  "type": one of ["exam", "concept", "formula", "example", "story", "normal"],
  "importance": one of ["high", "medium", "low"],
  "label": "max 6 word summary of this moment",
  "reason": "one sentence why this is important"
}
If the content is just filler or transition words, use type "normal" and importance "low".`;

      const response = await groq.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: chunk }
        ],
        response_format: { type: 'json_object' },
        stream: false
      });

      const content = response.choices[0]?.message?.content;
      let parsedData;
      try { parsedData = JSON.parse(content); } catch (_) { parsedData = {}; }

      const VALID_TYPES = ['exam', 'concept', 'formula', 'example', 'story', 'normal'];
      const VALID_IMPORTANCE = ['high', 'medium', 'low'];

      return res.json({
        type: VALID_TYPES.includes(parsedData.type) ? parsedData.type : 'normal',
        importance: VALID_IMPORTANCE.includes(parsedData.importance) ? parsedData.importance : 'low',
        label: typeof parsedData.label === 'string' ? parsedData.label.slice(0, 80) : '',
        reason: typeof parsedData.reason === 'string' ? parsedData.reason.slice(0, 200) : ''
      });
    } catch (error) {
      console.error('Groq chunk analysis failed:', error);
      return res.json({ type: 'normal', importance: 'low', label: '', reason: 'Error fallback' });
    }
  }

  return res.status(404).json({ error: 'Route not found' });
}
