
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

  // Section 4 Quiz with persistence (q1 to q12)
  const [quizAnswers, setQuizAnswers] = useState(() => {
    const saved = localStorage.getItem('waves_quizAnswers');
    return saved ? JSON.parse(saved) : { 
      q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', q11: '', q12: '' 
    };
  });
  
  const [quizFeedback, setQuizFeedback] = useState(() => {
    const saved = localStorage.getItem('waves_quizFeedback');
    return saved ? JSON.parse(saved) : { 
      q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', q11: '', q12: '' 
    };
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
      case 'q9':
        msg = value === 'no' ? "Correct ! Une onde mécanique a besoin d'un support matériel pour se propager." : "Faux. Contrairement à la lumière, le son ne voyage pas dans le vide.";
        break;
      case 'q10':
        msg = value === 'prod' ? "Bravo ! v = λ * f (ou v = λ / T)." : "Erreur. v = λ / T, donc v = λ * f car f = 1/T.";
        break;
      case 'q11':
        msg = value === 'max' ? "Excellent ! L'amplitude est la valeur maximale de l'élongation par rapport à l'équilibre." : "Faux. C'est la hauteur maximale par rapport à la ligne médiane.";
        break;
      case 'q12':
        msg = value === 'period' ? "Oui ! Si la perturbation se répète à intervalles réguliers, l'onde est périodique." : "Non, vérifiez la définition d'un phénomène périodique.";
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
            <button onClick={resetProgress} className="px-4 py-2 bg-indigo-500/30 hover:bg-indigo-500/50 rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2">
              <i className="fas fa-undo"></i> Réinitialiser
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm mb-12">
        <div className="container mx-auto px-4 max-w-5xl flex gap-4 overflow-x-auto py-3">
          {[1, 2, 3, 4].map(part => (
            <button
              key={part}
              onClick={() => setActivePart(part)}
              className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap text-sm tracking-wide ${
                activePart === part ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
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
        {activePart === 1 && (
           <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="mb-8">
               <h2 className="text-3xl font-bold mb-3 flex items-center gap-4 text-indigo-900">
                 <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl text-xl shadow-lg shadow-indigo-100 italic">1</span>
                 Exploration des Phénomènes
               </h2>
               <p className="text-slate-500 leading-relaxed mb-8">
                 Une onde est la propagation d'une perturbation sans transport de matière. 
                 Observez ci-dessous la <strong>propagation circulaire</strong> à la surface de l'eau créée par une pointe.
               </p>
               
               <WaveCanvas 
                 type={WaveType.TRANSVERSE} 
                 isPlaying={isPlaying} 
                 frequency={0.5} 
                 amplitude={60} 
                 wavelength={150} 
               />
               
               <div className="mt-8 flex flex-col items-center gap-4">
                 <button 
                   onClick={() => setIsPlaying(!isPlaying)}
                   className={`px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl hover:-translate-y-1 ${
                     isPlaying ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-green-600 text-white hover:bg-green-700'
                   }`}
                 >
                   <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                   {isPlaying ? 'Arrêter la vibration' : 'Lancer la source'}
                 </button>
               </div>
             </div>

             <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border hover:border-indigo-200 transition-colors">
                  <h4 className="font-bold text-indigo-900 mb-2">Transversale</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">La perturbation est perpendiculaire à la propagation.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border hover:border-indigo-200 transition-colors">
                  <h4 className="font-bold text-indigo-900 mb-2">Longitudinale</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">La perturbation est parallèle à la propagation (ex: son).</p>
                </div>
             </div>
           </div>

           <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
               <i className="fas fa-edit text-indigo-400"></i> Vos observations
             </h3>
             <div className="overflow-hidden rounded-2xl border border-slate-200">
               <table className="w-full border-collapse">
                 <thead>
                   <tr className="bg-slate-50">
                     <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Type d'onde</th>
                     <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Perturbation</th>
                     <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Exemple</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td className="p-4 font-bold text-slate-700 border-b">Transversale</td>
                     <td className="p-4 border-b">
                       <select className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" value={answers1.transDirection} onChange={(e) => setAnswers1({...answers1, transDirection: e.target.value})}>
                         <option value="">...</option><option value="perpendicular">Perpendiculaire</option><option value="parallel">Parallèle</option>
                       </select>
                     </td>
                     <td className="p-4 border-b">
                       <input type="text" placeholder="ex: Corde" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" value={answers1.transExample} onChange={(e) => setAnswers1({...answers1, transExample: e.target.value})} />
                     </td>
                   </tr>
                   <tr>
                     <td className="p-4 font-bold text-slate-700">Longitudinale</td>
                     <td className="p-4">
                       <select className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" value={answers1.longDirection} onChange={(e) => setAnswers1({...answers1, longDirection: e.target.value})}>
                         <option value="">...</option><option value="perpendicular">Perpendiculaire</option><option value="parallel">Parallèle</option>
                       </select>
                     </td>
                     <td className="p-4">
                       <input type="text" placeholder="ex: Son" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" value={answers1.longExample} onChange={(e) => setAnswers1({...answers1, longExample: e.target.value})} />
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
                <p className="text-slate-500 leading-relaxed">Mesurez la période temporelle T et la longueur d'onde λ.</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-3">Périodicité temporelle (T)</h4>
                    <div className="relative"><input type="number" step="0.1" className="w-full p-4 pl-12 rounded-xl bg-white border outline-none font-bold" placeholder="T en s" value={périodeT} onChange={(e) => setPériodeT(e.target.value)} /><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-indigo-300">T=</span></div>
                  </div>
                  <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-3">Périodicité spatiale (λ)</h4>
                    <div className="relative"><input type="number" className="w-full p-4 pl-12 rounded-xl bg-white border outline-none font-bold" placeholder="λ en u" value={lambda} onChange={(e) => setLambda(e.target.value)} /><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-teal-300">λ=</span></div>
                  </div>
                </div>
                <WaveCanvas type={WaveType.TRANSVERSE} isPlaying={isPlaying} frequency={0.5} amplitude={50} wavelength={150} />
              </div>
              <div className="mt-10 p-8 bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden group">
                <h4 className="text-2xl font-bold mb-4 text-indigo-400">Relation : v = λ / T</h4>
                <div className="flex items-center justify-center py-6 bg-slate-800/50 rounded-2xl">
                   <input type="text" placeholder="λ / T" className="bg-transparent border-b-4 border-indigo-500 text-center text-4xl outline-none w-64 transition-all py-2 font-mono" value={relationV} onChange={(e) => setRelationV(e.target.value)} />
                </div>
              </div>
            </div>
          </section>
        )}

        {activePart === 3 && (
           <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
             <h2 className="text-3xl font-bold mb-8 text-indigo-900">3. Application Pratique</h2>
             <div className="bg-amber-50 border p-8 rounded-3xl mb-12"><p className="text-amber-800 font-medium">T = 2,0 s | λ = 30 cm (0,30 m). Calculez la célérité v.</p></div>
             <div className="grid lg:grid-cols-2 gap-10">
               <div className="space-y-8">
                 <div className="flex items-center gap-4 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                   <span className="font-extrabold text-2xl text-indigo-400">v =</span>
                   <input type="number" step="0.01" className="flex-1 p-3 rounded-xl bg-white border text-2xl font-bold text-indigo-700 outline-none" value={calcV.result} onChange={(e) => setCalcV({...calcV, result: e.target.value})} />
                   <span className="font-extrabold text-indigo-400 text-xl">m/s</span>
                 </div>
                 <div className="flex gap-4">
                   <button onClick={checkAnswer3} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl">Vérifier</button>
                   <button onClick={getAITutorHelp} className="px-6 bg-white text-indigo-600 py-4 rounded-2xl font-bold border shadow-sm"><i className="fas fa-robot"></i> Aide IA</button>
                 </div>
               </div>
               <div className="bg-slate-50 rounded-3xl p-8 flex items-center justify-center text-center italic text-slate-500">{feedback || "Avez-vous pensé à convertir λ en mètres ?"}</div>
             </div>
           </div>
         </section>
        )}

        {activePart === 4 && (
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h2 className="text-3xl font-bold mb-8 text-indigo-900 flex items-center gap-4">
                <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl text-xl shadow-lg italic">4</span>
                Quiz Complet Interactif
              </h2>

              <div className="space-y-12">
                {/* 1. Visual Lambda */}
                <div className="p-8 bg-slate-50 rounded-3xl border space-y-4">
                  <h3 className="font-bold text-lg">1. Identifiez λ sur ce schéma :</h3>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      {['A', 'B', 'C'].map(opt => (
                        <button key={opt} onClick={() => handleQuizSubmit('q4', opt)} className={`p-4 rounded-xl border-2 font-extrabold transition-all text-xl ${quizAnswers.q4 === opt ? (opt === 'B' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'bg-white hover:border-indigo-200 shadow-sm'}`}>{opt}</button>
                      ))}
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-2xl shadow-inner border max-w-sm">
                       <svg viewBox="0 0 400 200" className="w-full h-auto">
                        <path d="M 0,100 Q 50,20 100,100 T 200,100 T 300,100 T 400,100" fill="none" stroke="#6366f1" strokeWidth="4" />
                        <line x1="50" y1="100" x2="50" y2="20" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" /><text x="35" y="65" className="font-bold fill-red-600 text-sm">A</text>
                        <line x1="50" y1="10" x2="250" y2="10" stroke="#10b981" strokeWidth="3" /><text x="145" y="35" className="font-bold fill-green-700 text-sm">B</text>
                        <line x1="0" y1="100" x2="400" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>
                  {quizFeedback.q4 && <p className="text-sm font-bold text-indigo-600 italic">{quizFeedback.q4}</p>}
                </div>

                {/* Question Grid (Old + New) */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* q1 */}
                  <div className="p-6 bg-slate-50 rounded-2xl border space-y-4 shadow-sm">
                    <h3 className="font-bold">2. Si f double, λ est...</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {[{id:'half', l:'Divisée par 2'}, {id:'double', l:'Doublée'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q1', o.id)} className={`p-3 rounded-lg border text-sm font-bold ${quizAnswers.q1 === o.id ? (o.id==='half'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white hover:border-indigo-100'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q1 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q1}</p>}
                  </div>

                  {/* q7 */}
                  <div className="p-6 bg-slate-50 rounded-2xl border space-y-4 shadow-sm">
                    <h3 className="font-bold">3. Relation entre f et T ?</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {[{id:'f=T', l:'f = T'}, {id:'f=1/T', l:'f = 1 / T'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q7', o.id)} className={`w-full p-3 rounded-xl border text-sm font-bold ${quizAnswers.q7 === o.id ? (o.id==='f=1/T'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white hover:border-indigo-100'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q7 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q7}</p>}
                  </div>

                  {/* q8 */}
                  <div className="p-6 bg-slate-50 rounded-2xl border space-y-4 shadow-sm">
                    <h3 className="font-bold">4. Que transporte une onde ?</h3>
                    <div className="grid gap-2">
                       {[{id:'matter', l:'De la matière'}, {id:'no_transport', l:'Énergie sans matière'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q8', o.id)} className={`w-full p-3 rounded-xl border text-sm font-bold ${quizAnswers.q8 === o.id ? (o.id==='no_transport'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white hover:border-indigo-100'}`}>{o.l}</button>
                       ))}
                    </div>
                  </div>

                  {/* q9 (New) */}
                  <div className="p-6 bg-slate-50 rounded-2xl border space-y-4 shadow-sm">
                    <h3 className="font-bold">5. Onde mécanique dans le vide ?</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {[{id:'yes', l:'Possible'}, {id:'no', l:'Impossible'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q9', o.id)} className={`w-full p-3 rounded-xl border text-sm font-bold ${quizAnswers.q9 === o.id ? (o.id==='no'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white hover:border-indigo-100'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q9 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q9}</p>}
                  </div>

                  {/* q10 (New) */}
                  <div className="p-6 bg-slate-50 rounded-2xl border space-y-4 shadow-sm">
                    <h3 className="font-bold">6. Formule correcte de v :</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {[{id:'ratio', l:'v = λ / f'}, {id:'prod', l:'v = λ * f'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q10', o.id)} className={`w-full p-3 rounded-xl border text-sm font-bold ${quizAnswers.q10 === o.id ? (o.id==='prod'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white hover:border-indigo-100'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q10 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q10}</p>}
                  </div>

                  {/* q11 (New) */}
                  <div className="p-6 bg-slate-50 rounded-2xl border space-y-4 shadow-sm">
                    <h3 className="font-bold">7. L'amplitude A est...</h3>
                    <div className="grid gap-2">
                       {[{id:'dist', l:'Distance crête-creux'}, {id:'max', l:'L\'élongation maximale'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q11', o.id)} className={`w-full p-3 rounded-xl border text-sm font-bold ${quizAnswers.q11 === o.id ? (o.id==='max'?'bg-green-600 text-white':'bg-red-500 text-white') : 'bg-white hover:border-indigo-100'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q11 && <p className="text-[10px] font-bold text-indigo-600 italic">{quizFeedback.q11}</p>}
                  </div>

                  {/* q12 (New) */}
                  <div className="p-6 bg-slate-50 rounded-2xl border space-y-4 shadow-sm md:col-span-2">
                    <h3 className="font-bold">8. Une onde est périodique si la perturbation se répète...</h3>
                    <div className="grid grid-cols-2 gap-4">
                       {[{id:'random', l:'De façon aléatoire'}, {id:'period', l:'Identique à elle-même sur T'}].map(o => (
                         <button key={o.id} onClick={() => handleQuizSubmit('q12', o.id)} className={`w-full p-4 rounded-xl border font-bold text-left ${quizAnswers.q12 === o.id ? (o.id==='period'?'bg-green-600 text-white shadow-lg':'bg-red-500 text-white') : 'bg-white hover:border-indigo-200'}`}>{o.l}</button>
                       ))}
                    </div>
                    {quizFeedback.q12 && <p className="text-xs font-bold text-indigo-600 text-center">{quizFeedback.q12}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 translate-y-1/2"></div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-4">
                <i className="fas fa-tasks text-indigo-400"></i> Bilan de fin de séance
              </h3>
              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                  <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest">Auto-Évaluation</p>
                  <label className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded accent-indigo-500" />
                    <span className="text-slate-300">Je maîtrise les définitions d'ondes (transversale/longitudinale).</span>
                  </label>
                  <label className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded accent-indigo-500" />
                    <span className="text-slate-300">Je sais utiliser la relation fondamentale v = λ * f.</span>
                  </label>
                </div>
                <div>
                  <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-4">Note pour le tuteur</p>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 outline-none focus:ring-2 ring-indigo-500 transition-all" placeholder="Quels points méritent d'être approfondis ?" rows={4}></textarea>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <button disabled={activePart === 1} onClick={() => setActivePart(p => p - 1)} className="flex-1 md:flex-none px-6 py-3 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold disabled:opacity-30 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-arrow-left text-xs"></i> Précédent
            </button>
            {activePart < 4 ? (
              <button onClick={() => setActivePart(p => p + 1)} className="flex-[2] md:flex-none px-10 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-3">
                Suivant <i className="fas fa-arrow-right text-xs"></i>
              </button>
            ) : (
              <button className="flex-[2] md:flex-none px-10 py-3 rounded-2xl bg-green-600 text-white font-extrabold hover:bg-green-700 shadow-xl transition-all flex items-center justify-center gap-3" onClick={() => alert("Bravo ! séance terminée.")}>
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
