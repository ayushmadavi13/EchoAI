import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import useRAGQuery from '../hooks/useRAGQuery';

export default function VoiceInterface() {
  const { isRecording, audioBlob, recordingTime, startRecording, stopRecording } = useVoiceRecorder();
  const { runQuery, isLoading, error, transcript, answer, contexts, latencies, guardrailStatus, pipelineSteps } = useRAGQuery();
  const [textInput, setTextInput] = useState('');

  // Automatically trigger query when audio recording finishes
  useEffect(() => {
    if (audioBlob) {
      runQuery(audioBlob);
    }
  }, [audioBlob, runQuery]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || isLoading) return;
    runQuery(null, textInput.trim());
    setTextInput('');
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <section id="voice-interface" className="relative py-24 border-y border-white/10 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 flex items-center justify-center gap-2 text-white">
            Interactive Voice Interface <Sparkles className="w-6 h-6 text-white" />
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            Click the microphone to speak your question, or type it below to trigger the grounding RAG pipeline.
          </p>
        </div>

        {/* Interface Card */}
        <div className="glass-panel p-8 mb-8">
          <div className="flex flex-col items-center justify-center py-6">

            {/* Microphone Button Container */}
            <div className="relative mb-6">
              {/* Outer Glass Ring */}
              <motion.div
                animate={{
                  boxShadow: isRecording
                    ? ['0 0 20px rgba(255,255,255,0.06)', '0 0 35px rgba(255,255,255,0.25)', '0 0 20px rgba(255,255,255,0.06)']
                    : '0 0 20px rgba(255,255,255,0.06)'
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="mic-outer-glass p-4 rounded-full"
              >
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={"flex items-center justify-center w-24 h-24 rounded-full transition-colors duration-300 focus:outline-none bg-black text-white hover:bg-neutral-950 " + (isLoading ? 'opacity-50 cursor-not-allowed' : '')}
                >
                  {isRecording ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
                </motion.button>
              </motion.div>
            </div>

            {/* Timer and Status text */}
            <div className="text-center mb-8">
              {isRecording ? (
                <div>
                  <span className="text-sm font-semibold text-white uppercase tracking-wider animate-pulse">Recording</span>
                  <p className="text-2xl font-mono text-white mt-1">{formatTime(recordingTime)}</p>
                </div>
              ) : isLoading ? (
                <div>
                  <span className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider animate-pulse">Processing Pipeline...</span>
                  <p className="text-[#A0A0A0] text-sm mt-1">Retrieving matching contexts</p>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">Ready to Speak</span>
                  <p className="text-xs text-[#A0A0A0]/60 mt-1">Uses Sarvam AI for Indian language transcriptions</p>
                </div>
              )}
            </div>

            {/* Simulated Live Waveform */}
            {isRecording && (
              <div className="wave-container mb-8">
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
              </div>
            )}
          </div>

          {/* Form Text input fallback */}
          <form onSubmit={handleTextSubmit} className="flex gap-3 max-w-lg mx-auto border-t border-white/10 pt-6">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isLoading || isRecording}
              placeholder="Or type your search query here..."
              className="flex-1 bg-white/5 border border-white/10 focus:border-white/35 rounded-xl px-4 py-3 text-white text-sm focus:outline-none placeholder-[#A0A0A0]/40 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || isRecording || !textInput.trim()}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-black font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all"
            >
              Send <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex gap-3 items-center"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Results area */}
        <AnimatePresence mode="wait">
          {(transcript || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >

              {/* Step list / Status Indicators */}
              <div className="glass-panel p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${pipelineSteps.stt === 'loading' ? 'bg-white animate-ping' :
                      pipelineSteps.stt === 'success' ? 'bg-[#5BE17C]' : 'bg-white/10'
                    }`}></div>
                  <div className="text-left">
                    <span className="block text-xs text-[#A0A0A0]">1. Speech-to-Text</span>
                    <span className="text-xs font-semibold text-white">
                      {pipelineSteps.stt === 'loading' ? 'Transcribing...' :
                        pipelineSteps.stt === 'success' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${pipelineSteps.embedding === 'loading' ? 'bg-white animate-ping' :
                      pipelineSteps.embedding === 'success' ? 'bg-[#5BE17C]' : 'bg-white/10'
                    }`}></div>
                  <div className="text-left">
                    <span className="block text-xs text-[#A0A0A0]">2. Vector Embedding</span>
                    <span className="text-xs font-semibold text-white">
                      {pipelineSteps.embedding === 'loading' ? 'Embedding...' :
                        pipelineSteps.embedding === 'success' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${pipelineSteps.retrieval === 'loading' ? 'bg-white animate-ping' :
                      pipelineSteps.retrieval === 'success' ? 'bg-[#5BE17C]' : 'bg-white/10'
                    }`}></div>
                  <div className="text-left">
                    <span className="block text-xs text-[#A0A0A0]">3. Qdrant Search</span>
                    <span className="text-xs font-semibold text-white">
                      {pipelineSteps.retrieval === 'loading' ? 'Searching...' :
                        pipelineSteps.retrieval === 'success' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${pipelineSteps.generation === 'loading' ? 'bg-white animate-ping' :
                      pipelineSteps.generation === 'success' ? 'bg-[#5BE17C]' : 'bg-white/10'
                    }`}></div>
                  <div className="text-left">
                    <span className="block text-xs text-[#A0A0A0]">4. LLM Response</span>
                    <span className="text-xs font-semibold text-white">
                      {pipelineSteps.generation === 'loading' ? 'Generating...' :
                        pipelineSteps.generation === 'success' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transcript Card */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] mb-2">Transcribed Query</h3>
                  <p className="text-white text-lg font-medium">"{transcript}"</p>
                </motion.div>
              )}

              {/* Answer Display */}
              {answer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-6 border-white/15 bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-white" /> Generated Answer
                    </h3>
                    {latencies && (
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#5BE17C]/15 border border-[#5BE17C]/25 text-[#5BE17C]">
                        Total Latency: {latencies.total_ms.toFixed(1)}ms
                      </span>
                    )}
                  </div>

                  {guardrailStatus?.blocked ? (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#D99A24]/10 border border-[#D99A24]/20 text-slate-300">
                      <AlertTriangle className="w-5 h-5 text-[#D99A24] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#D99A24] text-sm block mb-1">Guardrail Triggered: {guardrailStatus.reason}</span>
                        <p className="text-sm italic">"{answer}"</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white leading-relaxed">{answer}</p>
                  )}
                </motion.div>
              )}

              {/* Retrieved Context Cards */}
              {contexts && contexts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel p-6"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] mb-4">Retrieved Chunks (MSMARCO-XI Context)</h3>
                  <div className="space-y-4">
                    {contexts.map((ctx, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm hover:border-white/20 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono text-white font-semibold">Chunk #{idx + 1}</span>
                          <span className="text-xs text-[#A0A0A0]">FastEmbed Cosine Match</span>
                        </div>
                        <p className="text-slate-300 italic">"{ctx}"</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
