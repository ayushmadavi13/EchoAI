import React from 'react';
import Starfield from './components/Starfield';
import Spaceship from './components/Spaceship';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import VoiceInterface from './components/VoiceInterface';
import PipelineVisualizer from './components/PipelineVisualizer';
import AgentSchedulerVisual from './components/AgentSchedulerVisual';

import Footer from './components/Footer';

export default function App() {
  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-white/20 selection:text-white">
      {/* Cinematic Starfield Background & Spaceship */}
      <Starfield />
      <Spaceship />
      
      {/* Very Subtle Dark Overlay to improve text readability */}
      <div className="fixed inset-0 bg-black/25 pointer-events-none -z-10"></div>
      
      <Navbar />
      <HeroSection />
      
      <main className="max-w-7xl mx-auto relative z-10">
        <VoiceInterface />
        <PipelineVisualizer />
        <AgentSchedulerVisual />

      </main>

      <Footer />
    </div>
  );
}
