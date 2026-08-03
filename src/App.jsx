import React, { useState, useMemo } from 'react';
import { Camera, ZoomIn, Sun, Info, Maximize, Search, Clock, Zap, CheckCircle, Award } from 'lucide-react';

const App = () => {
  // Physical State (Initialized to "Perfect" parameters for 100% Quality)
  const [focalLength, setFocalLength] = useState(50); // mm
  const [apertureDiameter, setApertureDiameter] = useState(6.25); // mm -> f/8
  const [shutterSpeed, setShutterSpeed] = useState(1/64); // seconds -> 0 EV at f/8, ISO 100
  const [iso, setIso] = useState(100);

  // Calculated values
  const fNumber = useMemo(() => (focalLength / apertureDiameter).toFixed(1), [focalLength, apertureDiameter]);
  const magnification = useMemo(() => (focalLength / 50).toFixed(2), [focalLength]);
  
  // Exposure Value (EV) Calculation
  const exposureValue = useMemo(() => {
    const N = Number(fNumber);
    const t = shutterSpeed;
    const evAtIso100 = Math.log2((N * N) / t);
    const sceneEV = 12; // Reference brightness for a sunny day
    const isoShift = Math.log2(iso / 100);
    const result = sceneEV - (evAtIso100 - isoShift);
    return Math.max(-10, Math.min(10, result));
  }, [fNumber, shutterSpeed, iso]);

  // Quality Scoring Logic
  const qualityStats = useMemo(() => {
    const n = Number(fNumber);
    let score = 100;
    const reasons = [];

    if (iso > 100) {
      const penalty = Math.log2(iso / 100) * 10;
      score -= penalty;
      reasons.push({ label: "ISO Noise", severity: "med", detail: `ISO ${iso} adds digital grain.` });
    } else {
      reasons.push({ label: "Pristine ISO", severity: "good", detail: "Minimum noise at ISO 100." });
    }

    if (n < 2.8) {
      score -= 15;
      reasons.push({ label: "Lens Softness", severity: "med", detail: "Wide apertures (low f-stop) can be less sharp at edges." });
    } else if (n > 16) {
      score -= 20;
      reasons.push({ label: "Diffraction", severity: "high", detail: "Extremely small openings cause light wave diffraction (blur)." });
    } else if (n >= 5.6 && n <= 11) {
      reasons.push({ label: "Sharpness Sweet Spot", severity: "good", detail: "Lens is physically sharpest around f/8." });
    }

    const absEV = Math.abs(exposureValue);
    if (absEV > 0.3) {
      score -= absEV * 20;
      reasons.push({ label: "Exposure Clipping", severity: "high", detail: "Losing data in extreme highlights or shadows." });
    } else {
      reasons.push({ label: "Perfect Exposure", severity: "good", detail: "Capturing the full dynamic range of the sensor." });
    }

    return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
  }, [fNumber, iso, exposureValue]);

  const exposureStatus = useMemo(() => {
    if (exposureValue < -2) return "Severely Under-exposed";
    if (exposureValue < -0.4) return "Under-exposed";
    if (exposureValue > 2) return "Severely Over-exposed";
    if (exposureValue > 0.4) return "Over-exposed";
    return "Balanced Exposure";
  }, [exposureValue]);

  const blurFactor = useMemo(() => {
    const n = Number(fNumber);
    return Math.max(0.05, (10 / (n * n)));
  }, [fNumber]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <header className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Optics & Exposure Simulator
          </h1>
          <p className="text-slate-400 mt-2">Find the "Sweet Spot" for maximum image sharpness and quality.</p>
        </div>
        
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 min-w-[240px] shadow-2xl">
          <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
            <span>Dark (-3)</span>
            <span>Ideal (0)</span>
            <span>Bright (+3)</span>
          </div>
          <div className="relative h-6 bg-slate-800 rounded-full flex items-center px-1 border border-slate-700">
            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-600" />
            <div 
              className="absolute w-4 h-4 rounded-full shadow-lg transition-all duration-300 ease-out"
              style={{ 
                left: `${Math.min(Math.max(((exposureValue + 3) / 6) * 100, 5), 95)}%`,
                backgroundColor: exposureValue < -0.4 ? '#60a5fa' : exposureValue > 0.4 ? '#f87171' : '#10b981',
                transform: 'translateX(-50%)',
                boxShadow: exposureValue > -0.4 && exposureValue < 0.4 ? '0 0 10px #10b981' : 'none'
              }}
            />
          </div>
          <div className={`text-center text-[10px] mt-2 font-bold tracking-widest uppercase ${exposureValue < -0.4 ? 'text-blue-400' : exposureValue > 0.4 ? 'text-red-400' : 'text-emerald-400'}`}>
            {exposureStatus}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
               <Zap size={14} className="text-yellow-500"/> Exposure Settings
            </h2>
            <div className="space-y-10">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-red-400 font-bold text-sm">
                    <Sun size={18}/> Aperture (Iris)
                  </label>
                  <div className="font-mono text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-lg">
                    f / {fNumber}
                  </div>
                </div>
                <input 
                  type="range" min="2" max="32" step="0.1" 
                  value={apertureDiameter > 0 ? (focalLength / apertureDiameter) : 32} 
                  onChange={(e) => setApertureDiameter(focalLength / Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                    <Clock size={18}/> Shutter Speed
                  </label>
                  <div className="font-mono text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-lg">
                    1 / {Math.round(1/shutterSpeed)}s
                  </div>
                </div>
                <input 
                  type="range" min="1" max="2000" step="1" 
                  value={Math.round(1/shutterSpeed)} 
                  onChange={(e) => setShutterSpeed(1 / Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                    <Zap size={18}/> ISO Sensitivity
                  </label>
                  <div className="font-mono text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-lg">
                    {iso}
                  </div>
                </div>
                <input 
                  type="range" min="100" max="12800" step="100" 
                  value={iso} 
                  onChange={(e) => setIso(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
             <div className="flex justify-between items-center mb-4">
              <label className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest">
                <Search size={16}/> Focal Length (Zoom)
              </label>
              <span className="font-mono font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-700">{focalLength}mm</span>
            </div>
            <input 
              type="range" min="18" max="200" step="1" 
              value={focalLength} 
              onChange={(e) => {
                  const newFL = Number(e.target.value);
                  const currentF = Number(fNumber);
                  setFocalLength(newFL);
                  setApertureDiameter(newFL / currentF);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 p-4 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest">
                <Maximize size={16} />
                Live Sensor Preview
              </div>
              <div className="flex gap-2">
                {iso > 800 && <span className="text-[9px] text-yellow-500 font-black bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">NOISE DETECTED</span>}
                {qualityStats.score === 100 && <span className="text-[9px] text-emerald-400 font-black bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">OPTIMAL</span>}
              </div>
            </div>

            <div 
              className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center transition-all duration-500"
              style={{ filter: `brightness(${Math.pow(2, exposureValue)})` }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1200')`,
                  filter: `blur(${blurFactor * (focalLength/25)}px)`,
                  transform: `scale(${1 + (focalLength - 18) / 100})`,
                  opacity: 0.9
                }}
              />
              {iso > 200 && (
                 <div 
                    className="absolute inset-0 pointer-events-none mix-blend-screen opacity-10"
                    style={{ 
                      backgroundImage: `url('https://www.transparenttextures.com/patterns/asfalt-dark.png')`,
                      filter: `contrast(${1 + (iso/6400)})`
                    }} 
                  />
              )}
              <div className="relative z-10 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
            </div>
            
            <div className="mt-6 p-5 bg-slate-900 rounded-2xl space-y-5 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Award size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Image Quality Score</h3>
                  </div>
                </div>
                <div className="text-4xl font-black text-white tabular-nums">{qualityStats.score}%</div>
              </div>
              <div className="space-y-4">
                {qualityStats.reasons.map((reason, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    {reason.severity === 'good' ? (
                      <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full shrink-0 border-2 border-slate-900 ${reason.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-100">{reason.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{reason.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-800 text-center">
                <button 
                   onClick={() => {
                     setIso(100);
                     setApertureDiameter(6.25);
                     setShutterSpeed(1/64);
                     setFocalLength(50);
                   }}
                   className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest underline decoration-emerald-500/30 underline-offset-4"
                >
                  Reset to Optimal Physics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
