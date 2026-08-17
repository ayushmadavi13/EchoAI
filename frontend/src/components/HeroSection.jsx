import React from 'react';
import { ArrowRight, Volume2, Shield, Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
          <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-widest">
            ✦ Voice-Powered RAG
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8 text-white hero-title-glow">
          Ask. Speak. <br />
          Get grounded answers.
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl text-lg sm:text-xl text-[#A0A0A0] mb-10 leading-relaxed">
          Ask questions using your voice and get answers grounded in relevant retrieved knowledge from the MSMARCO-XI dataset in under 50ms.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a 
            href="#voice-interface" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black hover:bg-slate-100 font-bold text-base transition-all duration-300 group"
          >
            Start Voice Query 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a 
            href="#pipeline-visualizer" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-base backdrop-blur-md transition-all duration-300"
          >
            View System Architecture
          </a>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-left mt-6">
          <div className="glass-panel p-6 flex gap-4">
            <div className="p-3 h-fit rounded-lg bg-white/5 border border-white/10 text-white">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Speech-to-Text</h3>
              <p className="text-sm text-[#A0A0A0]">Real-time stream transcription calibrated for Indian languages.</p>
            </div>
          </div>

          <div className="glass-panel p-6 flex gap-4">
            <div className="p-3 h-fit rounded-lg bg-white/5 border border-white/10 text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Sub-50ms Pipeline</h3>
              <p className="text-sm text-[#A0A0A0]">FastEmbed and local Qdrant vectors eliminate external delays.</p>
            </div>
          </div>

          <div className="glass-panel p-6 flex gap-4">
            <div className="p-3 h-fit rounded-lg bg-white/5 border border-white/10 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Active Guardrails</h3>
              <p className="text-sm text-[#A0A0A0]">Smart filters block off-topic queries and verify factual grounding.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
