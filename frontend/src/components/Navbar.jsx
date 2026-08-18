import React, { useState, useEffect } from 'react';
import { Mic, Github, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOnline, setIsOnline] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      const envUrl = import.meta.env.VITE_API_URL || '';
      const urlsToTry = envUrl 
        ? [`${envUrl}/health`, `${envUrl}/api/health`]
        : ['/health', '/api/health', 'http://127.0.0.1:8000/health', 'http://localhost:8000/health'];

      for (const url of urlsToTry) {
        try {
          const res = await fetch(url, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const data = await res.json();
              if (data && data.status === 'healthy') {
                setIsOnline(true);
                return;
              }
            }
          }
        } catch {
          // Ignore fetch error and check next URL
        }
      }
      setIsOnline(false);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-4 bg-black/75 backdrop-blur-md border-b border-white/10' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
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

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <a href="#voice-interface" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors">Query</a>
          <a href="#pipeline-visualizer" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors">Architecture</a>
          <a href="#latency-dashboard" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors">Latency</a>
        </div>

        {/* GitHub / Action Buttons */}
        <div className="flex items-center gap-3">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 hover:border-white/20 text-[#A0A0A0] hover:text-white transition-all duration-300 bg-white/5 backdrop-blur-sm"
          >
            <Github className="w-5 h-5" />
          </a>
          <span className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            isOnline === true 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : isOnline === false
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-white/5 border-white/15 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isOnline === true 
                ? 'bg-emerald-400 animate-pulse' 
                : isOnline === false
                ? 'bg-rose-400'
                : 'bg-slate-400 animate-ping'
            }`}></span>
            {isOnline === true ? 'Backend Online' : isOnline === false ? 'Backend Offline' : 'Checking Status'}
          </span>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 text-white bg-white/5 focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-b border-white/10 bg-black/90 backdrop-blur-xl overflow-hidden px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              <a 
                href="#voice-interface" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-200 hover:text-white py-2 border-b border-white/5"
              >
                Query Interface
              </a>
              <a 
                href="#pipeline-visualizer" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-200 hover:text-white py-2 border-b border-white/5"
              >
                Pipeline Architecture
              </a>
              <a 
                href="#latency-dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-200 hover:text-white py-2 border-b border-white/5"
              >
                Latency & Analytics
              </a>

              {/* Status Badge inside Mobile Drawer */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#A0A0A0]">System Status</span>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${
                  isOnline === true 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : isOnline === false
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-white/5 border-white/15 text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isOnline === true ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}></span>
                  {isOnline === true ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
