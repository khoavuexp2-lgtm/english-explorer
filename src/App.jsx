import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, 
  Volume2, Trophy, Zap, PlayCircle, Users, X, User, Shield, 
  ArrowRight, Globe, MessageCircle, Mic, Compass, Rocket, 
  TreePine, Anchor, Fingerprint, LogOut, Flame, Heart, 
  AlertCircle, Check, Crown, ShieldAlert, BookOpen, Library,
  Dumbbell, Swords, Play, Timer, Medal, Headphones, PenTool, 
  Mail, Phone, RotateCw, Gamepad2, Sparkles, Loader2, Code,
  Bot, Cpu, Clock, LayoutGrid
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

let firebaseConfig = {};
try {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
} catch (error) {
  console.warn("Running in Preview Mode. .env variables not found.");
}

let app, auth, db;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.warn("Firebase config error:", error);
}

const globalStyles = `
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  .animate-shake { animation: shake 0.4s ease-in-out; }
  @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  .animate-float { animation: float 3s ease-in-out infinite; }
  @keyframes pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
  .animate-pulse-ring { animation: pulse-ring 2s infinite; }
  @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
  @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  .animate-bounce-short { animation: bounce-short 1.5s ease-in-out infinite; }
  @keyframes timer-shrink { from { width: 100%; } to { width: 0%; } }
  .animate-timer { animation: timer-shrink linear forwards; }
`;

const MOTIVATIONAL_QUOTES = [
  { text: "Every mistake is a step forward!", icon: Sparkles, color: "text-yellow-400" },
  { text: "You are a vocabulary ninja!", icon: Swords, color: "text-blue-400" },
  { text: "Practice makes perfect!", icon: Trophy, color: "text-emerald-400" },
  { text: "Keep pushing your limits!", icon: Rocket, color: "text-orange-400" },
  { text: "English is your superpower!", icon: Zap, color: "text-purple-400" }
];

// ALL GRADES UNLOCKED AS REQUESTED
const GRADES = [
  { id: 'g1', name: "Grade 1", desc: "Phonics & Words", locked: false, color: "from-emerald-400 to-teal-500", icon: Zap },
  { id: 'g2', name: "Grade 2", desc: "Basic Phrases", locked: false, color: "from-blue-400 to-cyan-500", icon: Shield },
  { id: 'g3', name: "Grade 3", desc: "Beginner Sentences", locked: false, color: "from-amber-400 to-orange-500", icon: LayoutGrid },
  { id: 'g4', name: "Grade 4", desc: "Intermediate", locked: false, color: "from-rose-400 to-pink-500", icon: BookOpen },
  { id: 'g5', name: "Grade 5", desc: "Advanced Master", locked: false, color: "from-purple-500 to-indigo-600", icon: Crown },
];

const MAP_THEMES = {
  ocean: { bg: "from-[#0891b2] to-[#1e3a8a]", vehicle: "⛵", pathColor: "rgba(255,255,255,0.4)" },
  space: { bg: "from-[#0f172a] to-[#312e81]", vehicle: "🚀", pathColor: "rgba(255,255,255,0.2)" },
  forest: { bg: "from-[#14532d] to-[#064e3b]", vehicle: "🚙", pathColor: "rgba(255,255,255,0.3)" }
};

const GRADE_UNITS = [
  { id: 'u1', name: "Unit 1", title: "What's your address?", status: 'active', theme: 'ocean', progress: 0 },
  { id: 'u2', name: "Unit 2", title: "I always get up early", status: 'active', theme: 'forest', progress: 0 },
  { id: 'u3', name: "Unit 3", title: "Where did you go on holiday?", status: 'active', theme: 'space', progress: 0 },
];

const playAudio = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

const evaluateSpeech = (transcript, target) => {
  const cleanTranscript = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const cleanTarget = target.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  if (cleanTranscript === cleanTarget) return { pass: true, msg: "Perfect pronunciation!" };
  if (cleanTranscript.includes('bag') && cleanTarget.includes('big')) return { pass: false, msg: "You pronounced 'bag' instead of 'big'. Try a short /ɪ/ sound!" };
  return { pass: false, msg: `System heard: "${transcript}". Not quite right, try again!` };
};

const syncUserWithDb = async (googleUser) => {
  if (!db) return null;
  const defaultInventory = { stars: 0, flames: 0, lives: 5 };
  const defaultName = googleUser.displayName || "Explorer";
  const defaultAvatar = googleUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultName}`;

  try {
    const userRef = doc(db, "users", googleUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        name: data.name || defaultName,
        avatar: data.avatar || defaultAvatar,
        role: data.role || "student",
        inventory: data.inventory || defaultInventory,
        completedUnits: data.completedUnits || []
      };
    } else {
      const newUser = { uid: googleUser.uid, name: defaultName, email: googleUser.email, role: "student", avatar: defaultAvatar, status: "active", inventory: defaultInventory, completedUnits: [] };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error) {
    console.error("Firestore sync error:", error);
    return { uid: googleUser.uid, name: defaultName, role: "student", avatar: defaultAvatar, inventory: defaultInventory, completedUnits: [] };
  }
};

const TopMetricsBar = ({ user }) => (
  <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center z-40 relative shadow-lg shrink-0">
    <div className="flex gap-3">
      <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
         <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
         <span className="text-white font-black">{user?.inventory?.stars || 0}</span>
      </div>
      <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
         <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce-short" />
         <span className="text-white font-black">{user?.inventory?.lives ?? 5}</span>
      </div>
    </div>
    <div className="flex items-center gap-3 text-right">
      <div className="hidden sm:block">
        <h2 className="text-white font-black text-lg leading-tight">{user?.name || "Explorer"}</h2>
        <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">{user?.role || "STUDENT"}</span>
      </div>
      <img src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=Explorer`} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-md bg-slate-800" alt="avatar" />
    </div>
  </div>
);

