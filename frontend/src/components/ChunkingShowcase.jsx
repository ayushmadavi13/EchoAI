import React, { useState } from 'react';
import { Layers, Scissors, Columns, Hash } from 'lucide-react';

const CHUNKING_STRATEGIES = [
  {
    id: "semantic",
    icon: Scissors,
    title: "Semantic Splitter",
    desc: "Splits text using sentence-ending punctuation boundaries (.!?) rather than arbitrary character cuts, ensuring clean contexts.",
    benefit: "Prevents breaking words or sentence contexts across chunks, boosting LLM understanding accuracy."
  },
  {
    id: "overlap",
    icon: Columns,
    title: "Overlap Management",
    desc: "Maintains a sliding sentence buffer (e.g. 1-2 overlapping sentences) at boundaries to preserve sequential context.",
    benefit: "Guarantees no critical search terms are lost or split right at the edge of separate chunk documents."
  },
  {
    id: "metadata",
    icon: Hash,
    title: "Metadata-Aware Enrichment",
    desc: "Prepends original question terms and category structures directly to the vectors for richer indices.",
    benefit: "Aligns user query embeddings closer to vectors that may lack explicit keywords but contain the right concepts."
  }
];

const SAMPLE_TEXT = "Goa is a state on the southwestern coast of India within the Konkan region. It is geographically separated from the Deccan highlands by the Western Ghats. Panaji is the capital city of Goa. The state is famous for its beaches, places of worship and world heritage architecture.";

export default function ChunkingShowcase() {
  const [activeStrategy, setActiveStrategy] = useState("semantic");

  const renderChunkVisualization = () => {
    switch(activeStrategy) {
      case "semantic":
        return (
          <div className="space-y-4">
            <div className="p-3 rounded bg-white/5 border border-white/10 text-xs text-[#A0A0A0] font-mono">
              <span className="text-white font-semibold">[Chunk #1]</span> Goa is a state on the southwestern coast of India within the Konkan region. It is geographically separated from the Deccan highlands by the Western Ghats.
            </div>
            <div className="p-3 rounded bg-white/5 border border-white/10 text-xs text-[#A0A0A0] font-mono">
              <span className="text-white font-semibold">[Chunk #2]</span> Panaji is the capital city of Goa. The state is famous for its beaches, places of worship and world heritage architecture.
            </div>
          </div>
        );
      case "overlap":
        return (
          <div className="space-y-4">
            <div className="p-3 rounded bg-white/5 border border-white/10 text-xs text-[#A0A0A0] font-mono">
              <span className="text-white font-semibold">[Chunk #1]</span> Goa is a state on the southwestern coast of India within the Konkan region. <span className="text-white font-semibold underline underline-offset-4">It is geographically separated from the Deccan highlands by the Western Ghats.</span>
            </div>
            <div className="p-3 rounded bg-white/5 border border-white/10 text-xs text-[#A0A0A0] font-mono">
              <span className="text-white font-semibold">[Chunk #2]</span> <span className="text-white font-semibold underline underline-offset-4">It is geographically separated from the Deccan highlands by the Western Ghats.</span> Panaji is the capital city of Goa.
            </div>
          </div>
        );
      case "metadata":
        return (
          <div className="space-y-4">
            <div className="p-3 rounded bg-white/5 border border-white/10 text-xs text-[#A0A0A0] font-mono">
              <span className="text-white font-bold block mb-1">Prefix: [Source: MSMARCO-XI | Language: English | Query: capital city of Goa]</span>
              Panaji is the capital city of Goa. The state is famous for its beaches...
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="chunking-showcase" className="relative py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 flex items-center justify-center gap-2 text-white">
            Dataset Indexing & Chunking Strategy <Layers className="w-6 h-6 text-white" />
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            Advanced strategies applied to the MSMARCO-XI dataset to ensure semantic retrieval precision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Strategy Tabs */}
          <div className="lg:col-span-5 space-y-4">
            {CHUNKING_STRATEGIES.map((strat) => {
              const Icon = strat.icon;
              return (
                <button
                  key={strat.id}
                  onClick={() => setActiveStrategy(strat.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex gap-4 ${
                    activeStrategy === strat.id 
                      ? 'bg-white/5 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.02)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`p-3 rounded-lg h-fit ${
                    activeStrategy === strat.id ? 'bg-white/10 text-white' : 'bg-white/5 text-[#A0A0A0]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-base mb-1 ${activeStrategy === strat.id ? 'text-white' : 'text-[#A0A0A0]'}`}>
                      {strat.title}
                    </h3>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">{strat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Visualization Console */}
          <div className="lg:col-span-7 glass-panel p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase bg-white/10 px-2 py-0.5 rounded border border-white/15">
                Visual Simulator
              </span>
              
              {/* Original passage */}
              <div className="mt-6 mb-6">
                <h4 className="text-xs font-semibold text-[#A0A0A0] uppercase mb-2">Original Context Document</h4>
                <p className="text-sm text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5 italic">
                  "{SAMPLE_TEXT}"
                </p>
              </div>

              {/* Visualization output */}
              <div>
                <h4 className="text-xs font-semibold text-[#A0A0A0] uppercase mb-2">Resulting Vector Chunks</h4>
                {renderChunkVisualization()}
              </div>
            </div>

            {/* Strategy Benefit Box */}
            <div className="border-t border-white/10 pt-6 mt-8">
              <span className="text-xs text-[#A0A0A0] block mb-1">Retrieval Benefit</span>
              <p className="text-sm text-white font-medium">
                {CHUNKING_STRATEGIES.find(s => s.id === activeStrategy)?.benefit}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
