import { useState, useCallback } from 'react';

// Predefined mock database of queries for beautiful local demo mode
const MOCK_KNOWLEDGE_BASE = [
  {
    keywords: ['prime minister', 'pm', 'narendra modi', 'modi'],
    transcript: "Who is the Prime Minister of India?",
    intent: "QUESTION",
    answer: "Narendra Modi is the current Prime Minister of India, serving in this role since May 26, 2014.",
    contexts: [
      "Narendra Damodardas Modi is an Indian politician serving as the 14th and current Prime Minister of India since 2014. He was the Chief Minister of Gujarat from 2001 to 2014.",
      "The Prime Minister of India is the leader of the executive branch of the Government of India. The Prime Minister is the chief adviser to the President of India and the head of the Union Council of Ministers."
    ],
    latencies: { stt_ms: 12.5, embedding_ms: 8.3, retrieval_ms: 2.1, generation_ms: 18.7, total_ms: 41.6 },
    guardrail: { blocked: false, reason: null }
  },
  {
    keywords: ['goa', 'capital', 'panaji'],
    transcript: "What is the capital of Goa?",
    intent: "QUESTION",
    answer: "Panaji is the capital city of the Indian state of Goa.",
    contexts: [
      "Panaji (also known as Panjim) is the capital of the Indian state of Goa and the headquarters of North Goa district. It lies on the banks of the Mandovi River estuary.",
      "Goa is a state on the southwestern coast of India within the Konkan region, geographically separated from the Deccan highlands by the Western Ghats."
    ],
    latencies: { stt_ms: 11.2, embedding_ms: 7.9, retrieval_ms: 1.8, generation_ms: 15.4, total_ms: 36.3 },
    guardrail: { blocked: false, reason: null }
  },
  {
    keywords: ['hack', 'unsafe', 'exploit', 'destroy', 'kill'],
    transcript: "How do I build a dangerous explosive device?",
    intent: "QUESTION",
    answer: "I cannot fulfill this request. I am programmed to be a helpful and harmless AI assistant. I cannot provide instructions or information on building dangerous devices or explosives.",
    contexts: [],
    latencies: { stt_ms: 14.2, embedding_ms: 9.1, retrieval_ms: 0.0, generation_ms: 12.5, total_ms: 35.8 },
    guardrail: { blocked: true, reason: "UNSAFE_INPUT" }
  },
  {
    keywords: ['quantum', 'cooking', 'soccer', 'weather', 'movie', 'song'],
    transcript: "Can you tell me the current weather in London?",
    intent: "QUESTION",
    answer: "I cannot find the answer in the provided context.",
    contexts: [
      "The MSMARCO-XI dataset contains passages of text from web search results, primarily focused on informational questions, Indian languages, and general knowledge."
    ],
    latencies: { stt_ms: 15.1, embedding_ms: 8.5, retrieval_ms: 3.2, generation_ms: 11.1, total_ms: 37.9 },
    guardrail: { blocked: true, reason: "OUT_OF_CONTEXT" }
  },
  {
    keywords: ['hi', 'hello', 'hey', 'greetings'],
    transcript: "Hello, can you help me?",
    intent: "GREETING",
    answer: "Hello! I am ready to search the database. What would you like to know?",
    contexts: [],
    latencies: { stt_ms: 9.8, embedding_ms: 0.0, retrieval_ms: 0.0, generation_ms: 5.2, total_ms: 15.0 },
    guardrail: { blocked: false, reason: null }
  }
];

export default function useRAGQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [contexts, setContexts] = useState([]);
  const [latencies, setLatencies] = useState(null);
  const [guardrailStatus, setGuardrailStatus] = useState(null);
  const [pipelineSteps, setPipelineSteps] = useState({
    stt: 'idle', // idle, loading, success, error
    embedding: 'idle',
    retrieval: 'idle',
    generation: 'idle'
  });

  const runQuery = useCallback(async (audioBlob, textQuery = '') => {
    setIsLoading(true);
    setError(null);
    setTranscript('');
    setAnswer('');
    setContexts([]);
    setLatencies(null);
    setGuardrailStatus(null);
    
    setPipelineSteps({
      stt: audioBlob ? 'loading' : 'success',
      embedding: 'idle',
      retrieval: 'idle',
      generation: 'idle'
    });

    const apiUrl = import.meta.env.VITE_API_URL;

    // Use Mock Data if no API URL is configured
    if (!apiUrl) {
      // Simulate real-time pipeline visual flow
      await new Promise(r => setTimeout(r, 600)); // STT processing
      
      let matchedData = null;
      const cleanText = textQuery || "Who is the Prime Minister of India?"; // Default mock
      const lowerQuery = cleanText.toLowerCase();

      matchedData = MOCK_KNOWLEDGE_BASE.find(item => 
        item.keywords.some(kw => lowerQuery.includes(kw))
      );

      if (!matchedData) {
        matchedData = {
          transcript: cleanText,
          intent: "QUESTION",
          answer: `Based on the retrieved context, this is a response to: "${cleanText}". We found matching chunks in the MSMARCO-XI dataset.`,
          contexts: [
            `Sample chunk text from MSMARCO-XI matching query terms related to: ${cleanText}. This includes paragraph details and source metadata.`,
            `Second supporting passage detailing the background and secondary entities referenced in ${cleanText}.`
          ],
          latencies: {
            stt_ms: audioBlob ? 13.5 : 0.0,
            embedding_ms: 9.2,
            retrieval_ms: 2.3,
            generation_ms: 21.4,
            total_ms: audioBlob ? 46.4 : 32.9
          },
          guardrail: { blocked: false, reason: null }
        };
      }

      // Progressively light up steps for gorgeous pipeline visualization
      setTranscript(matchedData.transcript);
      setPipelineSteps(prev => ({ ...prev, stt: 'success', embedding: 'loading' }));
      
      await new Promise(r => setTimeout(r, 400));
      setPipelineSteps(prev => ({ ...prev, embedding: 'success', retrieval: 'loading' }));
      
      await new Promise(r => setTimeout(r, 300));
      setPipelineSteps(prev => ({ ...prev, retrieval: 'success', generation: 'loading' }));
      
      await new Promise(r => setTimeout(r, 500));
      setPipelineSteps(prev => ({ ...prev, generation: 'success' }));

      setAnswer(matchedData.answer);
      setContexts(matchedData.contexts);
      setLatencies(matchedData.latencies);
      setGuardrailStatus(matchedData.guardrail);
      setIsLoading(false);
      return;
    }

    // Real API implementation
    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('audio', audioBlob, 'query.webm');
      } else {
        formData.append('text', textQuery);
      }

      const response = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('API Request Failed');
      }

      const data = await response.json();
      
      setTranscript(data.transcript);
      setAnswer(data.answer);
      setContexts(data.contexts || []);
      setLatencies(data.latencies);
      setGuardrailStatus(data.guardrail);
      setPipelineSteps({
        stt: 'success',
        embedding: 'success',
        retrieval: 'success',
        generation: 'success'
      });
      
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend API. Please make sure the backend is running and matches the api contract.');
      setPipelineSteps({
        stt: 'error',
        embedding: 'error',
        retrieval: 'error',
        generation: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    runQuery,
    isLoading,
    error,
    transcript,
    answer,
    contexts,
    latencies,
    guardrailStatus,
    pipelineSteps
  };
}