// CENTRALIZED FALLBACK MODAL FOR MISSING DATA
const UnderConstructionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-slate-200">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <Cpu className="w-10 h-10 text-blue-500 animate-bounce" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Under Construction!</h3>
        <p className="text-slate-600 font-medium mb-8">This module is currently being built and updated by our academic team. Data is not yet available on the Cloud.</p>
        <button onClick={onClose} className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 transition-all">
          GOT IT
        </button>
      </div>
    </div>
  );
};

const GameModal = ({ isOpen, onClose, station, onWin, user, updateUser, currentUnitData }) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [orderedWords, setOrderedWords] = useState([]);
  const [status, setStatus] = useState('playing'); 
  const [feedbackMsg, setFeedbackMsg] = useState("");
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    setQIndex(0); setStatus('playing'); setFeedbackMsg("");
    setSelectedOpt(null); setOrderedWords([]); setTranscript("");
  }, [station, isOpen]);

  let qList = (station && currentUnitData) ? currentUnitData[station.type] : null;
  if (qList && !Array.isArray(qList)) qList = [qList]; 
  const qData = qList ? qList[qIndex] : null;

  useEffect(() => {
    if (status === 'correct' && qData?.type === 'order') playAudio(qData.answer);
  }, [status, qData]);

  useEffect(() => {
    if (qData?.type === 'speak') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onresult = (event) => {
          const spokenText = event.results[0][0].transcript;
          setTranscript(spokenText);
          handleVoiceCheck(spokenText);
          setIsListening(false);
        };
        recognitionRef.current.onerror = (event) => {
          setFeedbackMsg("Mic Error: " + event.error); setIsListening(false); setStatus('wrong');
        };
      }
    }
  }, [qData]);

  if (!isOpen || !station) return null;

  // Failsafe: if data missing inside the station
  if (!qData) {
    return <UnderConstructionModal isOpen={true} onClose={onClose} />;
  }

  const toggleListen = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } 
    else { setTranscript(""); setStatus('playing'); recognitionRef.current?.start(); setIsListening(true); }
  };

  const deductLife = () => {
    if (user && updateUser && (user.inventory?.lives ?? 0) > 0) {
       updateUser({...user, inventory: {...user.inventory, lives: user.inventory.lives - 1}});
    }
  }

  const handleVoiceCheck = (spokenText) => {
    const evaluation = evaluateSpeech(spokenText, qData.targetText);
    setFeedbackMsg(evaluation.msg);
    if (evaluation.pass) setStatus('correct');
    else { setStatus('wrong'); deductLife(); }
  };

  const handleSelectOption = (opt) => { setSelectedOpt(opt); playAudio(opt); };

  const handleCheck = () => {
    if (['multiple-choice', 'listen-fill', 'read'].includes(qData.type)) {
      if (selectedOpt === qData.answer) { setStatus('correct'); setFeedbackMsg("Excellent!"); }
      else { setStatus('wrong'); setFeedbackMsg(qData.explain); deductLife(); }
    } else if (qData.type === 'order') {
      if (orderedWords.join(" ") === qData.answer) { setStatus('correct'); setFeedbackMsg("Perfect!"); }
      else { setStatus('wrong'); setFeedbackMsg(qData.explain); deductLife(); }
    }
  };

  const handleOrderWord = (w) => {
    if (orderedWords.includes(w)) setOrderedWords(orderedWords.filter(x => x !== w));
    else { setOrderedWords([...orderedWords, w]); playAudio(w); }
  };

  const handleContinue = () => {
    if (status === 'correct') {
      if (qIndex < qList.length - 1) {
        setQIndex(p => p + 1); setStatus('playing'); setFeedbackMsg("");
        setSelectedOpt(null); setOrderedWords([]); setTranscript("");
      } else { onWin(); }
    } else { setSelectedOpt(null); setOrderedWords([]); setStatus('playing'); setTranscript(""); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {(user?.inventory?.lives ?? 5) <= 0 ? (
        <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-rose-500">
          <Heart className="w-20 h-20 text-rose-500 fill-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-3xl font-black text-slate-800 mb-2">Out of Hearts!</h3>
          <p className="text-slate-600 font-medium mb-8">Take a break or refill hearts to continue!</p>
          <button onClick={() => { if(updateUser) updateUser({...user, inventory: {...user.inventory, lives: 5}}); setStatus('playing'); }} className="w-full py-4 bg-rose-500 text-white font-black rounded-xl">REFILL HEARTS (DEMO)</button>
        </div>
      ) : (
      <div className={`bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col overflow-hidden relative ${status==='wrong'?'animate-shake border-4 border-rose-500':status==='correct'?'border-4 border-emerald-500':''}`}>
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{station.icon}</span>
            <div className="flex flex-col">
              <h3 className="font-black text-slate-800 text-lg uppercase leading-none">{station.label}</h3>
              {qList && qList.length > 1 && <span className="text-[10px] font-black text-blue-600 uppercase">Question {qIndex + 1} of {qList.length}</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh] hide-scrollbar">
          {qData.image && <img src={qData.image} alt="Visual" className="w-full h-48 object-cover rounded-xl shadow-md border-2 border-slate-100" />}
          {qData.passage && <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-slate-700 font-medium text-sm shadow-inner">{qData.passage}</div>}
          <h2 className="text-xl font-black text-slate-800 flex items-start gap-3">
            {(qData.type === 'listen-fill' || qData.type === 'speak') && (
               <button onClick={() => playAudio(qData.audioText || qData.targetText)} className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-95 shrink-0 shadow-md"><Volume2 className="w-6 h-6" /></button>
            )}
            <span className="pt-1">{qData.question}</span>
          </h2>
          
          {qData.type === 'speak' && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="text-2xl font-black text-slate-800 text-center px-4">"{qData.targetText}"</div>
              <button onClick={toggleListen} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse-ring' : 'bg-slate-100 text-slate-600 border-4 border-slate-200 hover:scale-105'}`}>
                <Mic className={`w-10 h-10 ${isListening ? 'animate-bounce' : ''}`} />
              </button>
              <div className="text-center">{isListening ? <p className="text-rose-500 font-bold animate-pulse">Listening...</p> : <p className="text-slate-500 font-medium text-sm">{transcript ? `You said: "${transcript}"` : qData.hint}</p>}</div>
            </div>
          )}

          {['multiple-choice', 'listen-fill', 'read'].includes(qData.type) && (
            <div className="flex flex-col gap-3">
              {qData.type === 'listen-fill' && (
                 <div className="text-base font-bold text-slate-700 text-center py-4 bg-slate-50 border-2 border-slate-100 rounded-xl">{qData.textBefore} <span className="inline-block min-w-[80px] border-b-4 border-blue-400 mx-2 text-blue-600">{selectedOpt || '...'}</span> {qData.textAfter}</div>
              )}
              <div className="grid grid-cols-1 gap-3">
                {qData.options.map(opt => (
                  <button key={opt} onClick={() => handleSelectOption(opt)} disabled={status!=='playing'} className={`p-4 rounded-xl border-b-4 font-bold text-left transition-all ${selectedOpt === opt ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:-translate-y-1'}`}>{opt}</button>
                ))}
              </div>
            </div>
          )}

          {qData.type === 'order' && (
            <div className="flex flex-col gap-4">
              <div className="min-h-[60px] p-4 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-wrap gap-2 items-center">
                {orderedWords.map((w, i) => <span key={i} onClick={() => handleOrderWord(w)} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg cursor-pointer hover:scale-105">{w}</span>)}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {qData.words.filter(w => !orderedWords.includes(w)).map((w, i) => <span key={i} onClick={() => handleOrderWord(w)} className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer hover:-translate-y-1">{w}</span>)}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {status === 'playing' ? (
            qData.type !== 'speak' && <button onClick={handleCheck} className="w-full py-4 bg-blue-500 text-white font-black rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 hover:bg-blue-400">CHECK ANSWER</button>
          ) : (
            <div className={`p-4 rounded-xl flex flex-col gap-4 animate-pop ${status === 'correct' ? 'bg-emerald-100 border border-emerald-300' : 'bg-rose-100 border border-rose-300'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full text-white shrink-0 ${status === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{status === 'correct' ? <Check className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}</div>
                  <div>
                    <h3 className={`font-black text-xl ${status === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>{status === 'correct' ? 'Excellent!' : 'Needs Work'}</h3>
                    <p className={`text-sm font-medium mt-1 ${status === 'correct' ? 'text-emerald-600' : 'text-rose-600'}`}>{feedbackMsg}</p>
                  </div>
                </div>
              </div>
              <button onClick={handleContinue} className={`w-full py-3 text-white font-black rounded-xl shadow-md active:translate-y-1 ${status === 'correct' ? 'bg-emerald-500 border-b-4 border-emerald-700' : 'bg-rose-500 border-b-4 border-rose-700'}`}>{status === 'correct' ? 'CONTINUE' : 'TRY AGAIN'}</button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

const MapView = ({ grade, unit, onBack, user, updateUser, currentUnitData }) => {
  const theme = MAP_THEMES[unit.theme] || MAP_THEMES.ocean;
  const [currentStationIdx, setCurrentStationIdx] = useState(0); // Progress managed locally or by DB later
  const [activeGame, setActiveGame] = useState(null);

  const getMapNodes = () => {
    const baseNodes = [ { id: 1, type: "vocab", x: 20, y: 80 }, { id: 2, type: "grammar", x: 45, y: 65 }, { id: 3, type: "listen", x: 75, y: 55 }, { id: 4, type: "read", x: 40, y: 30 }, { id: 5, type: "boss", x: 80, y: 15 } ];
    const styles = [ { label: "Word Island", icon: "🏝️" }, { label: "Grammar Reef", icon: "🪸" }, { label: "Listen Shell", icon: "🐚" }, { label: "Read Cave", icon: "🌊" }, { label: "Kraken Boss", icon: "🦑" } ];
    return baseNodes.map((node, i) => ({ ...node, ...styles[i] }));
  };
  
  const nodes = getMapNodes();
  const pathD = nodes.reduce((acc, node, i) => i === 0 ? `M ${node.x} ${node.y}` : `${acc} L ${node.x} ${node.y}`, "");

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in relative">
      <button onClick={onBack} className="absolute top-8 left-8 z-50 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 border border-white/20 shadow-xl"><ChevronLeft className="w-6 h-6" /></button>
      <div className={`relative w-full flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white/10 bg-gradient-to-tr ${theme.bg}`}>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/80 backdrop-blur-xl px-6 py-2 rounded-2xl border border-white/10 shadow-2xl whitespace-nowrap">
          <span className="text-white font-black tracking-widest text-sm uppercase">{grade.name} • {unit.name}</span>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
           <path d={pathD} fill="transparent" stroke={theme.pathColor} strokeWidth="2.5" strokeDasharray="4 6" strokeLinecap="round" />
        </svg>
        <div className="absolute z-30 transition-all duration-1000 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl pointer-events-none" style={{ left: `${nodes[currentStationIdx].x}%`, top: `${nodes[currentStationIdx].y}%`, marginTop: '-35px' }}>
          <div className="text-6xl animate-float">{theme.vehicle}</div>
        </div>
        {nodes.map((node, index) => {
          const isPassed = index < currentStationIdx;
          const isCurrent = index === currentStationIdx;
          const isLocked = index > currentStationIdx;
          return (
            <button key={node.id} onClick={() => index <= currentStationIdx && setActiveGame(node)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-110 transition-transform'}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 backdrop-blur-md relative ${isCurrent ? 'bg-white/30 border-white ring-4 ring-white/30 animate-pulse' : isPassed ? 'bg-white/20 border-white/50' : 'bg-slate-900/50 border-slate-700'}`}>
                {node.icon}
                {isPassed && <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-white"><CheckCircle2 className="w-5 h-5 text-white" /></div>}
                {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-full"><Lock className="w-8 h-8 text-white/50"/></div>}
              </div>
              <div className="px-4 py-1.5 rounded-xl text-xs font-black shadow-xl border backdrop-blur-md uppercase bg-slate-900/90 text-white border-white/20 whitespace-nowrap">{node.label}</div>
            </button>
          );
        })}
      </div>
      <GameModal isOpen={!!activeGame} onClose={() => setActiveGame(null)} station={activeGame} user={user} updateUser={updateUser} currentUnitData={currentUnitData} onWin={() => {
        setActiveGame(null);
        if (updateUser && user) {
           let newStars = (user.inventory?.stars ?? 0) + 15;
           updateUser({...user, inventory: {...user.inventory, stars: newStars}});
        }
        if (currentStationIdx < nodes.length - 1) setCurrentStationIdx(p => p + 1);
        else {
           alert("🎉 Incredible! You defeated the Boss and completed this Unit! (+50 Stars)");
           if (updateUser && user) {
               let newStars = (user.inventory?.stars ?? 0) + 50;
               let newCompleted = [...new Set([...(user.completedUnits || []), unit.id])];
               updateUser({...user, inventory: {...user.inventory, stars: newStars}, completedUnits: newCompleted});
           }
           onBack();
        }
      }} />
    </div>
  );
};

const UnitsView = ({ grade, onBack, onSelectUnit, user }) => (
  <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in h-full flex flex-col z-10 relative">
    <div className="flex items-center gap-4 mb-8 shrink-0">
      <button onClick={onBack} className="p-3 bg-white/10 rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
      <div><h2 className="text-3xl font-black text-white drop-shadow-md">{grade.name} Journey</h2></div>
    </div>
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-20 hide-scrollbar">
      {GRADE_UNITS.map(unit => {
        const isCompleted = user?.completedUnits?.includes(unit.id);
        return (
        <button key={unit.id} onClick={() => onSelectUnit(unit)} 
          className={`relative flex items-center p-5 rounded-[2rem] border-b-[6px] w-full text-left transition-transform active:translate-y-1 active:border-b-0
          ${isCompleted ? 'bg-emerald-500 border-emerald-700 hover:brightness-110 shadow-xl' :
            'bg-gradient-to-r from-blue-500 to-indigo-600 border-indigo-800 hover:brightness-110 shadow-xl'}`}>
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shrink-0 ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-white/20 text-white'}`}>
            {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white">{unit.name}: {unit.title}</h3>
            {isCompleted && <p className="text-sm font-bold text-emerald-100 mt-1 flex items-center gap-1"><Star className="w-4 h-4 fill-emerald-100"/> Mastered</p>}
          </div>
        </button>
      )})}
    </div>
  </div>
);

const GradesView = ({ onSelectGrade }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in relative z-10">
    <div className="mb-8 text-center"><h2 className="text-4xl font-black text-white drop-shadow-lg">Select Your Grade</h2></div>
    <div className="flex flex-wrap justify-center items-center gap-4 max-w-5xl w-full">
      {GRADES.map(grade => (
        <button key={grade.id} onClick={() => onSelectGrade(grade)} 
          className={`relative flex-1 min-w-[140px] max-w-[180px] text-left p-5 rounded-[2rem] border-b-[8px] transition-all bg-gradient-to-b ${grade.color} border-black/20 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:border-b-0`}>
          <div className="p-3 rounded-2xl bg-white/20 text-white w-fit mb-4"><grade.icon className="w-8 h-8" /></div>
          <h3 className="font-black text-2xl text-white">{grade.name}</h3>
          <p className="text-xs font-bold text-white/70 mt-1">{grade.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const PracticeHub = ({ user, onTriggerMissingData }) => {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in w-full h-full overflow-y-auto hide-scrollbar relative z-10">
      <div className="mb-8">
        <h2 className="text-4xl font-black text-white drop-shadow-md mb-2">Practice Hub</h2>
        <p className="text-slate-400 font-medium text-lg">Master your skills across all domains.</p>
      </div>
      
      <div className="flex flex-col gap-8">
        {/* Extra Exercises Section */}
        <div>
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2"><LayoutGrid className="w-6 h-6 text-emerald-400"/> Extra Exercises</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={onTriggerMissingData} className="p-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl border-b-[6px] border-teal-800 text-white hover:-translate-y-1 shadow-lg text-left">
              <Headphones className="w-8 h-8 mb-3 text-teal-100" />
              <h4 className="text-xl font-black">Listening</h4>
              <p className="text-sm font-medium text-teal-100">By Unit</p>
            </button>
            <button onClick={onTriggerMissingData} className="p-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl border-b-[6px] border-cyan-800 text-white hover:-translate-y-1 shadow-lg text-left">
              <Mic className="w-8 h-8 mb-3 text-cyan-100" />
              <h4 className="text-xl font-black">Speaking</h4>
              <p className="text-sm font-medium text-cyan-100">By Unit</p>
            </button>
            <button onClick={onTriggerMissingData} className="p-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl border-b-[6px] border-rose-800 text-white hover:-translate-y-1 shadow-lg text-left">
              <BookOpen className="w-8 h-8 mb-3 text-rose-100" />
              <h4 className="text-xl font-black">Reading</h4>
              <p className="text-sm font-medium text-rose-100">By Unit</p>
            </button>
          </div>
        </div>

        {/* Exams Section */}
        <div>
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2"><Timer className="w-6 h-6 text-indigo-400"/> Full Exams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={onTriggerMissingData} className="text-left p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] border-b-[8px] border-indigo-900 text-white hover:-translate-y-2 transition-transform shadow-xl">
              <Timer className="w-12 h-12 mb-4 text-indigo-200" />
              <h3 className="text-3xl font-black mb-2">45-Min Mock Test</h3>
              <p className="text-indigo-100 text-base font-medium">Simulate a full school exam with diverse question types.</p>
            </button>
            <button onClick={onTriggerMissingData} className="text-left p-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] border-b-[8px] border-amber-700 text-white hover:-translate-y-2 transition-transform shadow-xl">
              <Medal className="w-12 h-12 mb-4 text-amber-100" />
              <h3 className="text-2xl font-black mb-2">Cambridge Advanced</h3>
              <p className="text-amber-50 text-sm font-medium">Extra vocabulary and complex structures.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArenaView = ({ user }) => {
  const [arenaState, setArenaState] = useState('lobby'); // lobby, hosting, battle, result
  const [pin, setPin] = useState('');
  const [players, setPlayers] = useState([]);
  const [timer, setTimer] = useState(10);

  // Simulate players joining if hosting
  useEffect(() => {
    if (arenaState === 'hosting') {
      const interval = setInterval(() => {
        const bots = ["Alex_99", "Sarah_Pro", "JohnDoe", "Emma_Star", "Mike_Gamer"];
        setPlayers(prev => {
          if (prev.length >= 5) return prev;
          return [...prev, { name: bots[prev.length], avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${bots[prev.length]}` }];
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [arenaState]);

  // Simulate Battle Timer
  useEffect(() => {
    if (arenaState === 'battle' && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (arenaState === 'battle' && timer === 0) {
      setArenaState('result');
    }
  }, [arenaState, timer]);

  const handleHost = () => {
    setPin(Math.floor(10000 + Math.random() * 90000).toString());
    setPlayers([{ name: user?.name || "Host", avatar: user?.avatar, isHost: true }]);
    setArenaState('hosting');
  };

  const handleStartBattle = () => {
    setArenaState('battle');
    setTimer(10);
  };

  if (arenaState === 'hosting') {
    return (
      <div className="p-4 max-w-4xl mx-auto animate-fade-in w-full h-full flex flex-col relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl">
          <p className="text-slate-400 font-bold mb-2">Join at <span className="text-white">explorer.edu/play</span></p>
          <h2 className="text-6xl font-black text-white tracking-widest bg-slate-950 inline-block px-8 py-4 rounded-3xl border-4 border-blue-500 mb-8">{pin}</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {players.map((p, i) => (
              <div key={i} className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center animate-pop border border-white/5">
                <img src={p.avatar} alt={p.name} className="w-16 h-16 rounded-full bg-slate-700 mb-2 border-2 border-white/20"/>
                <span className="text-white font-bold">{p.name}</span>
                {p.isHost && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full mt-1">HOST</span>}
              </div>
            ))}
            {players.length < 5 && (
              <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 p-4 rounded-2xl flex items-center justify-center animate-pulse">
                <span className="text-slate-500 font-bold">Waiting...</span>
              </div>
            )}
          </div>
          
          <button onClick={handleStartBattle} disabled={players.length < 2} className="w-full sm:w-auto px-12 py-4 bg-emerald-500 text-white font-black text-xl rounded-2xl border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 disabled:opacity-50">
            START AI BATTLE
          </button>
        </div>
      </div>
    );
  }

  if (arenaState === 'battle') {
    return (
      <div className="p-4 max-w-5xl mx-auto animate-fade-in w-full h-full flex flex-col relative z-10">
        <div className="w-full bg-slate-800 h-4 rounded-full mb-6 overflow-hidden border border-white/10">
          <div className="h-full bg-blue-500 animate-timer" style={{ animationDuration: '10s' }}></div>
        </div>
        
        <div className="bg-white rounded-[2rem] p-8 text-center shadow-2xl flex-1 flex flex-col">
          <div className="flex justify-center mb-4"><Bot className="w-12 h-12 text-purple-500 animate-pulse" /></div>
          <p className="text-purple-600 font-bold text-sm uppercase tracking-widest mb-6">AI Generated Challenge</p>
          <h2 className="text-3xl font-black text-slate-800 mb-10">Complete the sentence: "I ____ to school every day."</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            {['go', 'goes', 'went', 'going'].map((opt, i) => {
              const colors = ['bg-rose-500 border-rose-700', 'bg-blue-500 border-blue-700', 'bg-amber-500 border-amber-700', 'bg-emerald-500 border-emerald-700'];
              return (
                <button key={opt} onClick={() => setArenaState('result')} className={`p-8 rounded-2xl text-white font-black text-2xl border-b-[8px] active:border-b-0 active:translate-y-2 transition-all ${colors[i]}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (arenaState === 'result') {
    return (
      <div className="p-4 max-w-4xl mx-auto animate-fade-in w-full h-full flex items-center justify-center relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl w-full">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-black text-white mb-2">Victory!</h2>
          <p className="text-slate-400 text-lg mb-8">You answered faster than 80% of the room.</p>
          
          <div className="flex justify-center gap-4 mb-8 items-end">
            <div className="flex flex-col items-center">
              <span className="text-white font-bold mb-2">Sarah_Pro</span>
              <div className="w-16 h-24 bg-slate-700 rounded-t-lg border-t-4 border-slate-400 flex justify-center items-start pt-2 font-black text-slate-400">2</div>
            </div>
            <div className="flex flex-col items-center z-10 relative">
              <span className="text-white font-bold mb-2 text-xl">{user?.name}</span>
              <div className="w-20 h-32 bg-yellow-500 rounded-t-lg border-t-4 border-yellow-300 flex justify-center items-start pt-2 font-black text-yellow-900 text-2xl shadow-[0_0_30px_rgba(234,179,8,0.5)]">1</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white font-bold mb-2">Alex_99</span>
              <div className="w-16 h-20 bg-orange-700 rounded-t-lg border-t-4 border-orange-500 flex justify-center items-start pt-2 font-black text-orange-400">3</div>
            </div>
          </div>

          <button onClick={() => setArenaState('lobby')} className="px-8 py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-all border border-white/10">
            RETURN TO LOBBY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in w-full h-full flex flex-col items-center justify-center relative z-10">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] w-full max-w-lg shadow-2xl text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-orange-400 to-rose-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
          <Swords className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-black text-white mb-3">AI Arena Lobby</h2>
        <p className="text-slate-400 font-medium text-lg mb-8">Join a live multiplayer match or host your own epic battle generated by AI!</p>
        
        <input type="text" placeholder="Game PIN" className="w-full bg-slate-950 text-white font-black text-center text-2xl p-4 rounded-2xl mb-4 border-2 border-slate-700 outline-none focus:border-blue-500 transition-colors" />
        <button onClick={() => setArenaState('hosting')} className="w-full bg-blue-600 text-white font-black py-4 text-xl rounded-2xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 mb-4">
          JOIN MATCH
        </button>
        <button onClick={handleHost} className="w-full bg-slate-800 text-white font-black py-4 text-lg rounded-2xl border-2 border-slate-700 hover:bg-slate-700">
          HOST A MATCH
        </button>
      </div>
    </div>
  );
};

const AdminPanel = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('cms');
  const [dataType, setDataType] = useState('lessons'); 
  const [grade, setGrade] = useState('5');
  const [unit, setUnit] = useState('1');
  const [jsonInput, setJsonInput] = useState("");
  const [isPushing, setIsPushing] = useState(false);
  const [pushMsg, setPushMsg] = useState({ type: '', text: '' });
  
  const handlePushData = async () => {
    setIsPushing(true); setPushMsg({ type: '', text: '' });
    try {
      if (!jsonInput.trim()) throw new Error("JSON data is empty!");
      const parsedData = JSON.parse(jsonInput);
      if (!db) throw new Error("Firebase is not connected. Check environment variables.");
      
      let collectionName = "units";
      let docId = `grade${grade}_unit${unit}`;
      if (dataType === 'mockTests') { collectionName = "mockTests"; docId = `grade${grade}_test${unit}`; }
      if (dataType === 'cambridge') { collectionName = "cambridge"; docId = `grade${grade}_cambridge${unit}`; }

      await setDoc(doc(db, collectionName, docId), parsedData);
      setPushMsg({ type: 'success', text: `✅ Successfully pushed to [${collectionName}/${docId}]` });
    } catch (error) {
      if (error instanceof SyntaxError) setPushMsg({ type: 'error', text: `❌ Invalid JSON format: ${error.message}` });
      else if (error.code === 'permission-denied') setPushMsg({ type: 'error', text: `❌ Permission Denied! Update Firestore Rules to allow read/write.` });
      else setPushMsg({ type: 'error', text: `❌ Error: ${error.message}` });
    } finally { setIsPushing(false); }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in w-full h-full overflow-y-auto hide-scrollbar flex flex-col gap-6 relative z-10">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-slate-200 shrink-0">
        <div className="p-6 bg-slate-900 text-white border-b-4 border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3"><ShieldAlert className="w-8 h-8 text-rose-500"/><h2 className="text-2xl font-black">Admin CMS</h2></div>
        </div>
        <div className="flex bg-slate-50 border-b border-slate-200">
           <button onClick={() => setActiveTab('cms')} className={`flex-1 py-4 font-black text-lg transition-colors ${activeTab === 'cms' ? 'text-blue-600 bg-white border-b-4 border-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>☁️ PUSH DATA TO CLOUD</button>
        </div>
      </div>
      
      {activeTab === 'cms' && (
        <div className="bg-white rounded-[2rem] shadow-xl border-4 border-slate-200 p-6 flex flex-col gap-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50 p-5 rounded-xl border border-blue-200">
             <div className="w-full">
                <label className="block text-sm font-bold text-blue-900 mb-2">Data Type</label>
                <select value={dataType} onChange={e=>{setDataType(e.target.value); setJsonInput('');}} className="w-full bg-white border-2 border-blue-300 rounded-xl p-3 font-black text-slate-700 outline-none">
                  <option value="lessons">Standard Lesson</option>
                  <option value="mockTests">45-Min Mock Test</option>
                  <option value="cambridge">Cambridge Advanced</option>
                </select>
             </div>
             <div className="w-full">
                <label className="block text-sm font-bold text-blue-900 mb-2">Grade</label>
                <select value={grade} onChange={e=>setGrade(e.target.value)} className="w-full bg-white border-2 border-blue-300 rounded-xl p-3 font-black text-slate-700 outline-none">
                  {[1,2,3,4,5].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
             </div>
             <div className="w-full">
                <label className="block text-sm font-bold text-blue-900 mb-2">Unit/Test ID</label>
                <select value={unit} onChange={e=>setUnit(e.target.value)} className="w-full bg-white border-2 border-blue-300 rounded-xl p-3 font-black text-slate-700 outline-none">
                  {[1,2,3,4,5,6,7,8,9,10].map(u => <option key={u} value={u}>ID {u}</option>)}
                </select>
             </div>
             <div className="w-full flex items-end">
                <button onClick={handlePushData} disabled={isPushing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 shadow-lg">
                   {isPushing ? 'PUSHING...' : '🚀 PUSH DATA'}
                </button>
             </div>
          </div>
          
          {pushMsg.text && (
            <div className={`p-4 rounded-xl font-bold border-2 ${pushMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
              {pushMsg.text}
            </div>
          )}

          <div className="flex-1 flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center px-1">
               <label className="font-black text-slate-700 flex items-center gap-2"><BookOpen className="w-5 h-5"/> JSON Data Payload</label>
            </div>
            <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)}
               className="w-full h-[400px] bg-slate-900 text-emerald-400 font-mono text-sm p-5 rounded-2xl outline-none border-4 border-slate-800 shadow-inner hide-scrollbar"
               spellCheck="false" placeholder='Paste your formatted JSON code here...' />
          </div>
        </div>
      )}
    </div>
  );
};

const OnboardingView = () => {
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      if (auth) {
        await signInWithPopup(auth, provider);
      } else {
        setErrorMsg("Firebase Auth is missing. Check your .env config.");
      }
    } catch (error) { 
      console.error("Login failed", error); 
      setErrorMsg(`Error: ${error.message}`); 
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-purple-900/20"></div>
      <div className="z-10 bg-slate-950/60 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-md w-[90%]">
        <div className="w-28 h-28 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[2rem] flex items-center justify-center mb-8"><Rocket className="w-14 h-14 text-white" /></div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Global Explorer</h1>
        <p className="text-slate-400 font-medium text-lg mb-8">Embark on a journey to master English.</p>
        
        {errorMsg && <div className="w-full p-4 mb-6 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-400 font-bold text-sm text-left">{errorMsg}</div>}
        
        <button onClick={handleGoogleLogin} className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 shadow-xl text-lg transition-transform active:scale-95">
          <Fingerprint className="w-6 h-6" /> Login with Google
        </button>
      </div>
    </div>
  );
};

const MainLayout = ({ user, handleLogout, updateUser }) => {
  const [currentView, setCurrentView] = useState('grades'); 
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [currentUnitData, setCurrentUnitData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isUnderConstruction, setIsUnderConstruction] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  useEffect(() => { setDailyQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]); }, []);

  const navItems = [
    { id: 'grades', label: "Courses", icon: Library, color: 'text-emerald-400' },
    { id: 'practice', label: "Practice", icon: Dumbbell, color: 'text-blue-400' },
    { id: 'arena', label: "AI Arena", icon: Swords, color: 'text-orange-400' }
  ];
  if (user?.role === 'admin' || user?.role === 'superadmin') navItems.push({ id: 'admin', label: "Admin Panel", icon: ShieldAlert, color: 'text-rose-400' });

  const handleSelectUnitAndFetch = async (unit) => {
    setSelectedUnit(unit);
    setIsLoadingData(true);
    
    try {
      if(!db) throw new Error("Firebase DB not initialized");
      const docId = `grade${selectedGrade.id.replace('g', '')}_unit${unit.id.replace('u', '')}`;
      const docRef = doc(db, 'units', docId);
      const snap = await getDoc(docRef);
      
      if(snap.exists()) {
        setCurrentUnitData(snap.data());
        setCurrentView('map');
      } else {
        // Fallback gracefully without crashing
        setIsUnderConstruction(true);
      }
    } catch(err) {
      console.error(err);
      setIsUnderConstruction(true);
    } finally {
      setIsLoadingData(false);
    }
  }

  const renderContent = () => {
    if(isLoadingData) return <div className="w-full h-full flex flex-col items-center justify-center text-white relative z-10"><Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4"/><h3 className="font-black text-xl">Loading Cloud Data...</h3></div>;
    
    switch(currentView) {
      case 'grades': return <GradesView onSelectGrade={(g) => { setSelectedGrade(g); setCurrentView('units'); }} />;
      case 'units': return <UnitsView grade={selectedGrade} onBack={() => setCurrentView('grades')} onSelectUnit={handleSelectUnitAndFetch} user={user} />;
      case 'map': return <MapView grade={selectedGrade} unit={selectedUnit} onBack={() => setCurrentView('units')} user={user} updateUser={updateUser} currentUnitData={currentUnitData} />;
      case 'admin': return <AdminPanel currentUser={user} />;
      case 'practice': return <PracticeHub user={user} onTriggerMissingData={() => setIsUnderConstruction(true)} />;
      case 'arena': return <ArenaView user={user} />;
      default: return <GradesView onSelectGrade={(g) => {setSelectedGrade(g); setCurrentView('units')}} />;
    }
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row h-screen w-screen overflow-hidden bg-[#0f172a] font-sans relative">
      <style>{globalStyles}</style>
      
      {/* Background Orbs (Glassmorphism Base) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse-ring pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-ring pointer-events-none z-0" style={{animationDelay: '1s'}}></div>
      
      {/* RESPONSIVE SIDEBAR */}
      <aside className="flex flex-row sm:flex-col bg-slate-950/60 backdrop-blur-2xl border-t sm:border-t-0 sm:border-r border-white/10 transition-all duration-300 z-50 relative w-full sm:w-16 hover:sm:w-64 h-16 sm:h-full group hide-scrollbar shrink-0">
        
        {/* Logo (Desktop Only) */}
        <div className="p-3 hidden sm:flex items-center h-16 border-b border-white/5 shrink-0 overflow-hidden">
          <div className="min-w-[40px] h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"><Rocket className="w-6 h-6 text-white" /></div>
          <div className="ml-3 transition-opacity duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100"><h1 className="text-lg font-black text-white tracking-wide">EXPLORER</h1></div>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 flex flex-row sm:flex-col gap-2 p-2 sm:p-3 overflow-x-auto sm:overflow-y-auto hide-scrollbar justify-around sm:justify-start items-center sm:items-stretch">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex items-center justify-center sm:justify-start p-2 sm:p-3 rounded-xl font-black text-sm transition-all border border-transparent overflow-hidden ${currentView === item.id ? 'bg-white/10 text-white shadow-inner border-white/10' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
              <item.icon className={`min-w-[24px] h-6 sm:h-6 ${item.color}`} />
              <span className="ml-4 transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100 hidden sm:block">{item.label}</span>
            </button>
          ))}
          {/* Logout button on Mobile (Bottom Nav) */}
          <button onClick={handleLogout} className="sm:hidden flex items-center justify-center p-2 rounded-xl font-black text-slate-500 hover:bg-rose-500 hover:text-white transition-all">
            <LogOut className="w-6 h-6" />
          </button>
        </nav>

        {/* Desktop Extras: Quote, Author, Logout */}
        <div className="hidden sm:flex p-4 border-t border-white/5 flex-col gap-4 shrink-0 overflow-hidden">
          {/* Daily Quote */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-[1.5rem] border border-white/10 transition-all duration-500 overflow-hidden opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-64 flex flex-col items-center text-center gap-3">
            <div className={`p-3 rounded-2xl bg-white/5 ${dailyQuote.color}`}><dailyQuote.icon className="w-8 h-8" /></div>
            <p className={`text-sm font-black leading-snug ${dailyQuote.color}`}>"{dailyQuote.text}"</p>
          </div>
          
          {/* Author Tag */}
          <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Created by</p>
            <p className="text-xs text-blue-400 font-black">Mr. Khoa</p>
          </div>

          {/* Desktop Logout */}
          <button onClick={handleLogout} className="flex items-center justify-center p-3 rounded-xl font-black text-slate-500 bg-slate-900 hover:bg-rose-500 hover:text-white transition-all overflow-hidden border border-transparent hover:border-rose-600 mt-1">
            <LogOut className="min-w-[24px] h-5" /> 
            <span className="ml-3 transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        <TopMetricsBar user={user} />
        <div className="flex-1 overflow-hidden relative">{renderContent()}</div>
      </div>
      
      {/* Global Modals */}
      <UnderConstructionModal isOpen={isUnderConstruction} onClose={() => setIsUnderConstruction(false)} />
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    if (!auth) { setIsAuthChecking(false); return; }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await syncUserWithDb(firebaseUser);
        setUser(userProfile);
      } else { setUser(null); }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => { if (auth) await signOut(auth); setUser(null); };

  const updateUserAndDb = async (newUserData) => {
    setUser(newUserData);
    if (db && newUserData) {
      try { await setDoc(doc(db, "users", newUserData.uid), newUserData, { merge: true }); } 
      catch(e) { console.warn("Firestore save failed, but UI state updated.", e); }
    }
  };

  if (isAuthChecking) return <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center"><div className="flex flex-col items-center gap-4"><Compass className="w-12 h-12 text-blue-500 animate-spin" /><p className="text-white font-black animate-pulse">Checking credentials...</p></div></div>;
  if (!user) return <OnboardingView />;
  return <MainLayout user={user} handleLogout={handleLogout} updateUser={updateUserAndDb} />;
}