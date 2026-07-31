import React, { useState, useEffect } from 'react';
import { 
  Map, Swords, Dumbbell, LineChart, LogOut, Loader2, Play, 
  Mic, Headphones, Flame, Heart, Lock, CheckCircle2, Star, 
  X, MessageSquare, ChevronRight, Trophy, Zap, Compass, Library, Shield,
  Menu, Mail, Phone, Rocket, Crown, BrainCircuit, ChevronLeft,
  RotateCw, Plus, Users, Target, Clock, Settings, Gamepad2, Volume2, Type
} from 'lucide-react';

// --- STYLES ẨN THANH CUỘN ---
const globalStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// --- MOCK DATA ---
const MOCK_USER = {
  uid: "123",
  name: "Khoa Teacher",
  email: "khoavuexp@gmail.com",
  role: "admin",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Khoa",
  status: "active"
};

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

// Dữ liệu Units của Grade 5
const GRADE_5_UNITS = [
  { id: 'u1', name: "Unit 1", title: "What's your address?", status: 'completed', theme: 'ocean', stars: 3 },
  { id: 'u2', name: "Unit 2", title: "I always get up early", status: 'active', theme: 'forest', stars: 0 },
  { id: 'u3', name: "Unit 3", title: "Where did you go?", status: 'locked', theme: 'space', stars: 0 },
  { id: 'u4', name: "Unit 4", title: "Did you go to the party?", status: 'locked', theme: 'desert', stars: 0 },
];

