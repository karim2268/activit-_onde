
import React, { useState, useEffect } from 'react';
import WaveCanvas from './components/WaveCanvas';
import { WaveType } from './types';
import { GoogleGenAI } from "@google/genai";

// Initialize AI Tutor (Gemini)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const App: React.FC = () => {
  const [activePart, setActivePart] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Section 1 answers with persistence
  const [answers1, setAnswers1] = useState(() => {
    const saved = localStorage.getItem('waves_answers1');
    return saved ? JSON.parse(saved) : {
      transDirection: '',
      longDirection: '',
      transExample: '',
      longExample: ''
    };
  });

  // Section 2 measurements with persistence
  const [périodeT, setPériodeT] = useState(() => localStorage.getItem('waves_périodeT') || '');
  const [lambda, setLambda] = useState(() => localStorage.getItem('waves_lambda') || '');
  const [relationV, setRelationV] = useState(() => localStorage.getItem('waves_relationV') || '');

  // Section 3 exercise with persistence
  const [calcV, setCalcV] = useState(() => {
    const saved = localStorage.getItem('waves_calcV');
    return saved ? JSON.parse(saved) : { input: '', result: '' };
  });

  const [feedback, setFeedback] = useState<string>('');

  // Section 4 Quiz with persistence (q1 to q8)
  const [quizAnswers, setQuizAnswers] = useState(() => {
    const saved = localStorage.getItem('waves_quizAnswers');
    return saved ? JSON.parse(saved) : { q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '' };
  });
  
  const [quizFeedback, setQuizFeedback] = useState(() => {
    const saved = localStorage.getItem('waves_quizFeedback');
    return saved ? JSON.parse(saved) : { q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '' };
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('waves_answers1', JSON.stringify(answers1));
  }, [answers1]);

  useEffect(() => {
    localStorage.setItem('waves_périodeT', périodeT);
  }, [périodeT]);

  useEffect(() => {
    localStorage.setItem('waves_lambda', lambda);
  }, [lambda]);

  useEffect(() => {
    localStorage.setItem('waves_relationV', relationV);
  }, [relationV]);

  useEffect(() => {
    localStorage.setItem('waves_calcV', JSON.stringify(calcV));
  }, [calcV]);

  useEffect(() => {
    localStorage.setItem('waves_quizAnswers', JSON.stringify(quizAnswers));
  }, [quizAnswers]);

  useEffect(() => {
    localStorage.setItem('waves_quizFeedback', JSON.stringify(quizFeedback));
  }, [quizFeedback]);

  const checkAnswer3 = async () => {
    const val = parseFloat(calcV.result);
    if (Math.abs(val - 0.15) < 0.01) {
      setFeedback("Excellent ! v = λ / T = 0.30 / 2.0 = 0.15 m/s.");
    } else {
      setFeedback("Ce n'est pas tout à fait ça. Relis la relation v = λ / T et vérifie tes unités.");
    }
  };

  const getAITutorHelp = async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `L'élève travaille sur la célérité d'une onde. Données: T = 2.0s, λ = 30cm. 
        L'élève a entré le résultat: ${calcV.result}. 
        Explique-lui brièvement sans donner la réponse directement comment faire, en français.`,
      });
      setFeedback(response.text || "Erreur de connexion avec l'IA.");
    } catch (e) {
      setFeedback("L'IA est occupée, réessaie plus tard.");
    }
  };

  const handleQuizSubmit = (q: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [q]: value }));
    let msg = "";
    
    switch(q) {
      case 'q1':
        msg = value === 'half' ? "Correct ! λ = v / f, donc si f double, λ est divisée par 2." : "Faux. λ et f sont inversement proportionnelles.";
        break;
      case 'q2':
        msg = value.toLowerCase().trim() === 'hertz' || value.toLowerCase().trim() === 'hz' ? "Bravo ! L'unité est bien le Hertz (Hz)." : "Non, cherchez l'unité du nombre d'oscillations par seconde.";
        break;
      case 'q3':
        msg = value === 'long' ? "Exact ! Le son est une onde de compression-dilatation (longitudinale)." : "Incorrect. Les molécules d'air vibrent dans le sens de propagation.";
        break;
      case 'q4':
        msg = value === 'B' ? "Bravo ! Le segment B correspond bien à une longueur d'onde complète (entre deux sommets)." : "Incorrect. A est l'amplitude, C est une distance quelconque.";
        break;
      case 'q5':
        msg = value === 'AC' ? "Excellent ! Les points A et C sont distants d'une longueur d'onde (λ) et vibrent donc en phase." : "Faux. A et B sont en opposition de phase.";
        break;
      case 'q6':
        msg = value === 'medium' ? "Correct ! La célérité dépend des propriétés du milieu (rigidité, densité, etc.)." : "Faux. La célérité ne dépend pas de l'amplitude de la source.";
        break;
      case 'q7':
        msg = value === 'f=1/T' ? "Bien joué ! La fréquence est l'inverse de la période temporelle." : "Erreur. Vérifiez la définition de f en fonction de T.";
        break;
      case 'q8':
        msg = value === 'no_transport' ? "Exact ! Une onde transporte de l'énergie sans transport de matière à grande échelle." : "Non, rappelez-vous l'exemple du bouchon qui ne fait que monter et descendre.";
        break;
    }
    setQuizFeedback(prev => ({ ...prev, [q]: msg }));
  };

  const resetProgress = () => {
    if (window.confirm("Voulez-vous vraiment effacer toutes vos réponses ?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50 text-slate-900">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-12 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)]"></div>
        </div>
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-white">Physique Interactive</h1>
              <p className="text-indigo-100 text-lg flex items-center gap-2 font-medium opacity-90">
                <i className="fas fa-wave-square"></i>
                Les Ondes Progressives Sinusoïdales
              </p>
            </div>
            <button 
              onClick={resetProgress}
              className="px-4 py-2 bg-indigo-500/30 hover:bg-indigo-500/50 rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
            >
              <i className="fas fa-undo"></i> Réinitialiser
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm mb-12">
        <div className="container mx-auto px-4 max-w-5xl flex gap-4 overflow-x-auto py-3">
          {[1, 2, 3, 4].map(part => (
            <button
              key={part}
              onClick={() => setActivePart(part)}
              className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap text-sm tracking-wide ${
                activePart === part 
                ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg scale-105' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
              }`}
            >
              {part === 1 && '1. Observations'}
              {part === 2 && '2. Périodicités'}
              {part === 3 && '3. Calculs'}
              {part === 4 && '4. Quiz Complet'}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-4 max-w-5xl">
        {/* Sections 1, 2, 3 are kept the same for brevity as they were functional */}
        {activePart === 1 && (
           <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="mb-8">
               <h2 className="text-3xl font-bold mb-3 flex items-center gap-4 text-indigo-900">
                 <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl text-xl shadow-lg shadow-indigo-100 italic">1</span>
                 Deux types d'ondes fondamentaux
               </h2>
               <p className="text-slate-500 leading-relaxed">
                 Interagissez avec les simulations ci-dessous pour comprendre comment la matière se déplace par rapport à l'onde. Vos réponses sont sauvegardées automatiquement.
               </p>
             </div>
             
             <div className="space-y-12">
               <div>
                 <div className="flex justify-between items-end mb-4">
                   <h3 className="text-lg font-bold text-slate-800">Laboratoire de simulation</h3>
                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                       isPlaying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                     }`}
                   >
                     <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                     {isPlaying ? 'PAUSE' : 'REPRENDRE'}
                   </button>
                 </div>
                 
                 <WaveCanvas 
                   type={WaveType.TRANSVERSE} 
                   isPlaying={isPlaying} 
                   frequency={0.5} 
                   amplitude={40} 
                   wavelength={150} 
                 />
                 
                 <div className="mt-6 grid sm:grid-cols-2 gap-4">
                   <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-sm">
                     <p className="font-bold text-indigo-900 mb-1">Onde Transversale :</p>
                     <p className="text-slate-600">La perturbation est <strong>perpendiculaire</strong> à la direction de propagation (ex: corde, surface de l'eau).</p>
                   </div>
                   <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-sm">
                     <p className="font-bold text-indigo-900 mb-1">Onde Longitudinale :</p>
                     <p className="text-slate-600">La perturbation est <strong>parallèle</strong> à la direction de propagation (ex: son, ressort compressé).</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
               <i className="fas fa-edit text-indigo-400"></i> Vos conclusions
             </h3>
             <div className="overflow-hidden rounded-2xl border border-slate-200">
               <table className="w-full border-collapse">
                 <thead>
                   <tr className="bg-slate-50">
                     <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Type d'onde</th>
                     <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Perturbation vs Propagation</th>
                     <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Exemple</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr className="group">
                     <td className="p-4 font-bold text-slate-700 border-b border-slate-100">Transversale</td>
                     <td className="p-4 border-b border-slate-100">
                       <select 
                         className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all text-sm"
                         value={answers1.transDirection}
                         onChange={(e) => setAnswers1({...answers1, transDirection: e.target.value})}
                       >
                         <option value="">Sélectionner...</option>
                         <option value="parallel">Direction Parallèle</option>
                         <option value="perpendicular">Direction Perpendiculaire</option>
                       </select>
                     </td>
                     <td className="p-4 border-b border-slate-100">
                       <input 
                         type="text" 
                         placeholder="ex: corde, mer..."
                         className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all text-sm"
                         value={answers1.transExample}
                         onChange={(e) => setAnswers1({...answers1, transExample: e.target.value})}
                       />
                     </td>
                   </tr>
                   <tr className="group">
                     <td className="p-4 font-bold text-slate-700">Longitudinale</td>
                     <td className="p-4">
                        <select 
                         className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all text-sm"
                         value={answers1.longDirection}
                         onChange={(e) => setAnswers1({...answers1, longDirection: e.target.value})}
                       >
                         <option value="">Sélectionner...</option>
                         <option value="parallel">Direction Parallèle</option>
                         <option value="perpendicular">Direction Perpendiculaire</option>
                       </select>
                     </td>
                     <td className="p-4">
                       <input 
                         type="text" 
                         placeholder="ex: son, ressort..."
                         className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all text-sm"
                         value={answers1.longExample}
                         onChange={(e) => setAnswers1({...answers1, longExample: e.target.value})}
                       />
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>
         </section>
        )}
        {activePart === 2 && (
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-3 flex items-center gap-4 text-indigo-900">
                  <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl text-xl shadow-lg shadow-indigo-100 italic">2</span>
                  La double périodicité
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  Une onde sinusoïdale se répète à la fois dans le temps et dans l'espace. Vos relevés sont conservés.
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                    <h4 className="font-bold text-indigo-800 flex items-center gap-3 mb-3">
                      <i className="fas fa-clock text-indigo-500"></i> Périodicité temporelle (T)
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed italic">
                      Concentrez-vous sur le mouvement vertical du <strong>point rouge</strong>.
                    </p>
                    <div className="relative group">
                      <input 
                        type="number" 
                        step="0.1"
                        className="w-full p-4 pl-12 rounded-2xl bg-white border border-indigo-100 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-indigo-700 transition-all"
                        placeholder="Estimez T en secondes"
                        value={périodeT}
                        onChange={(e) => setPériodeT(e.target.value)}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-indigo-300">T =</span>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-indigo-300">s</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-2xl border border-teal-100 shadow-sm">
                    <h4 className="font-bold text-teal-800 flex items-center gap-3 mb-3">
                      <i className="fas fa-arrows-alt-h text-teal-500"></i> Périodicité spatiale (λ)
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed italic">
                      Mettez la simulation en pause pour mesurer λ.
                    </p>
                    <div className="relative group">
                      <input 
                        type="number" 
                        className="w-full p-4 pl-12 rounded-2xl bg-white border border-teal-100 focus:ring-4 focus:ring-teal-500/10 outline-none font-bold text-teal-700 transition-all"
                        placeholder="Mesurez λ en unités"
                        value={lambda}
                        onChange={(e) => setLambda(e.target.value)}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-teal-300">λ =</span>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-teal-300">u</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Atelier de mesure</span>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`px-6 py-2 rounded-xl font-bold text-white transition-all shadow-lg text-sm ${
                        isPlaying ? 'bg-orange-500 hover:bg-orange-600 hover:scale-105' : 'bg-green-500 hover:bg-green-600 hover:scale-105'
                      }`}
                    >
                      <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                      {isPlaying ? 'FIGER L\'INSTANT' : 'LECTURE'}
                    </button>
                  </div>
                  <WaveCanvas 
                    type={WaveType.TRANSVERSE} 
                    isPlaying={isPlaying} 
                    frequency={0.5} 
                    amplitude={50} 
                    wavelength={150} 
                  />
                </div>
              </div>

              <div className="mt-10 p-8 bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <i className="fas fa-microchip text-8xl"></i>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-indigo-400 flex items-center gap-3">
                  <i className="fas fa-link"></i> La relation fondamentale
                </h4>
                <div className="bg-slate-800/80 backdrop-blur p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-6 border border-slate-700/50">
                  <span className="text-4xl font-extrabold text-indigo-300 italic">v = </span>
                  <input 
                    type="text" 
                    placeholder="λ / T"
                    className="bg-transparent border-b-4 border-indigo-500 text-center text-4xl outline-none focus:border-white w-full sm:w-64 transition-all py-2 font-mono"
                    value={relationV}
                    onChange={(e) => setRelationV(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
        {activePart === 3 && (
           <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-indigo-900">
               <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl text-xl shadow-lg shadow-indigo-100 italic">3</span>
               Application Numérique
             </h2>

             <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl mb-12 relative">
               <div className="absolute top-0 left-0 -translate-x-3 -translate-y-3 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <i className="fas fa-exclamation-triangle"></i>
               </div>
               <h4 className="font-bold text-amber-900 text-xl mb-4">Énoncé du problème :</h4>
               <p className="text-amber-800 text-lg leading-relaxed font-medium">
                 Une onde sinusoïdale se propage à la surface de l'eau. Période 
                 <span className="bg-amber-200/50 px-2 py-0.5 rounded mx-1">T = 2,0 s</span>. 
                 Photographie : <span className="bg-amber-200/50 px-2 py-0.5 rounded mx-1">30 cm</span> entre deux crêtes.
               </p>
             </div>

             <div className="grid lg:grid-cols-2 gap-10">
               <div className="space-y-8">
                 <div className="grid sm:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">1. Période T</label>
                     <div className="relative">
                       <input 
                         type="text" 
                         className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 ring-indigo-500/10 outline-none font-bold"
                         placeholder="Valeur"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-300">s</span>
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">2. Longueur λ</label>
                     <div className="relative">
                       <input 
                         type="text" 
                         className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 ring-indigo-500/10 outline-none font-bold"
                         placeholder="Valeur en m"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-300">m</span>
                     </div>
                   </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100">
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">3. Calcul de la célérité v</label>
                   <div className="space-y-4">
                     <input 
                       type="text" 
                       className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 ring-indigo-500/10 outline-none font-mono text-sm"
                       placeholder="Détail du calcul (v = ...)"
                       value={calcV.input}
                       onChange={(e) => setCalcV({...calcV, input: e.target.value})}
                     />
                     <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                       <span className="font-extrabold text-2xl text-indigo-400">v =</span>
                       <input 
                         type="number" 
                         step="0.01"
                         className="flex-1 p-3 rounded-xl bg-white border border-indigo-200 focus:ring-4 ring-indigo-500/10 outline-none font-bold text-2xl text-indigo-700"
                         placeholder="Résultat"
                         value={calcV.result}
                         onChange={(e) => setCalcV({...calcV, result: e.target.value})}
                       />
                       <span className="font-extrabold text-indigo-400">m/s</span>
                     </div>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <button 
                     onClick={checkAnswer3}
                     className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                   >
                     Valider ma réponse
                   </button>
                   <button 
                     onClick={getAITutorHelp}
                     className="px-6 bg-white text-indigo-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all border-2 border-indigo-50 flex items-center gap-2 shadow-sm"
                   >
                     <i className="fas fa-robot"></i>
                     Aide IA
                   </button>
                 </div>
               </div>

               <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center shadow-inner">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl transition-all duration-500 ${
                   feedback.includes('Excellent') ? 'bg-green-500 text-white scale-110' : (feedback ? 'bg-indigo-600 text-white rotate-12' : 'bg-slate-200 text-slate-400')
                 }`}>
                   <i className={`fas ${feedback.includes('Excellent') ? 'fa-check' : (feedback ? 'fa-comment-dots' : 'fa-graduation-cap')}`}></i>
                 </div>
                 <h5 className="font-bold text-slate-800 text-xl mb-3">Tuteur IA</h5>
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[100px] flex items-center">
                   <p className="text-slate-600 text-base leading-relaxed italic text-sm">
                     {feedback || "Bonjour ! Je suis là pour t'aider si tu bloques. Tes données sont mémorisées localement."}
                   </p>
                 </div>
               </div>
             </div>
           </div>
         </section>
        )}

        {/* PART 4: INTERACTIVE QUIZ (Enhanced with visuals + more MCQs) */}
        {activePart === 4 && (
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-indigo-900">
                <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl text-xl shadow-lg shadow-indigo-100 italic">4</span>
                Quiz Interactif & Visuel
              </h2>

              <div className="space-y-12">
                {/* 1. Identifier Lambda (Visual) */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                  <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">1. Quel segment correspond à la longueur d'onde λ ?</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {['A', 'B', 'C'].map(opt => (
                          <button key={opt} onClick={() => handleQuizSubmit('q4', opt)}
                            className={`p-4 rounded-xl border-2 transition-all font-bold ${quizAnswers.q4 === opt ? (opt === 'B' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-white bg-white hover:border-indigo-200 shadow-sm'}`}
                          >Segment {opt}</button>
                        ))}
                      </div>
                      {quizFeedback.q4 && <p className={`text-sm font-bold ${quizFeedback.q4.startsWith('Bravo') ? 'text-green-600' : 'text-red-600'}`}>{quizFeedback.q4}</p>}
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-xl border flex items-center justify-center">
                       <svg viewBox="0 0 400 200" className="w-full h-auto max-w-sm">
                        <path d="M 0,100 Q 50,20 100,100 T 200,100 T 300,100 T 400,100" fill="none" stroke="#6366f1" strokeWidth="4" />
                        <line x1="50" y1="100" x2="50" y2="20" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" /><text x="35" y="65" className="font-bold fill-red-600 text-sm">A</text>
                        <line x1="50" y1="10" x2="250" y2="10" stroke="#10b981" strokeWidth="3" /><text x="145" y="35" className="font-bold fill-green-700 text-sm">B</text>
                        <line x1="150" y1="180" x2="250" y2="180" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2" /><text x="195" y="195" className="font-bold fill-amber-600 text-sm">C</text>
                        <line x1="0" y1="100" x2="400" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 2. Points en phase (Visual) */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                  <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">2. Quels points vibrent en phase ?</h3>
                      <div className="grid gap-3">
                        {[{ id: 'AB', label: 'A et B' }, { id: 'BC', label: 'B et C' }, { id: 'AC', label: 'A et C' }].map(opt => (
                          <button key={opt.id} onClick={() => handleQuizSubmit('q5', opt.id)}
                            className={`p-4 text-left rounded-xl border-2 transition-all font-bold ${quizAnswers.q5 === opt.id ? (opt.id === 'AC' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-white bg-white hover:border-indigo-200 shadow-sm'}`}
                          >{opt.label}</button>
                        ))}
                      </div>
                      {quizFeedback.q5 && <p className={`text-sm font-bold ${quizFeedback.q5.startsWith('Excellent') ? 'text-green-600' : 'text-red-600'}`}>{quizFeedback.q5}</p>}
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-xl border flex items-center justify-center">
                      <svg viewBox="0 0 400 200" className="w-full h-auto max-w-sm">
                        <path d="M 0,100 Q 50,20 100,100 T 200,100 T 300,100 T 400,100" fill="none" stroke="#6366f1" strokeWidth="4" />
                        <circle cx="50" cy="20" r="7" fill="#ef4444" /><text x="45" y="15" className="font-bold fill-slate-800">A</text>
                        <circle cx="150" cy="180" r="7" fill="#3b82f6" /><text x="145" y="195" className="font-bold fill-slate-800">B</text>
                        <circle cx="250" cy="20" r="7" fill="#ef4444" /><text x="245" y="15" className="font-bold fill-slate-800">C</text>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 3. Text Questions grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Q1: Frequency doubling */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800">3. Si la fréquence double, λ est...</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {[{id:'half', l:'Divisée par 2'}, {id:'double', l:'Doublée'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q1', o.id)} className={`p-3 rounded-lg border text-sm font-bold ${quizAnswers.q1 === o.id ? (o.id==='half'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q1 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q1}</p>}
                  </div>

                  {/* Q2: Unit */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800">4. Unité de la fréquence ?</h3>
                    <input type="text" className="w-full p-4 rounded-xl border outline-none font-bold" placeholder="Symbole ou nom..." onBlur={(e) => handleQuizSubmit('q2', e.target.value)} />
                    {quizFeedback.q2 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q2}</p>}
                  </div>

                  {/* Q6: Celerity influence (New MCQ) */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800">5. La célérité d'une onde dépend...</h3>
                    <div className="space-y-2">
                       {[{id:'source', l:'De la source'}, {id:'medium', l:'Du milieu de propagation'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q6', o.id)} className={`w-full p-3 rounded-xl border text-sm font-bold text-left ${quizAnswers.q6 === o.id ? (o.id==='medium'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q6 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q6}</p>}
                  </div>

                  {/* Q7: Frequency definition (New MCQ) */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800">6. La relation entre f et T est :</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {[{id:'f=T', l:'f = T'}, {id:'f=1/T', l:'f = 1 / T'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q7', o.id)} className={`w-full p-3 rounded-xl border text-sm font-bold ${quizAnswers.q7 === o.id ? (o.id==='f=1/T'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q7 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q7}</p>}
                  </div>

                  {/* Q8: Wave transport (New MCQ) */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 md:col-span-2">
                    <h3 className="font-bold text-slate-800">7. Que transporte une onde mécanique progressive ?</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                       {[{id:'matter', l:'De la matière uniquement'}, {id:'no_transport', l:'De l\'énergie sans transport de matière'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q8', o.id)} className={`w-full p-4 rounded-xl border font-bold text-left ${quizAnswers.q8 === o.id ? (o.id==='no_transport'?'bg-green-600 text-white shadow-lg':'bg-red-500 text-white') : 'bg-white hover:border-indigo-200'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q8 && <p className="text-xs font-bold text-indigo-600 text-center">{quizFeedback.q8}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Bilan de la Séance */}
            <div className="bg-indigo-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 translate-y-1/2"></div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-4">
                <i className="fas fa-tasks text-indigo-400"></i> Bilan de la séance
              </h3>
              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                  <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest">Maîtrise du cours</p>
                  <label className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded accent-indigo-500" />
                    <span className="text-slate-300">Je sais identifier les caractéristiques d'une onde sur un graphe.</span>
                  </label>
                  <label className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded accent-indigo-500" />
                    <span className="text-slate-300">Je comprends le lien entre λ, f et T.</span>
                  </label>
                </div>
                <div>
                  <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-4">Questions pour le prof</p>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 outline-none focus:ring-2 ring-indigo-500 transition-all" placeholder="Qu'est-ce qui reste difficile pour toi ?" rows={4}></textarea>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="hidden md:flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Votre avancée</span>
            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden flex">
              {[1, 2, 3, 4].map(p => (
                <div key={p} className={`flex-1 h-full transition-all duration-700 border-r border-white last:border-0 ${activePart >= p ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button disabled={activePart === 1} onClick={() => setActivePart(p => p - 1)} className="flex-1 md:flex-none px-6 py-3 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold disabled:opacity-30 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-arrow-left text-xs"></i> Précédent
            </button>
            {activePart < 4 ? (
              <button onClick={() => setActivePart(p => p + 1)} className="flex-[2] md:flex-none px-10 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                Suivant <i className="fas fa-arrow-right text-xs"></i>
              </button>
            ) : (
              <button className="flex-[2] md:flex-none px-10 py-3 rounded-2xl bg-green-600 text-white font-extrabold hover:bg-green-700 shadow-xl shadow-green-100 hover:-translate-y-1 transition-all flex items-center justify-center gap-3" onClick={() => alert("Bravo ! Vous avez complété ce parcours interactif.")}>
                Terminer la séance <i className="fas fa-graduation-cap"></i>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
