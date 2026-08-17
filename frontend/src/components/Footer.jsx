import React from 'react';
import { Mic, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative py-12 border-t border-white/10 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/15 p-[1px]">
            <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="font-bold text-white text-base">
            Echo<span className="text-white">AI</span>
          </span>
        </div>

        {/* Campaign Hashtag */}
        <div className="text-center">
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-mono font-bold tracking-widest text-white uppercase">
            #RAGInGoa
          </span>
        </div>

        {/* Socials / Github */}
        <div className="flex items-center gap-4">
          <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
          <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} EchoAI. Built for HH Goa 2026 Shortlisting Task 2. All rights reserved.
      </div>
    </footer>
  );
}
