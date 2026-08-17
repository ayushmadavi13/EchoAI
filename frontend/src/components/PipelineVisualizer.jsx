import React from 'react';
import { Mic, Speech, Cpu, Database, ShieldAlert, Sparkles, Binary } from 'lucide-react';

const STEPS = [
  {
    icon: Mic,
    title: "Audio Input",
    desc: "Browser capturing",
    tech: "MediaRecorder API"
  },
  {
    icon: Speech,
    title: "Speech to Text",
    desc: "Real-time stream",
    tech: "Sarvam AI / ElevenLabs"
  },
  {
    icon: Binary,
    title: "Embedding Engine",
    desc: "Local vectorization",
    tech: "FastEmbed (BGE-Small)"
  },
  {
    icon: Database,
    title: "Vector Retrieval",
    desc: "Top-k nearest matching",
    tech: "Qdrant Client (<2ms)"
  },
  {
    icon: ShieldAlert,
    title: "Guardrails Panel",
    desc: "Content filter & checks",
    tech: "Llama 3 Classifiers"
  },
  {
    icon: Sparkles,
    title: "LLM Generation",
    desc: "Grounded context prompt",
    tech: "Groq (Llama 3.1 8B)"
  }
];

export default function PipelineVisualizer() {
  return (
    <section id="pipeline-visualizer" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white">
            Visual Pipeline Architecture
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            EchoAI's structured model harness connects recording to vector storage and response generation.
          </p>
        </div>

        {/* Pipeline Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
          
          {/* Connector Line Background */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-white/10 -translate-y-1/2 -z-10"></div>
          
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="glass-panel p-6 flex flex-col items-center text-center relative hover:-translate-y-1 duration-300"
              >
                {/* Index Counter */}
                <div className="absolute top-3 left-3 font-mono text-xs font-bold text-slate-500">
                  {idx + 1}
                </div>

                {/* Icon Wrapper */}
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                  <Icon className="w-5 h-5" />
                </div>

                {/* Labels */}
                <h3 className="font-bold text-sm text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-[#A0A0A0] mb-3 leading-relaxed">{step.desc}</p>
                
                {/* Tech Badge */}
                <span className="mt-auto px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-[#A0A0A0]">
                  {step.tech}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom stats callout */}
        <div className="mt-12 glass-panel p-6 border-white/10 bg-white/[0.01] text-center max-w-2xl mx-auto">
          <p className="text-sm text-slate-300">
            💡 <span className="font-semibold text-white">Engineering Note:</span> Running FastEmbed and Qdrant locally avoids network roundtrips, allowing the retrieval + database layer to execute in <span className="text-white font-bold">&lt;10ms</span>.
          </p>
        </div>

      </div>
    </section>
  );
}
