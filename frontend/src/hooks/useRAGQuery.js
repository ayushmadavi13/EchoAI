import { useState, useCallback } from 'react';

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
    setTranscript(textQuery);
    setAnswer('');
    setContexts([]);
    setLatencies(null);
    setGuardrailStatus(null);
    
    setPipelineSteps({
      stt: audioBlob ? 'loading' : 'success',
      embedding: 'loading',
      retrieval: 'loading',
      generation: 'idle'
    });

    const apiUrl = import.meta.env.VITE_API_URL || '';

    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('audio', audioBlob, 'query.webm');
      } else {
        formData.append('text', textQuery);
      }

      // Fetch the SSE stream from the FastAPI backend
      const response = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Request Failed: ${response.statusText}`);
      }

      // Read the Server-Sent Events stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop(); // Keep the incomplete part in the buffer

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              try {
                const jsonStr = part.replace('data: ', '');
                const event = JSON.parse(jsonStr);

                // Handle the different event types streamed from the orchestrator
                if (event.type === 'transcript') {
                  setTranscript(event.text);
                  setPipelineSteps(prev => ({ ...prev, stt: 'success' }));
                } 
                else if (event.type === 'context') {
                  setContexts(event.chunks);
                  setPipelineSteps(prev => ({ ...prev, embedding: 'success', retrieval: 'success', generation: 'loading' }));
                }
                else if (event.type === 'guardrail') {
                  setGuardrailStatus({ blocked: event.blocked, reason: event.reason });
                }
                else if (event.type === 'chunk') {
                  setPipelineSteps(prev => ({ ...prev, generation: 'success' }));
                  // Append the chunk to the existing answer progressively
                  setAnswer(prev => prev + event.content);
                }
                else if (event.type === 'latency') {
                  setLatencies(event.data);
                }
                else if (event.type === 'error') {
                  setError(event.content);
                  setPipelineSteps({ stt: 'error', embedding: 'error', retrieval: 'error', generation: 'error' });
                }

              } catch (e) {
                console.error("Failed to parse SSE JSON chunk:", e, part);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend API. Please make sure the FastAPI server is running.');
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
