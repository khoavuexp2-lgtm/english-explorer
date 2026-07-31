import React, { useState, useEffect } from 'react';
import { 
  Map, Swords, Dumbbell, LineChart, LogOut, Loader2, Play, 
  Mic, Headphones, Flame, Heart, Lock, CheckCircle2, Star, 
  X, MessageSquare, ChevronRight, Trophy, Zap, Compass, Library, Shield,
  Menu, Mail, Phone, Rocket, Crown, BrainCircuit, ChevronLeft,
  RotateCw, Plus, Users, Target, Clock, Settings, Gamepad2, Volume2, Type,
  Timer, Award, Ban, UserCheck, ShieldAlert, Check, AlertCircle, ArrowRight
} from 'lucide-react';

const globalStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  .animate-shake { animation: shake 0.4s ease-in-out; }
  
  @keyframes pop {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
`;

// --- MOCK DATA ---
const MOCK_USER = {
  uid: "admin123", name: "Mr. Khoa", email: "khoavuexp@gmail.com", role: "admin", 
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=KhoaMaster", status: "active",
  inventory: { stars: 120, flames: 5 }
};

const MOCK_STUDENTS = [
  { id: "s1", name: "Nguyễn Văn A", email: "nva@gmail.com", role: "student", status: "active", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=A" },
  { id: "s2", name: "Trần Thị B", email: "ttb@gmail.com", role: "student", status: "blocked", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=B" },
];

const GRADES = [
  { id: 'g1', name: "Grade 1", desc: "Phonics & Words", locked: false, color: "from-emerald-400 to-teal-500", icon: Zap },
  { id: 'g2', name: "Grade 2", desc: "Basic Phrases", locked: false, color: "from-blue-400 to-cyan-500", icon: Shield },
  { id: 'g3', name: "Grade 3", desc: "Beginner Sentences", locked: true, color: "from-slate-400 to-slate-500", icon: Shield },
  { id: 'g4', name: "Grade 4", desc: "Intermediate", locked: true, color: "from-slate-400 to-slate-500", icon: Shield },
  { id: 'g5', name: "Grade 5", desc: "Advanced Master", locked: false, color: "from-purple-500 to-indigo-600", icon: Crown },
];

const MAP_THEMES = {
  ocean: { bg: "from-[#0891b2] to-[#1e3a8a]", vehicle: "⛵", pathColor: "rgba(255,255,255,0.4)" },
  space: { bg: "from-[#0f172a] to-[#312e81]", vehicle: "🚀", pathColor: "rgba(255,255,255,0.2)" },
  forest: { bg: "from-[#14532d] to-[#064e3b]", vehicle: "🚙", pathColor: "rgba(255,255,255,0.3)" },
  desert: { bg: "from-[#78350f] to-[#451a03]", vehicle: "🐪", pathColor: "rgba(255,255,255,0.3)" },
};

const GRADE_5_UNITS = [
  { id: 'u1', name: "Unit 1", title: "What's your address?", status: 'active', theme: 'ocean', stars: 0, progress: 0 },
  { id: 'u2', name: "Unit 2", title: "I always get up early", status: 'locked', theme: 'forest', stars: 0, progress: 0 },
  { id: 'u3', name: "Unit 3", title: "Where did you go?", status: 'locked', theme: 'space', stars: 0, progress: 0 },
  { id: 'u4', name: "Unit 4", title: "Did you go to the party?", status: 'locked', theme: 'desert', stars: 0, progress: 0 },
];

// --- G5 U1 GAME DATA ---
const G5_U1_QUESTIONS = {
  vocab: {
    type: 'multiple-choice',
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80",
    question: "Look at the picture and choose the correct word:",
    options: ["Village", "City", "Mountain", "Island"],
    answer: "City",
    explain: "City (Thành phố) là nơi có nhiều tòa nhà cao tầng và đông người."
  },
  grammar: {
    type: 'order',
    question: "Arrange the words to make a correct sentence:",
    words: ["live", "do", "Where", "you", "?"],
    answer: "Where do you live ?",
    explain: "Cấu trúc hỏi nơi ở: Where + do/does + S + live?"
  },
  listen: {
    type: 'listen-fill',
    audioText: "My hometown is a small and quiet village.",
    question: "Listen and choose the missing words:",
    textBefore: "My hometown is a",
    textAfter: "village.",
    options: ["big and noisy", "small and quiet", "large and crowded", "far and busy"],
    answer: "small and quiet",
    explain: "Trong audio có đọc câu: 'My hometown is a small and quiet village'."
  },
  read: {
    type: 'multiple-choice',
    passage: "Hoa lives in Hanoi. It is a big and busy city. She lives with her parents at 20 Hoa Binh Lane.",
    question: "What is Hanoi like?",
    options: ["Small and quiet", "Big and busy", "Far and noisy", "Large and crowded"],
    answer: "Big and busy",
    explain: "Đoạn văn có ghi rõ: 'It is a big and busy city'."
  },
  boss: {
    type: 'chat',
    question: "Talk to AI Boss: Where do you live? And what is it like?",
    hint: "Use: I live in... It is..."
  }
};

// --- COMPONENTS ---

const TopMetricsBar = ({ user }) => (
  <div className="flex items-center justify-between px-4 sm:px-8 py-2 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40 border-b border-white/10 shadow-sm h-14 shrink-0">
    <div className="flex items-center gap-3">
      <button className="md:hidden p-1.5 bg-white/10 text-white rounded-lg active:scale-95 backdrop-blur-md">
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl border border-white/20">
        <Compass className="w-5 h-5 text-yellow-300 animate-pulse" />
        <span className="font-black text-sm text-white tracking-wide">EXPLORER</span>
      </div>
    </div>

    <div className="flex items-center gap-2 sm:gap-4 scale-90 sm:scale-100 origin-right">
      <div className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-orange-500/30 shadow-lg">
        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
        <span className="font-black text-orange-100 text-sm">{user.inventory.flames}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-lg">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="font-black text-yellow-100 text-sm">{user.inventory.stars}</span>
      </div>
      
      <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block"></div>
      
      <div className="hidden sm:flex items-center gap-2 bg-white/5 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 shadow-lg">
        <div className="flex flex-col text-right">
          <span className="text-[9px] font-black text-blue-200 uppercase tracking-wider">{user?.role === 'admin' ? 'Master' : 'Explorer'}</span>
          <span className="text-xs font-black text-white leading-none">{user?.name?.split(' ')[0]}</span>
        </div>
        <img src={user?.avatar} alt="Avatar" className="w-8 h-8 rounded-lg bg-white/20 border-2 border-white/30 object-cover" />
      </div>
    </div>
  </div>
);

// Bảng chơi Game Mini (Tích hợp trong Map)
const GameModal = ({ isOpen, onClose, station, onWin }) => {
  if (!isOpen || !station) return null;
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [orderedWords, setOrderedWords] = useState([]);
  const [status, setStatus] = useState('playing'); // playing, correct, wrong
  const [aiChat, setAiChat] = useState("");

  const qData = G5_U1_QUESTIONS[station.type];

  if (!qData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl">
          <h3 className="text-2xl font-black text-slate-800 mb-2">🚧 Coming Soon!</h3>
          <p className="text-slate-600 font-medium mb-6">Trạm này đang được xây dựng nội dung. Hãy quay lại sau nhé!</p>
          <button onClick={onClose} className="w-full py-4 bg-blue-500 text-white font-black rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 hover:bg-blue-400 transition-all text-lg">ĐÓNG</button>
        </div>
      </div>
    );
  }

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ phát âm thanh. Hãy dùng Chrome/Edge.");
    }
  };

  const handleCheckMultipleChoice = () => {
    if (selectedOpt === qData.answer) setStatus('correct');
    else setStatus('wrong');
  };

  const handleOrderWord = (w) => {
    if (orderedWords.includes(w)) setOrderedWords(orderedWords.filter(x => x !== w));
    else setOrderedWords([...orderedWords, w]);
  };

  const handleCheckOrder = () => {
    if (orderedWords.join(" ") === qData.answer) setStatus('correct');
    else setStatus('wrong');
  };

  const handleBossSubmit = () => {
    if (aiChat.length > 10) setStatus('correct'); // Mô phỏng AI check pass
    else setStatus('wrong');
  };

  const reset = () => {
    setSelectedOpt(null); setOrderedWords([]); setStatus('playing'); setAiChat("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col overflow-hidden relative ${status==='wrong' ? 'animate-shake border-4 border-rose-500' : status==='correct' ? 'border-4 border-emerald-500' : ''}`}>
        
        {/* Header */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{station.icon}</span>
            <h3 className="font-black text-slate-800 text-lg">{station.label}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 text-slate-600"><X className="w-5 h-5"/></button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh] hide-scrollbar">
          
          {qData.image && (
            <img src={qData.image} alt="Illustration" className="w-full h-48 object-cover rounded-xl shadow-md border-2 border-slate-100" />
          )}

          {qData.passage && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-slate-700 font-medium text-sm leading-relaxed shadow-inner">
              {qData.passage}
            </div>
          )}

          <h2 className="text-xl font-black text-slate-800 flex items-start gap-3">
            {qData.type === 'listen-fill' && (
               <button onClick={() => playAudio(qData.audioText)} className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-95 shrink-0 transition-all shadow-md mt-0.5">
                 <Volume2 className="w-6 h-6" />
               </button>
            )}
            <span className="pt-1">{qData.question}</span>
          </h2>

          {(qData.type === 'multiple-choice' || qData.type === 'listen-fill') && (
            <div className="flex flex-col gap-3">
              {qData.type === 'listen-fill' && (
                 <div className="text-base sm:text-lg font-bold text-slate-700 text-center py-4 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl mb-2">
                   {qData.textBefore} <span className={`inline-block min-w-[80px] border-b-4 border-slate-300 mx-2 px-2 text-blue-600 ${selectedOpt ? 'border-blue-500' : ''}`}>{selectedOpt || '...'}</span> {qData.textAfter}
                 </div>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                {qData.options.map(opt => (
                  <button key={opt} onClick={() => setSelectedOpt(opt)} disabled={status!=='playing'}
                    className={`p-4 rounded-xl border-b-4 font-bold text-left transition-all
                    ${selectedOpt === opt 
                      ? 'bg-blue-100 border-blue-500 text-blue-700' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:translate-y-1 active:border-b-0'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {qData.type === 'order' && (
            <div className="flex flex-col gap-4">
              <div className="min-h-[60px] p-4 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-wrap gap-2 items-center">
                {orderedWords.map((w, i) => (
                  <span key={i} onClick={() => handleOrderWord(w)} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-sm cursor-pointer hover:bg-blue-600 active:scale-95">{w}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {qData.words.filter(w => !orderedWords.includes(w)).map((w, i) => (
                  <span key={i} onClick={() => handleOrderWord(w)} className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 active:scale-95">{w}</span>
                ))}
              </div>
            </div>
          )}

          {qData.type === 'chat' && (
             <div className="flex flex-col gap-3">
               <div className="bg-purple-100 text-purple-700 p-3 rounded-xl text-sm font-bold border border-purple-200 flex gap-2">
                 <BrainCircuit className="w-5 h-5 shrink-0" /> AI Hint: {qData.hint}
               </div>
               <textarea rows="3" value={aiChat} onChange={e=>setAiChat(e.target.value)} disabled={status!=='playing'} placeholder="Type your answer here or use voice dictation..." className="w-full border-2 border-slate-200 rounded-xl p-4 font-medium outline-none focus:border-purple-500 resize-none"></textarea>
             </div>
          )}
        </div>

        {/* Footer Actions & Status */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {status === 'playing' ? (
            <button onClick={qData.type === 'multiple-choice' ? handleCheckMultipleChoice : qData.type === 'order' ? handleCheckOrder : handleBossSubmit} 
              className="w-full py-4 bg-blue-500 text-white font-black rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 hover:bg-blue-400 transition-all text-lg">
              CHECK
            </button>
          ) : (
            <div className={`p-4 rounded-xl flex flex-col gap-4 animate-pop ${status === 'correct' ? 'bg-emerald-100 border border-emerald-300' : 'bg-rose-100 border border-rose-300'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full text-white ${status === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {status === 'correct' ? <Check className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
                </div>
                <div>
                  <h3 className={`font-black text-xl ${status === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {status === 'correct' ? 'Excellent!' : 'Oops! Try again.'}
                  </h3>
                  {status === 'wrong' && <p className="text-sm font-medium text-rose-600 mt-1">{qData.explain}</p>}
                </div>
              </div>
              <button onClick={status === 'correct' ? onWin : reset} 
                className={`w-full py-3 text-white font-black rounded-xl shadow-md transition-all active:scale-95 ${status === 'correct' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                {status === 'correct' ? 'CONTINUE' : 'RETRY'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const MapView = ({ grade, unit, onBack }) => {
  const theme = MAP_THEMES[unit.theme] || MAP_THEMES.ocean;
  const [currentStationIdx, setCurrentStationIdx] = useState(unit.progress || 0);
  const [activeGame, setActiveGame] = useState(null);

  // Dynamic Nodes based on Theme
  const getMapNodes = (themeId) => {
    const baseNodes = [
      { id: 1, type: "vocab", x: 15, y: 75 },
      { id: 2, type: "grammar", x: 35, y: 30 },
      { id: 3, type: "listen", x: 55, y: 70 },
      { id: 4, type: "read", x: 75, y: 25 },
      { id: 5, type: "boss", x: 90, y: 65 }
    ];
    
    const themeStyles = {
      ocean: [ { label: "Word Island", icon: "🏝️" }, { label: "Grammar Coral", icon: "🪸" }, { label: "Listen Shell", icon: "🐚" }, { label: "Read Cave", icon: "🌊" }, { label: "Kraken Boss", icon: "🦑" } ],
      forest: [ { label: "Word Tree", icon: "🌲" }, { label: "Grammar Hut", icon: "🛖" }, { label: "Listen Bird", icon: "🦜" }, { label: "Read Bear", icon: "🐻" }, { label: "Tiger Boss", icon: "🐯" } ],
      space: [ { label: "Word Planet", icon: "🪐" }, { label: "Grammar Comet", icon: "☄️" }, { label: "Listen Station", icon: "🛰️" }, { label: "Read Alien", icon: "👽" }, { label: "UFO Boss", icon: "🛸" } ],
      desert: [ { label: "Word Cactus", icon: "🌵" }, { label: "Grammar Oasis", icon: "🏝️" }, { label: "Listen Camel", icon: "🐪" }, { label: "Read Sphinx", icon: "🛕" }, { label: "Scorpion Boss", icon: "🦂" } ]
    };

    const styles = themeStyles[themeId] || themeStyles.ocean;
    
    // Nếu là Lớp 1,2 thì bỏ bớt trạm Grammar
    if (grade.id === 'g1' || grade.id === 'g2') {
      return [
        { ...baseNodes[0], ...styles[0] },
        { ...baseNodes[2], ...styles[2], x: 45, y: 40 },
        { ...baseNodes[3], ...styles[3], x: 70, y: 70 },
        { ...baseNodes[4], ...styles[4] }
      ];
    }
    
    return baseNodes.map((node, i) => ({ ...node, ...styles[i] }));
  };
  
  const nodes = getMapNodes(unit.theme);

  const pathD = nodes.reduce((acc, node, i) => {
    if (i === 0) return `M ${node.x} ${node.y}`;
    const prev = nodes[i-1];
    const midX = (prev.x + node.x) / 2;
    return `${acc} Q ${midX} ${prev.y} ${node.x} ${node.y}`;
  }, "");

  const handleNodeClick = (index, node) => {
    if (index <= currentStationIdx) {
      setActiveGame(node);
    }
  };

  const handleWinGame = () => {
    setActiveGame(null);
    if (currentStationIdx < nodes.length - 1) {
      setCurrentStationIdx(prev => prev + 1);
    } else {
      alert("🎉 You defeated the Boss! Unit Completed!");
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in relative">
      <button onClick={onBack} className="absolute top-8 left-8 z-50 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 border border-white/20 shadow-xl transition-all hover:scale-105">
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className={`relative w-full flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white/10 bg-gradient-to-br ${theme.bg}`}>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/80 backdrop-blur-xl px-6 py-2 rounded-2xl border border-white/10 shadow-2xl whitespace-nowrap">
          <span className="text-white font-black tracking-widest text-sm uppercase">{grade.name} • {unit.name}</span>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
           <path d={pathD} fill="transparent" stroke={theme.pathColor} strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
        </svg>

        <div className="absolute z-30 transition-all duration-1000 ease-in-out -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl pointer-events-none"
          style={{ left: `${nodes[currentStationIdx].x}%`, top: `${nodes[currentStationIdx].y}%`, marginTop: '-35px' }}>
          <div className="text-6xl animate-bounce">{theme.vehicle}</div>
        </div>

        {nodes.map((node, index) => {
          const isPassed = index < currentStationIdx;
          const isCurrent = index === currentStationIdx;
          const isLocked = index > currentStationIdx;
          const isBoss = node.type === 'boss';
          return (
            <button key={node.id} onClick={() => handleNodeClick(index, node)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all group 
                ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 backdrop-blur-md relative
                ${isCurrent ? 'bg-white/30 border-white ring-4 ring-white/30 animate-pulse' : 
                  isPassed ? 'bg-white/20 border-white/50' : 'bg-slate-900/50 border-slate-700'}
                ${isBoss ? 'scale-125 border-yellow-400 bg-yellow-900/60' : ''}`}>
                {node.icon}
                {isPassed && <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-white shadow-lg"><CheckCircle2 className="w-5 h-5 text-white" /></div>}
                {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-full"><Lock className="w-8 h-8 text-white/50"/></div>}
              </div>
              <div className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-xl border backdrop-blur-md uppercase tracking-wider
                ${isCurrent ? 'bg-white text-slate-800 border-white' : 'bg-slate-900/90 text-white border-white/20'}
                ${isBoss ? 'text-yellow-300 border-yellow-500/50' : ''}`}>
                {node.label}
              </div>
            </button>
          );
        })}
      </div>
      
      <GameModal isOpen={!!activeGame} onClose={() => setActiveGame(null)} station={activeGame} onWin={handleWinGame} />
    </div>
  );
};

// ... (Các Component khác như GradesView, UnitsView, ArenaView, PracticeView, AdminView giữ nguyên từ bản thiết kế UI trước, hoặc có thể thêm các Mockup cơ bản nếu cần. Để tiết kiệm không gian, tôi sẽ tạo các khối hiển thị chuẩn).

const UnitsView = ({ grade, onBack, onSelectUnit }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button onClick={onBack} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg active:scale-95">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-white drop-shadow-md">{grade.name} Journey</h2>
          <p className="text-white/70 font-medium text-sm mt-1">Select a unit to continue your adventure.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-4 pb-20">
        {GRADE_5_UNITS.map(unit => {
          const isCompleted = unit.status === 'completed';
          const isLocked = unit.status === 'locked';
          const isActive = unit.status === 'active';

          return (
            <button 
              key={unit.id} onClick={() => !isLocked && onSelectUnit(unit)}
              className={`relative flex items-center p-5 rounded-[2rem] border-b-[6px] transition-all w-full text-left
                ${isCompleted ? 'bg-emerald-900/40 border-emerald-900/50 backdrop-blur-md hover:bg-emerald-900/60' : 
                  isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-indigo-800 shadow-xl hover:-translate-y-1 active:translate-y-0 active:border-b-2' : 
                  'bg-slate-800/40 border-slate-900/50 backdrop-blur-md opacity-80 cursor-not-allowed'}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shrink-0 shadow-inner
                ${isCompleted ? 'bg-emerald-400 text-white' : isActive ? 'bg-white text-indigo-600' : 'bg-slate-700/50 text-slate-500'}`}
              >
                {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : isLocked ? <Lock className="w-6 h-6" /> : <Play className="w-7 h-7 ml-1" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-black uppercase tracking-wider text-[11px] ${isActive ? 'text-blue-200' : isCompleted ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {unit.name}
                  </span>
                  {isActive && <span className="bg-blue-400 text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-sm">IN PROGRESS</span>}
                </div>
                <h3 className={`text-xl font-black leading-tight ${isLocked ? 'text-slate-500' : 'text-white drop-shadow-sm'}`}>{unit.title}</h3>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const GradesView = ({ onSelectGrade }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
    <div className="mb-8 text-center">
      <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Select Your Grade</h2>
      <p className="text-blue-200 font-bold text-sm mt-2">Where would you like to explore today?</p>
    </div>
    
    <div className="flex flex-wrap justify-center items-center gap-4 max-w-5xl w-full">
      {GRADES.map(grade => (
        <button key={grade.id} onClick={() => !grade.locked && onSelectGrade(grade)}
          className={`relative flex-1 min-w-[160px] max-w-[220px] text-left p-5 rounded-[2rem] border-b-[8px] transition-all duration-200
          ${grade.locked 
            ? `bg-slate-800/60 border-slate-900/80 cursor-not-allowed backdrop-blur-md opacity-80` 
            : `bg-gradient-to-b ${grade.color} border-black/20 shadow-2xl hover:-translate-y-2 active:translate-y-0 active:border-b-[4px] backdrop-blur-md`}`}
        >
          {grade.locked && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] z-10 rounded-[2rem] flex items-center justify-center"><div className="bg-slate-800 p-3 rounded-full shadow-2xl border border-slate-600"><Lock className="w-6 h-6 text-slate-400" /></div></div>}
          <div className="flex justify-between items-center mb-4">
            <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner ${grade.locked ? 'text-white/30' : 'text-white'}`}><grade.icon className="w-8 h-8" /></div>
          </div>
          <h3 className={`font-black text-2xl ${grade.locked ? 'text-white/30' : 'text-white drop-shadow-md'}`}>{grade.name}</h3>
          <p className={`text-xs font-bold mt-1.5 ${grade.locked ? 'text-white/20' : 'text-blue-100'}`}>{grade.desc}</p>
        </button>
      ))}
    </div>
  </div>
);


const MainLayout = ({ user, handleLogout }) => {
  const [currentView, setCurrentView] = useState('grades'); // 'grades', 'units', 'map'
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Chỉ hiện cảnh báo nếu màn hình cao hơn rộng VÀ có hỗ trợ cảm ứng (mobile/tablet)
      const isPortrait = window.innerHeight > window.innerWidth;
      const isTouch = (window.matchMedia("(pointer: coarse)").matches);
      setShowOrientationWarning(isPortrait && isTouch);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const navItems = [
    { id: 'grades', label: "Courses", icon: Library, color: 'text-emerald-400', onClick: () => setCurrentView('grades') },
    { id: 'practice', label: "Practice", icon: Dumbbell, color: 'text-blue-400', onClick: () => alert("Practice Hub Simulation Opened!") },
    { id: 'arena', label: "Arena", icon: Swords, color: 'text-orange-400', onClick: () => alert("Arena Lobby Simulation Opened!") }
  ];

  const renderContent = () => {
    switch(currentView) {
      case 'grades': return <GradesView onSelectGrade={(g) => { setSelectedGrade(g); setCurrentView('units'); }} />;
      case 'units': return <UnitsView grade={selectedGrade} onBack={() => setCurrentView('grades')} onSelectUnit={(u) => { setSelectedUnit(u); setCurrentView('map'); }} />;
      case 'map': return <MapView grade={selectedGrade} unit={selectedUnit} onBack={() => setCurrentView('units')} />;
      default: return <GradesView onSelectGrade={(g) => {setSelectedGrade(g); setCurrentView('units')}} />;
    }
  };

  return (
    <>
      {showOrientationWarning && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[9999] bg-slate-900/90 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-blue-500/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <RotateCw className="w-5 h-5 animate-spin-slow text-blue-400 shrink-0" />
            <p className="text-xs font-bold text-slate-200">For the best experience, please rotate your device horizontally.</p>
          </div>
          <button onClick={() => setShowOrientationWarning(false)} className="p-2 hover:bg-white/10 rounded-full active:scale-95 shrink-0 bg-white/5"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      )}

      <div className="flex h-screen w-screen overflow-hidden bg-[#0f172a] font-sans selection:bg-white/30">
        <style>{globalStyles}</style>
        
        {/* Sidebar - Hover to Expand */}
        <aside className="hidden sm:flex flex-col bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 ease-in-out z-50 shadow-2xl relative w-[72px] hover:w-64 group hide-scrollbar">
          <div className="p-4 flex items-center h-14 border-b border-white/5 shrink-0 overflow-hidden mt-1">
            <div className="min-w-[40px] h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3 transition-opacity duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">
              <h1 className="text-lg font-black text-white tracking-wide">EXPLORER</h1>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto hide-scrollbar">
            {navItems.map(item => (
              <button key={item.id} onClick={item.onClick}
                className={`flex items-center p-3 rounded-xl font-black text-sm transition-all border border-transparent 
                ${currentView === item.id ? 'bg-white/10 text-white shadow-inner border-white/10' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
              >
                <item.icon className={`min-w-[24px] h-6 ${item.color}`} />
                <span className="ml-4 transition-all duration-300 whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-3 border-t border-white/5 flex flex-col gap-2 shrink-0">
             <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 transition-all duration-300 overflow-hidden opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-32">
               <p className="text-white/40 font-bold text-[9px] uppercase mb-1">Creator</p>
               <p className="text-white font-black text-xs mb-1">Mr. Khoa</p>
               <div className="flex flex-col gap-1 text-white/40 text-[10px] font-medium">
                 <span className="flex items-center gap-2 truncate"><Mail className="w-3 h-3 shrink-0"/> khoavuexp@gmail.com</span>
               </div>
             </div>
            <button onClick={handleLogout} className="flex items-center p-3 rounded-xl font-black text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-400 transition-all">
              <LogOut className="min-w-[24px] h-6" /> 
              <span className="ml-4 transition-all duration-300 whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto">Log Out</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
          <TopMetricsBar user={user} />
          <div className="flex-1 overflow-hidden relative">
            {renderContent()}
          </div>
        </div>

        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 flex justify-around p-1 z-50 pb-safe">
          {navItems.map(item => (
            <button key={item.id} onClick={item.onClick} className={`flex flex-col items-center p-2 rounded-xl min-w-[4rem] ${currentView === item.id ? 'bg-white/10' : ''}`}>
              <item.icon className={`w-5 h-5 mb-0.5 ${item.color}`} />
              <span className={`text-[9px] font-black ${item.color}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default function App() {
  const [user, setUser] = useState(MOCK_USER);
  return <MainLayout user={user} handleLogout={() => alert("Logged Out")} />;
}