import React, { useState, useEffect } from 'react';
import { Mic, Github, Cpu } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-4 bg-black/60 backdrop-blur-md border-b border-white/10' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/15 p-[1px] group-hover:bg-white/10 transition-all duration-300">
            <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="flex items-center gap-1.5">
            Echo<span className="text-white font-extrabold">AI</span>
          </span>
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#voice-interface" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors">Query</a>
          <a href="#pipeline-visualizer" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors">Architecture</a>
          <a href="#latency-dashboard" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors">Latency</a>
          <a href="#chunking-showcase" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors">Chunking</a>
          <a href="#guardrails-panel" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors">Safety</a>
        </div>

        {/* GitHub / Action Buttons */}
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 hover:border-white/20 text-[#A0A0A0] hover:text-white transition-all duration-300 bg-white/5 backdrop-blur-sm"
          >
            <Github className="w-5 h-5" />
          </a>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" /> Task 2 Active
          </span>
        </div>
      </div>
    </nav>
  );
}
