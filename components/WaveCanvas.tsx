
import React, { useRef, useEffect, useState } from 'react';
import { WaveType } from '../types';

interface WaveCanvasProps {
  type: WaveType;
  isPlaying: boolean;
  frequency: number;
  amplitude: number;
  wavelength: number;
  showPoints?: boolean;
}

const WaveCanvas: React.FC<WaveCanvasProps> = ({ 
  type: initialType, 
  isPlaying, 
  frequency: initialFrequency, 
  amplitude: initialAmplitude, 
  wavelength,
  showPoints = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [currentType, setCurrentType] = useState<WaveType>(initialType);
  const [speed, setSpeed] = useState<number>(1.0);
  const [freq, setFreq] = useState<number>(initialFrequency);
  const [amp, setAmp] = useState<number>(initialAmplitude);

  // Sync canvas internal resolution with its display size
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const animate = () => {
    if (isPlaying) {
      // time in seconds, modified by speed factor
      timeRef.current += 0.016 * speed; 
    }
    draw();
    requestRef.current = requestAnimationFrame(animate);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const centerY = height / 2;
    const time = timeRef.current;
    
    ctx.clearRect(0, 0, width, height);

    // Responsive Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = Math.min(width, height) / 8;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const visualAmplitude = (amp / 400) * height;
    const visualWavelength = (wavelength / 800) * width;

    if (currentType === WaveType.TRANSVERSE) {
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = Math.max(2, height / 100);
      
      for (let x = 0; x < width; x++) {
        const y = centerY + visualAmplitude * Math.sin(2 * Math.PI * (time * freq - x / visualWavelength));
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (showPoints) {
        const pointX = width / 3;
        const pointY = centerY + visualAmplitude * Math.sin(2 * Math.PI * (time * freq - pointX / visualWavelength));
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(pointX, pointY, Math.max(4, height / 40), 0, Math.PI * 2);
        ctx.fill();
        
        const pointX2 = width * 0.6;
        const pointY2 = centerY + visualAmplitude * Math.sin(2 * Math.PI * (time * freq - pointX2 / visualWavelength));
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(pointX2, pointY2, Math.max(4, height / 40), 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const numSpires = Math.floor(width / 20);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = Math.max(1, height / 150);
      
      for (let i = 0; i < numSpires; i++) {
        const baseX = (i / numSpires) * width;
        const dx = (visualAmplitude * 0.8) * Math.sin(2 * Math.PI * (time * freq - baseX / visualWavelength));
        const x = baseX + dx;
        
        ctx.beginPath();
        ctx.moveTo(x, centerY - height * 0.1);
        ctx.lineTo(x, centerY + height * 0.1);
        ctx.stroke();

        if (showPoints && i === Math.floor(numSpires / 3)) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(x, centerY, Math.max(3, height / 60), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, freq, amp, speed, wavelength, currentType, dimensions]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="relative flex-1 aspect-[2/1] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block"
        />
        
        {/* Type Overlay Label */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm pointer-events-none">
          {currentType === WaveType.TRANSVERSE ? 'Onde Transversale' : 'Onde Longitudinale'}
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-64 space-y-4 p-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Type d'onde</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setCurrentType(WaveType.TRANSVERSE)}
              className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentType === WaveType.TRANSVERSE 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Transversale
            </button>
            <button 
              onClick={() => setCurrentType(WaveType.LONGITUDINAL)}
              className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentType === WaveType.LONGITUDINAL 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Longitudinale
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Célérité (v)</label>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">x{speed.toFixed(1)}</span>
            </div>
            <input 
              type="range" min="0.1" max="3.0" step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fréquence (f)</label>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">{freq.toFixed(1)} Hz</span>
            </div>
            <input 
              type="range" min="0.1" max="2.0" step="0.1"
              value={freq}
              onChange={(e) => setFreq(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amplitude (A)</label>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">{Math.round(amp)} u</span>
            </div>
            <input 
              type="range" min="10" max="80" step="1"
              value={amp}
              onChange={(e) => setAmp(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200">
           <p className="text-[9px] text-slate-400 leading-tight italic">
            La célérité influe sur la vitesse de défilement temporel de la perturbation sans changer sa forme spatiale.
           </p>
        </div>
      </div>
    </div>
  );
};

export default WaveCanvas;
