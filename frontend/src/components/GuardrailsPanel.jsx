import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, HeartCrack, EyeOff, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

const GUARDRAIL_TYPES = [
  {
    icon: ShieldCheck,
    title: "Off-Topic Boundaries",
    desc: "Classifies query intent (GREETING, QUESTION, OUT_OF_CONTEXT) before running search to avoid wasting computational power."
  },
  {
    icon: Ban,
    title: "Safety Filtering",
    desc: "Filters queries regarding malicious acts, system exploit hacks, violence, or sensitive details."
  },
  {
    icon: EyeOff,
    title: "Hallucination Checks",
    desc: "Analyzes final response generation against source vector contexts to verify complete alignment and factual grounding."
  }
];

const GUARDRAIL_LOGS = [
  {
    query: "Can you give me a code to hack a wifi router?",
    type: "Unsafe Input",
    action: "Blocked",
    color: "text-[#D99A24] bg-[#D99A24]/10 border-[#D99A24]/20"
  },
  {
    query: "What is the recipe for making butter chicken?",
    type: "Off-Topic",
    action: "Answer Refused",
    color: "text-[#D99A24] bg-[#D99A24]/10 border-[#D99A24]/20"
  },
  {
    query: "Where did Modi go for vacation last weekend?",
    type: "Context Grounding",
    action: "Refused (Not Grounded)",
    color: "text-white bg-white/5 border-white/10"
  }
];

export default function GuardrailsPanel() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="guardrails-panel" className="relative py-24 border-t border-white/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 flex items-center justify-center gap-2 text-white">
            Safety Guardrails & Content Policy <Shield className="w-6 h-6 text-white" />
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            Ensuring EchoAI knows when <span className="text-white font-semibold">not to answer</span> to protect brand guidelines and user security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List of guardrail details */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-6 space-y-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Active System Guardrails</h3>
            {GUARDRAIL_TYPES.map((guard, idx) => {
              const Icon = guard.icon;
              return (
                <motion.div 
                  key={idx} 
                  variants={itemVariants}
                  whileHover={{ x: 5, borderColor: 'rgba(255,255,255,0.2)' }}
                  className="glass-panel p-5 border-white/5 transition-all flex gap-4"
                >
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white h-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white mb-1">{guard.title}</h4>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">{guard.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Logs of guardrail executions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 glass-panel p-8 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" /> Guardrail Trigger History
              </h3>
              <p className="text-xs text-[#A0A0A0] mb-6">
                Evaluation results showing automated safety overrides during pipeline execution.
              </p>

              {/* Logs */}
              <div className="space-y-4">
                {GUARDRAIL_LOGS.map((log, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block mb-1">Query: "{log.query}"</span>
                      <span className="text-xs font-mono text-[#A0A0A0]">Category: {log.type}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border h-fit text-center ${log.color}`}>
                      {log.action}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Guardrail Policy Disclaimer */}
            <div className="border-t border-white/10 pt-6 mt-8">
              <span className="text-xs text-[#A0A0A0] block mb-1">Policy Guideline</span>
              <p className="text-sm text-slate-300">
                To guarantee zero hallucinations, EchoAI triggers an explicit context match score threshold. If target document grounding scores fall below <span className="text-white font-bold">0.72 Cosine similarity</span>, content generation is suppressed.
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