const TopMetricsBar = ({ user }) => (
  <div className="flex items-center justify-between px-4 sm:px-8 py-2 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40 border-b border-white/10 shadow-sm h-14">
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
      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 shadow-lg">
        <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
        <span className="font-black text-white text-sm">12</span>
      </div>
      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 shadow-lg">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="font-black text-white text-sm">450</span>
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

// Modal Vượt Ải AI
const AITestModal = ({ isOpen, onClose, unit, onUnlock }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border-4 border-indigo-100 flex flex-col items-center text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-12">
          <BrainCircuit className="w-8 h-8 text-white -rotate-12" />
        </div>
        
        <h3 className="text-xl font-black text-slate-800 mb-2">AI Assessment</h3>
        <p className="text-slate-500 font-medium text-sm mb-4">
          Prove your skills to unlock <strong className="text-indigo-600">{unit?.name}</strong> early.
        </p>
        
        <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold text-xs mb-4 border border-orange-200 w-full flex items-center justify-center gap-2">
          <Clock className="w-4 h-4"/> Attempts left today: 3/3
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-500 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={onUnlock} className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-3 rounded-xl shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-indigo-700">
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

const GradesView = ({ onSelectGrade }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
    <div className="mb-4 text-center">
      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">Select Your Grade</h2>
      <p className="text-white/60 font-medium text-sm mt-1">Choose a path to begin your journey</p>
    </div>
    
    {/* Layout tối ưu để vừa vặn màn hình ngang, không cần cuộn */}
    <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 max-w-5xl w-full">
      {GRADES.map(grade => (
        <button 
          key={grade.id} 
          onClick={() => !grade.locked && onSelectGrade(grade)}
          className={`relative group flex-1 min-w-[160px] max-w-[220px] text-left p-4 sm:p-5 rounded-3xl border-b-[6px] transition-all duration-200
          ${grade.locked 
            ? `bg-slate-800/40 border-slate-900/50 cursor-not-allowed backdrop-blur-md` 
            : `bg-gradient-to-b ${grade.color} border-black/20 shadow-xl hover:-translate-y-1.5 active:translate-y-0 active:border-b-[3px] backdrop-blur-md`}`}
        >
          {grade.locked && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] z-10 rounded-3xl flex items-center justify-center">
              <div className="bg-slate-800 p-2 rounded-full shadow-lg border border-slate-600"><Lock className="w-5 h-5 text-slate-400" /></div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-3">
            <div className={`p-2.5 rounded-xl bg-white/20 backdrop-blur-md ${grade.locked ? 'text-white/30' : 'text-white'}`}>
              <grade.icon className="w-6 h-6" />
            </div>
          </div>
          
          <h3 className={`font-black text-xl sm:text-2xl ${grade.locked ? 'text-white/30' : 'text-white drop-shadow-sm'}`}>{grade.name}</h3>
          <p className={`text-xs font-bold mt-1 ${grade.locked ? 'text-white/20' : 'text-white/80'}`}>{grade.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const UnitsView = ({ grade, onBack, onSelectUnit }) => {
  const [selectedLockedUnit, setSelectedLockedUnit] = useState(null);

  const handleUnitClick = (unit) => {
    if (unit.status === 'locked') setSelectedLockedUnit(unit);
    else onSelectUnit(unit);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-fade-in h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <button onClick={onBack} className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-colors border border-white/20">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{grade.name} Maps</h2>
          <p className="text-white/60 font-medium text-xs sm:text-sm">Select a unit to continue</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3 pb-20">
        {GRADE_5_UNITS.map(unit => {
          const isCompleted = unit.status === 'completed';
          const isLocked = unit.status === 'locked';
          const isActive = unit.status === 'active';

          return (
            <button 
              key={unit.id} onClick={() => handleUnitClick(unit)}
              className={`relative flex items-center p-4 rounded-[1.5rem] border-b-[6px] transition-all w-full text-left
                ${isCompleted ? 'bg-white/10 border-white/5 backdrop-blur-md hover:bg-white/20' : 
                  isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-indigo-800 shadow-xl hover:-translate-y-1 active:translate-y-0 active:border-b-2' : 
                  'bg-slate-800/40 border-slate-900/50 backdrop-blur-md hover:bg-slate-800/60'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-inner
                ${isCompleted ? 'bg-emerald-400 text-white' : isActive ? 'bg-white text-indigo-600' : 'bg-slate-700/50 text-slate-400'}`}
              >
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : <Play className="w-6 h-6 ml-1" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-black uppercase tracking-wider text-[10px] ${isActive ? 'text-blue-200' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {unit.name}
                  </span>
                  {isActive && <span className="bg-blue-400 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">ACTIVE</span>}
                </div>
                <h3 className={`text-lg sm:text-xl font-black leading-tight ${isLocked ? 'text-slate-400' : 'text-white'}`}>{unit.title}</h3>
              </div>

              <div className="hidden sm:flex items-center gap-1">
                {isCompleted ? [...Array(3)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < unit.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500/30 fill-slate-500/30'}`} />)
                 : isLocked ? <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg text-slate-400 text-[10px] font-bold border border-slate-700"><BrainCircuit className="w-3 h-3"/> AI UNLOCK</div>
                 : null}
              </div>
            </button>
          );
        })}
      </div>

      <AITestModal isOpen={!!selectedLockedUnit} onClose={() => setSelectedLockedUnit(null)} unit={selectedLockedUnit} onUnlock={() => {alert("Starting AI Mock Test..."); setSelectedLockedUnit(null);}} />
    </div>
  );
};

const MapView = ({ grade, unit, onBack }) => {
  const theme = MAP_THEMES[unit.theme] || MAP_THEMES.ocean;
  const [currentStationIdx, setCurrentStationIdx] = useState(0);

  // Logic sinh trạm tùy theo Lớp (Bỏ Ngữ Pháp ở Lớp 1, 2)
  const getMapNodes = () => {
    let nodes = [
      { id: 1, type: "vocab", label: "Vocabulary", icon: "🏝️", x: 15, y: 50 },
      { id: 2, type: "grammar", label: "Grammar", icon: "🧜‍♀️", x: 40, y: 20 },
      { id: 3, type: "listen", label: "Listening", icon: "🐙", x: 65, y: 80 },
      { id: 4, type: "speak", label: "AI Speaking", icon: "👑", x: 85, y: 40 }
    ];
    // Nếu là Lớp 1 hoặc 2 -> Bỏ trạm Ngữ Pháp, phân bổ lại vị trí
    if (grade.id === 'g1' || grade.id === 'g2') {
      nodes = [
        { id: 1, type: "vocab", label: "Words", icon: "🍎", x: 20, y: 60 },
        { id: 3, type: "listen", label: "Listen", icon: "🎧", x: 50, y: 30 },
        { id: 4, type: "speak", label: "Speak", icon: "🦜", x: 80, y: 70 }
      ];
    }
    return nodes;
  };
  
  const nodes = getMapNodes();

  const pathD = nodes.reduce((acc, node, i) => {
    if (i === 0) return `M ${node.x} ${node.y}`;
    const prev = nodes[i-1];
    const midX = (prev.x + node.x) / 2;
    return `${acc} Q ${midX} ${prev.y} ${node.x} ${node.y}`;
  }, "");

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in relative">
      <button onClick={onBack} className="absolute top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 border border-white/20 shadow-lg">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className={`relative w-full flex-1 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 bg-gradient-to-br ${theme.bg}`}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-xl whitespace-nowrap">
          <span className="text-white font-black tracking-wide text-xs">{unit.name}: {unit.title}</span>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
           <path d={pathD} fill="transparent" stroke={theme.pathColor} strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" />
        </svg>

        <div className="absolute z-30 transition-all duration-1000 ease-in-out -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl pointer-events-none"
          style={{ left: `${nodes[currentStationIdx].x}%`, top: `${nodes[currentStationIdx].y}%`, marginTop: '-30px' }}>
          <div className="text-5xl animate-bounce">{theme.vehicle}</div>
        </div>

        {nodes.map((node, index) => {
          const isPassed = index <= currentStationIdx;
          const isCurrent = index === currentStationIdx;
          return (
            <button key={node.id} onClick={() => setCurrentStationIdx(index)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all hover:scale-110 group ${isPassed ? 'opacity-100' : 'opacity-50 grayscale hover:grayscale-0'}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl border-[3px] backdrop-blur-md relative
                ${isCurrent ? 'bg-white/30 border-white ring-4 ring-white/20 animate-pulse' : isPassed ? 'bg-white/10 border-white/40' : 'bg-slate-900/40 border-slate-800/50'}`}>
                {node.icon}
                {isPassed && !isCurrent && <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white shadow-sm"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black shadow-lg border backdrop-blur-md
                ${isCurrent ? 'bg-white text-slate-800 border-white' : 'bg-slate-900/80 text-white border-white/10'}`}>
                {node.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ArenaView = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 animate-fade-in overflow-y-auto hide-scrollbar">
      <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4 shadow-lg rotate-3">
            <Swords className="w-10 h-10 text-white -rotate-3" />
          </div>
          <h2 className="text-3xl font-black text-white">Multiplayer Arena</h2>
          <p className="text-slate-400 text-sm mt-1">Compete with friends in real-time battles!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* JOIN ROOM */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center text-center hover:bg-slate-800/80 transition-colors">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">Join a Room</h3>
            <p className="text-slate-400 text-xs mb-6">Enter the room code provided by your teacher or friend.</p>
            <div className="w-full flex gap-2">
              <input type="text" placeholder="Room Code (e.g. AX95)" className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold uppercase text-center outline-none focus:border-blue-500" />
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 rounded-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">JOIN</button>
            </div>
          </div>

          {/* CREATE ROOM */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-6 flex flex-col hover:from-indigo-900/60 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-8 h-8 text-indigo-400" />
              <div>
                <h3 className="text-xl font-black text-white">Host a Game</h3>
                <p className="text-indigo-300/60 text-xs">Create a new arena battle</p>
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-slate-300">Game Mode</span>
                <select className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600 outline-none">
                  <option>Classic Quiz</option>
                  <option>Monster Raid</option>
                  <option>Treasure Hunt</option>
                </select>
              </div>
              <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-slate-300">Questions</span>
                <select className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600 outline-none">
                  <option>10 Questions</option>
                  <option>20 Questions</option>
                </select>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 rounded-xl border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
              <Gamepad2 className="w-5 h-5" /> CREATE ROOM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PracticeView = () => {
  const practiceModes = [
    { id: 'listen', title: 'Listening', icon: Volume2, color: 'from-blue-400 to-blue-600', border: 'border-blue-800', desc: 'Listen and choose the correct answer' },
    { id: 'speak', title: 'AI Speaking', icon: Mic, color: 'from-pink-400 to-rose-600', border: 'border-rose-800', desc: 'Speak to AI and get scored' },
    { id: 'read', title: 'Reading', icon: Library, color: 'from-amber-400 to-orange-500', border: 'border-orange-700', desc: 'Read passages and answer questions' },
    { id: 'write', title: 'Writing', icon: Type, color: 'from-emerald-400 to-green-600', border: 'border-green-800', desc: 'Drag and drop to build sentences' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto hide-scrollbar">
      <div className="mb-8 text-center mt-8 sm:mt-0">
        <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Training Ground</h2>
        <p className="text-white/60 font-medium text-sm mt-1">Master your English skills</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl w-full">
        {practiceModes.map(mode => (
          <button key={mode.id} className={`bg-gradient-to-br ${mode.color} p-6 rounded-[2rem] border-b-[6px] ${mode.border} flex flex-col items-center text-center hover:-translate-y-2 active:translate-y-0 active:border-b-0 transition-all shadow-xl group`}>
            <div className="bg-white/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
              <mode.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-black text-white text-lg mb-1">{mode.title}</h3>
            <p className="text-white/80 text-[10px] font-bold leading-tight">{mode.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const MainLayout = ({ user, handleLogout }) => {
  const [currentView, setCurrentView] = useState('grades'); // 'grades', 'units', 'map', 'arena', 'practice'
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  // Trạng thái hover menu trên Desktop
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Cảnh báo màn hình dọc (Không khóa cứng nữa)
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissWarning, setDismissWarning] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Chỉ kiểm tra đơn giản: Chiều cao > Rộng và thiết bị nhỏ
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 900;
      setIsPortrait(portrait); 
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const navItems = [
    { id: 'classes', label: "Courses", icon: Library, color: 'text-emerald-400', onClick: () => setCurrentView('grades') },
    { id: 'practice', label: "Practice", icon: Dumbbell, color: 'text-blue-400', onClick: () => setCurrentView('practice') },
    { id: 'arena', label: "Arena", icon: Swords, color: 'text-orange-400', onClick: () => setCurrentView('arena') }
  ];
  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: "Admin", icon: Shield, color: 'text-rose-400', onClick: () => alert('Admin Panel - Coming Soon!') });
  }

  const renderContent = () => {
    switch(currentView) {
      case 'grades': return <GradesView onSelectGrade={(g) => { setSelectedGrade(g); setCurrentView('units'); }} />;
      case 'units': return <UnitsView grade={selectedGrade} onBack={() => setCurrentView('grades')} onSelectUnit={(u) => { setSelectedUnit(u); setCurrentView('map'); }} />;
      case 'map': return <MapView grade={selectedGrade} unit={selectedUnit} onBack={() => setCurrentView('units')} />;
      case 'arena': return <ArenaView />;
      case 'practice': return <PracticeView />;
      default: return <GradesView onSelectGrade={(g) => {setSelectedGrade(g); setCurrentView('units')}} />;
    }
  };

  // Nền chung của App (Xanh Sky phiêu lưu)
  const appBg = 'bg-[#1e293b]'; // Slate-800 dark theme as base

  return (
    <>
      {/* KHUYẾN CÁO XOAY MÀN HÌNH (Không khóa cứng) */}
      {(isPortrait && !dismissWarning) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[9999] bg-slate-800/90 backdrop-blur-xl text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-blue-500/50 animate-fade-in">
          <div className="flex items-center gap-3">
            <RotateCw className="w-6 h-6 animate-spin-slow text-blue-400 shrink-0" />
            <p className="text-xs font-bold text-slate-200">For the best experience, please rotate your device horizontally.</p>
          </div>
          <button onClick={() => setDismissWarning(true)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 active:scale-95 shrink-0 ml-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* GIAO DIỆN CHÍNH */}
      <div className={`flex h-screen w-screen overflow-hidden ${appBg} font-sans selection:bg-white/30`}>
        <style>{globalStyles}</style>
        
        {/* Nền lưới trang trí toàn bối cảnh */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        {/* Cấu trúc Sidebar (Tự ẩn nhỏ lại, Hover thì phình ra) */}
        <aside 
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          className={`hidden sm:flex flex-col bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 ease-in-out z-50 shadow-2xl relative
          ${isSidebarHovered ? 'w-56' : 'w-[72px]'} hide-scrollbar`}
        >
          {/* Logo */}
          <div className="p-4 flex items-center h-16 border-b border-white/5 shrink-0 overflow-hidden">
            <div className="min-w-[40px] h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className={`ml-3 transition-opacity duration-300 whitespace-nowrap ${isSidebarHovered ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-lg font-black text-white tracking-wide">EXPLORER</h1>
            </div>
          </div>

          {/* Nav Menu */}
          <nav className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto hide-scrollbar">
            {navItems.map(item => (
              <button key={item.id} onClick={item.onClick}
                className={`flex items-center p-3 rounded-xl font-black text-sm transition-all border border-transparent 
                ${currentView === item.id ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                title={item.label}
              >
                <item.icon className={`min-w-[24px] h-6 ${item.color}`} />
                <span className={`ml-4 transition-all duration-300 whitespace-nowrap ${isSidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
          
          {/* Khối Tác Giả & Logout (Tinh gọn) */}
          <div className="p-3 border-t border-white/5 flex flex-col gap-2 shrink-0">
             <div className={`bg-slate-900/80 p-3 rounded-xl border border-white/5 transition-all duration-300 overflow-hidden
               ${isSidebarHovered ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0 p-0 border-transparent'}`}>
               <p className="text-white/40 font-bold text-[9px] uppercase mb-1">Creator</p>
               <p className="text-white font-black text-xs mb-1">Mr. Khoa</p>
               <div className="flex flex-col gap-1 text-white/40 text-[10px] font-medium">
                 <span className="flex items-center gap-2 truncate"><Mail className="w-3 h-3 shrink-0"/> khoavuexp@gmail.com</span>
                 <span className="flex items-center gap-2"><Phone className="w-3 h-3 shrink-0"/> 0901.637.827</span>
               </div>
             </div>

            <button onClick={handleLogout} className="flex items-center p-3 rounded-xl font-black text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-400 transition-all" title="Log Out">
              <LogOut className="min-w-[24px] h-6" /> 
              <span className={`ml-4 transition-all duration-300 whitespace-nowrap ${isSidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full relative z-10">
          <TopMetricsBar user={user} />
          
          <div className="flex-1 overflow-hidden relative">
            {renderContent()}
          </div>
        </div>

        {/* Mobile Bottom Nav (Chỉ hiện trên điện thoại khi xoay ngang) */}
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

  return (
    <MainLayout user={user} handleLogout={() => alert("Mock Logout")} />
  );
}