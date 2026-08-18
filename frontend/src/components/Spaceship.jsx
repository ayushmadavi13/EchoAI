import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Distinct spaceship designs & colors
const SHIP_TYPES = [
  {
    id: 'scout',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    plasmaColor: 'from-cyan-400 via-indigo-500',
    wingLightLeft: '#38BDF8',
    wingLightRight: '#F43F5E',
    canopyColor: '#38BDF8',
  },
  {
    id: 'interceptor',
    glowColor: 'rgba(236, 72, 153, 0.6)',
    plasmaColor: 'from-pink-500 via-purple-600',
    wingLightLeft: '#EC4899',
    wingLightRight: '#A855F7',
    canopyColor: '#EC4899',
  },
  {
    id: 'voyager',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    plasmaColor: 'from-emerald-400 via-teal-600',
    wingLightLeft: '#10B981',
    wingLightRight: '#3B82F6',
    canopyColor: '#10B981',
  }
];

export default function Spaceship() {
  const [ships, setShips] = useState([]);

  useEffect(() => {
    // Calculate exact rotation angle (degrees) based on trajectory (dx, dy)
    const calculateAngle = (startX, startY, endX, endY) => {
      // Convert vw/vh proportions approximately to pixel vectors
      const dx = (endX - startX) * (window.innerWidth / 100);
      const dy = (endY - startY) * (window.innerHeight / 100);
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    };

    const fleetConfig = [
      {
        id: 'ship-1',
        type: SHIP_TYPES[0],
        startX: -15,
        endX: 115,
        startY: 18,
        endY: 28,
        scale: 0.65,
        duration: 32,
        delay: 0
      },
      {
        id: 'ship-2',
        type: SHIP_TYPES[1],
        startX: 115,
        endX: -15,
        startY: 55,
        endY: 40,
        scale: 0.5,
        duration: 38,
        delay: 6
      },
      {
        id: 'ship-3',
        type: SHIP_TYPES[2],
        startX: -15,
        endX: 115,
        startY: 72,
        endY: 80,
        scale: 0.55,
        duration: 36,
        delay: 14
      }
    ];

    const processedFleet = fleetConfig.map(ship => ({
      ...ship,
      angle: calculateAngle(ship.startX, ship.startY, ship.endX, ship.endY)
    }));

    setShips(processedFleet);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ships.map((ship) => (
        <motion.div
          key={ship.id}
          initial={{
            x: `${ship.startX}vw`,
            y: `${ship.startY}vh`,
            rotate: ship.angle,
            scale: ship.scale,
            opacity: 0
          }}
          animate={{
            x: [`${ship.startX}vw`, `${ship.endX}vw`],
            y: [`${ship.startY}vh`, `${ship.endY}vh`],
            opacity: [0, 0.85, 0.85, 0]
          }}
          transition={{
            duration: ship.duration,
            repeat: Infinity,
            delay: ship.delay,
            ease: "linear"
          }}
          className="absolute top-0 left-0"
        >
          {/* Bobbing / Hover floating effect along flight vector */}
          <motion.div
            animate={{
              y: [-4, 4, -4]
            }}
            transition={{ duration: 3.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center"
          >
            {/* Plasma Flame Thruster Trail (Behind Engine at Left x=12) */}
            <div className="absolute right-[85%] top-1/2 -translate-y-1/2 flex items-center">
              <div className={`w-28 h-3 bg-gradient-to-l ${ship.type.plasmaColor} to-transparent rounded-full blur-sm opacity-80 animate-pulse`}></div>
              <div className="w-14 h-1 bg-white rounded-full -ml-8 blur-[1px]"></div>
            </div>

            {/* Futuristic Spaceship Graphic (Nose at Right x=115) */}
            <svg 
              width="90" 
              height="45" 
              viewBox="0 0 120 60" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: `drop-shadow(0 0 12px ${ship.type.glowColor})` }}
            >
              {/* Outer Shield */}
              <path 
                d="M110 30L80 10L30 20L10 30L30 40L80 50L110 30Z" 
                fill="rgba(255, 255, 255, 0.05)" 
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
              
              {/* Main Metallic Hull */}
              <path 
                d="M115 30L85 14C80 14 45 22 25 25L10 30L25 35C45 38 80 46 85 46L115 30Z" 
                fill="#0B0F19" 
                stroke="#E2E8F0" 
                strokeWidth="1.5"
              />

              {/* Top Wing */}
              <path 
                d="M75 16L45 5L35 22L70 20Z" 
                fill="#1E293B" 
                stroke="#94A3B8" 
                strokeWidth="1"
              />
              {/* Bottom Wing */}
              <path 
                d="M75 44L45 55L35 38L70 40Z" 
                fill="#1E293B" 
                stroke="#94A3B8" 
                strokeWidth="1"
              />

              {/* Glowing Cockpit Canopy */}
              <path 
                d="M95 30L75 22C70 22 65 26 65 30C65 34 70 38 75 38L95 30Z" 
                fill={ship.type.canopyColor} 
                fillOpacity="0.8"
                stroke="rgba(255, 255, 255, 0.8)" 
                strokeWidth="1"
              />

              {/* Wingtip Navigation Strobes */}
              <circle cx="45" cy="5" r="2.5" fill={ship.type.wingLightLeft} className="animate-ping" />
              <circle cx="45" cy="55" r="2.5" fill={ship.type.wingLightRight} className="animate-ping" />
              
              {/* Engine Exhaust Light */}
              <circle cx="12" cy="30" r="3.5" fill="#FFFFFF" />
            </svg>

          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
