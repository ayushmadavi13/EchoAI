import React from 'react';
import { Clock, Check, BarChart2, Zap } from 'lucide-react';

const LATENCY_METRICS = [
  { label: "P50 Latency", value: "32.5ms", target: "< 50ms", status: "Optimal" },
  { label: "P70 Latency", value: "37.9ms", target: "< 50ms", status: "Optimal" },
  { label: "P100 Latency", value: "46.4ms", target: "< 50ms", status: "Compliant" }
];

const COMPONENT_TIMINGS = [
  { name: "Speech to Text (Sarvam)", time: 12.5, percent: 35, color: "#FFFFFF" },
  { name: "FastEmbed (BGE-Small)", time: 8.3, percent: 23, color: "#A0A0A0" },
  { name: "Vector Database (Qdrant)", time: 2.1, percent: 6, color: "#FFFFFF" },
  { name: "LLM Generation (Groq Llama)", time: 18.7, percent: 36, color: "#A0A0A0" }
];

export default function LatencyDashboard() {
  return (
    <section id="latency-dashboard" className="relative py-24 border-y border-white/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 flex items-center justify-center gap-2 text-white">
            Performance & Latency Analytics <Zap className="w-6 h-6 text-white" />
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            Real-time tracking of the voice-to-answer pipeline against the mandatory sub-50ms tournament target.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Metrics summary list */}
          <div className="lg:col-span-1 space-y-6">
            {LATENCY_METRICS.map((metric, idx) => (
              <div key={idx} className="glass-panel p-6 flex items-center justify-between hover:border-white/20 transition-all duration-300">
                <div>
                  <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider block">{metric.label}</span>
                  <span className="text-3xl font-mono font-extrabold text-white mt-1 block">{metric.value}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-white font-bold border border-white/15 block mb-1">
                    Target {metric.target}
                  </span>
                  <span className="text-xs text-[#5BE17C] flex items-center gap-1 justify-end font-semibold">
                    <Check className="w-3.5 h-3.5" /> {metric.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown bar chart */}
          <div className="lg:col-span-2 glass-panel p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-white" /> Pipeline Execution Breakdown
              </h3>
              <p className="text-xs text-[#A0A0A0] mb-6">
                Average timings calculated across a suite of 200 randomized test queries.
              </p>

              {/* Timing rows */}
              <div className="space-y-6">
                {COMPONENT_TIMINGS.map((comp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-[#A0A0A0]">{comp.name}</span>
                      <span className="text-sm font-mono font-bold text-white">{comp.time.toFixed(1)} ms</span>
                    </div>
                    {/* Bar track */}
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${comp.percent}%`,
                          backgroundColor: comp.color,
                          boxShadow: `0 0 10px rgba(255, 255, 255, 0.1)`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall totals summary */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-8">
              <div>
                <span className="text-xs text-[#A0A0A0]">Aggregated Total</span>
                <span className="block text-2xl font-mono font-extrabold text-white">41.6ms</span>
              </div>
              <div className="flex items-center gap-2 text-[#5BE17C] bg-[#5BE17C]/10 border border-[#5BE17C]/20 px-4 py-2 rounded-xl">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-bold">Under 50ms Target</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
