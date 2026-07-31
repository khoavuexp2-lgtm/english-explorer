import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Swords, Dumbbell, LineChart, LogOut, Play, 
  Mic, Headphones, Flame, Heart, Lock, CheckCircle2, Star, 
  X, MessageSquare, ChevronRight, Trophy, Zap, Compass, Library, Shield,
  Menu, Mail, Phone, Rocket, Crown, BrainCircuit, ChevronLeft,
  RotateCw, Plus, Users, Target, Clock, Settings, Gamepad2, Volume2,
  Timer, Award, UserCheck, ShieldAlert, Check, AlertCircle, ArrowRight,
  Fingerprint, Sparkles, Medal, BookOpen, PenTool
} from 'lucide-react';

const globalStyles = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  .animate-shake { animation: shake 0.4s ease-in-out; }
  @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  .animate-float { animation: float 3s ease-in-out infinite; }
  @keyframes pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
  .animate-pulse-ring { animation: pulse-ring 2s infinite; }
`;

const MOCK_USERS = [
  { uid: "admin1", name: "Mr. Khoa", email: "khoavuexp@gmail.com", role: "superadmin", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Khoa", status: "active", inventory: { stars: 999, flames: 50, lives: 5 } },
  { uid: "admin2", name: "Teacher Anna", email: "anna@gmail.com", role: "admin", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Anna", status: "active", inventory: { stars: 500, flames: 20, lives: 5 } },
  { uid: "stu1", name: "Alex Student", email: "alex@gmail.com", role: "student", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex", status: "active", inventory: { stars: 120, flames: 5, lives: 3 } }
];

const MOTIVATIONAL_QUOTES = [
  { text: "Every mistake is a step forward!", icon: Sparkles, color: "text-yellow-400" },
  { text: "You are a vocabulary ninja!", icon: Swords, color: "text-blue-400" },
  { text: "Practice makes perfect!", icon: Target, color: "text-emerald-400" },
  { text: "Keep pushing your limits!", icon: Rocket, color: "text-orange-400" },
  { text: "English is your superpower!", icon: Zap, color: "text-purple-400" }
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
  forest: { bg: "from-[#14532d] to-[#064e3b]", vehicle: "🚙", pathColor: "rgba(255,255,255,0.3)" }
};

const GRADE_5_UNITS = [
  { id: 'u1', name: "Unit 1", title: "What's your address?", status: 'active', theme: 'ocean', progress: 0 },
  { id: 'u2', name: "Unit 2", title: "I always get up early", status: 'locked', theme: 'forest', progress: 0 },
];

const GAME_DATA = {
  vocab: {
    type: 'multiple-choice',
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80",
    question: "Vocabulary: Look at the picture and choose the correct word.",
    options: ["Village", "City", "Mountain", "Tower"],
    answer: "City",
    explain: "City (Thành phố) là nơi có nhiều tòa nhà cao tầng và giao thông nhộn nhịp."
  },
  grammar: {
    type: 'order',
    question: "Grammar: Arrange the words to make a correct sentence.",
    words: ["live", "do", "Where", "you", "?"],
    answer: "Where do you live ?",
    explain: "Cấu trúc hỏi nơi ở: Where + do/does + S + live?"
  },
  listen: {
    type: 'listen-fill',
    audioText: "My hometown is a small and quiet village.",
    question: "Listening: Listen and choose the missing words.",
    textBefore: "My hometown is a",
    textAfter: "village.",
    options: ["big and noisy", "small and quiet", "large and crowded", "far and busy"],
    answer: "small and quiet",
    explain: "Trong audio đọc rõ cụm từ 'small and quiet' (nhỏ và yên tĩnh)."
  },
  read: {
    type: 'multiple-choice',
    passage: "Trung lives with his grandparents in Hanoi. His address is 81, Tran Hung Dao Street, Hoan Kiem District. It is a big and busy city.",
    question: "Reading: Who does Trung live with?",
    options: ["His parents", "His friends", "His grandparents", "His uncle"],
    answer: "His grandparents",
    explain: "Đoạn văn ghi rõ: 'Trung lives with his grandparents' (Trung sống với ông bà)."
  },
  boss: {
    type: 'speak',
    question: "Final Boss! Read the sentence aloud clearly to defeat the Boss:",
    targetText: "I live in a big city",
    hint: "Nhấn nút Mic để bắt đầu thu âm. Bạn cần phát âm chuẩn từng từ nhé!"
  }
};

const playAudio = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

// Hàm chấm điểm phát âm cơ bản (Mô phỏng AI)
const evaluateSpeech = (transcript, target) => {
  const cleanTranscript = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const cleanTarget = target.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  
  if (cleanTranscript === cleanTarget) return { pass: true, msg: "Perfect pronunciation!" };
  
  // Kiểm tra lỗi sai phổ biến (Ví dụ user nói bag thay vì big)
  if (cleanTranscript.includes('bag') && cleanTarget.includes('big')) {
    return { pass: false, msg: "Bạn đã phát âm sai từ 'big' thành 'bag' (cái túi). Hãy phát âm âm /ɪ/ ngắn nhé!" };
  }
  
  return { pass: false, msg: `Hệ thống nghe được: "${transcript}". Chưa chính xác, hãy thử lại!` };
};

const TopMetricsBar = ({ user }) => (
  <div className="flex items-center justify-between px-4 sm:px-8 py-2 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40 border-b border-white/10 shadow-sm h-14 shrink-0">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl border border-white/20">
        <Compass className="w-5 h-5 text-yellow-300 animate-pulse" />
        <span className="font-black text-sm text-white tracking-wide">EXPLORER</span>
      </div>
    </div>
    <div className="flex items-center gap-2 sm:gap-4 scale-90 sm:scale-100 origin-right">
      <div className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-500/30 shadow-lg">
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        <span className="font-black text-rose-100 text-sm">{user.inventory.lives}</span>
      </div>
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
        <span className="text-[9px] font-black text-blue-200 uppercase tracking-wider">{user.role}</span>
        <span className="text-xs font-black text-white leading-none">{user.name.split(' ')[0]}</span>
      </div>
      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-lg bg-white/20 border-2 border-white/30 object-cover" />
    </div>
  </div>
</div>
);

const GameModal = ({ isOpen, onClose, station, onWin, user, updateUser }) => {
  if (!isOpen || !station) return null;
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [orderedWords, setOrderedWords] = useState([]);
  const [status, setStatus] = useState('playing'); // playing, correct, wrong
  const [feedbackMsg, setFeedbackMsg] = useState("");
  
  // States cho Voice Recognition
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const qData = GAME_DATA[station.type];

  // Auto-speak complete sentence when grammar order is correct
  useEffect(() => {
    if (status === 'correct' && qData?.type === 'order') {
      playAudio(qData.answer);
    }
  }, [status, qData]);

  // Setup Web Speech API
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
          setFeedbackMsg("Lỗi Mic: " + event.error);
          setIsListening(false);
          setStatus('wrong');
        };
      } else {
        setFeedbackMsg("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói. Vui lòng dùng Chrome/Edge.");
        setStatus('wrong');
      }
    }
  }, [qData]);

  if (!qData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl">
          <h3 className="text-2xl font-black text-slate-800 mb-2">🚧 Coming Soon!</h3>
          <p className="text-slate-600 font-medium mb-6">This station is under construction.</p>
          <button onClick={onClose} className="w-full py-4 bg-blue-500 text-white font-black rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-0">CLOSE</button>
        </div>
      </div>
    );
  }

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setStatus('playing');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleVoiceCheck = (spokenText) => {
    const evaluation = evaluateSpeech(spokenText, qData.targetText);
    setFeedbackMsg(evaluation.msg);
    if (evaluation.pass) {
       setStatus('correct');
    } else {
       setStatus('wrong');
       if (user && updateUser && user.inventory.lives > 0) {
          updateUser({...user, inventory: {...user.inventory, lives: user.inventory.lives - 1}});
       }
    }
  };

  const handleSelectOption = (opt) => {
    setSelectedOpt(opt);
    playAudio(opt);
  };

  const handleCheck = () => {
    if (qData.type === 'multiple-choice' || qData.type === 'listen-fill' || qData.type === 'read') {
      if (selectedOpt === qData.answer) {
        setStatus('correct');
        setFeedbackMsg("Tuyệt vời!");
      }
      else {
        setStatus('wrong');
        setFeedbackMsg(qData.explain);
        if (user && updateUser && user.inventory.lives > 0) {
           updateUser({...user, inventory: {...user.inventory, lives: user.inventory.lives - 1}});
        }
      }
    } else if (qData.type === 'order') {
      if (orderedWords.join(" ") === qData.answer) {
        setStatus('correct');
        setFeedbackMsg("Chính xác!");
      }
      else {
        setStatus('wrong');
        setFeedbackMsg(qData.explain);
        if (user && updateUser && user.inventory.lives > 0) {
           updateUser({...user, inventory: {...user.inventory, lives: user.inventory.lives - 1}});
        }
      }
    }
  };

  const handleOrderWord = (w) => {
    if (orderedWords.includes(w)) setOrderedWords(orderedWords.filter(x => x !== w));
    else {
      setOrderedWords([...orderedWords, w]);
      playAudio(w);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {user && user.inventory.lives <= 0 ? (
        <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-pop border-4 border-rose-500">
          <Heart className="w-20 h-20 text-rose-500 fill-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-3xl font-black text-slate-800 mb-2">Hết Tim Rồi!</h3>
          <p className="text-slate-600 font-medium mb-8">Bạn đã trả lời sai quá nhiều. Hãy nghỉ ngơi một chút hoặc bơm tim để tiếp tục hành trình nhé!</p>
          <button onClick={() => { 
            updateUser({...user, inventory: {...user.inventory, lives: 5}});
            setStatus('playing');
            setFeedbackMsg("");
          }} className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg rounded-xl border-b-4 border-rose-700 active:translate-y-1 active:border-b-0 shadow-lg">
            BƠM ĐẦY TIM (DEMO)
          </button>
        </div>
      ) : (
      <div className={`bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col overflow-hidden relative ${status==='wrong' ? 'animate-shake border-4 border-rose-500' : status==='correct' ? 'border-4 border-emerald-500' : ''}`}>
        
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{station.icon}</span>
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-wide">{station.label}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 text-slate-600"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh] hide-scrollbar">
          {qData.image && <img src={qData.image} alt="Visual" className="w-full h-48 object-cover rounded-xl shadow-md border-2 border-slate-100" />}
          
          {qData.passage && <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-slate-700 font-medium text-sm leading-relaxed shadow-inner">{qData.passage}</div>}

          <h2 className="text-xl font-black text-slate-800 flex items-start gap-3">
            {(qData.type === 'listen-fill' || qData.type === 'speak') && (
               <button onClick={() => playAudio(qData.audioText || qData.targetText)} className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-95 shrink-0 shadow-md">
                 <Volume2 className="w-6 h-6" />
               </button>
            )}
            <span className="pt-1">{qData.question}</span>
          </h2>

          {/* SPEAKING COMPONENT */}
          {qData.type === 'speak' && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="text-2xl font-black text-slate-800 text-center px-4">"{qData.targetText}"</div>
              
              <button 
                onClick={toggleListen}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse-ring' : 'bg-slate-100 text-slate-600 border-4 border-slate-200 hover:bg-slate-200 hover:scale-105'}`}
              >
                <Mic className={`w-10 h-10 ${isListening ? 'animate-bounce' : ''}`} />
              </button>
              
              <div className="text-center">
                {isListening ? (
                  <p className="text-rose-500 font-bold animate-pulse">Listening... (Tap again to stop)</p>
                ) : (
                  <p className="text-slate-500 font-medium text-sm">{transcript ? `You said: "${transcript}"` : qData.hint}</p>
                )}
              </div>
            </div>
          )}

          {/* OTHER COMPONENTS (Multiple choice, Order) */}
          {(qData.type === 'multiple-choice' || qData.type === 'listen-fill' || qData.type === 'read') && (
            <div className="flex flex-col gap-3">
              {qData.type === 'listen-fill' && (
                 <div className="text-base font-bold text-slate-700 text-center py-4 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl">
                   {qData.textBefore} <span className="inline-block min-w-[80px] border-b-4 border-blue-400 mx-2 text-blue-600">{selectedOpt || '...'}</span> {qData.textAfter}
                 </div>
              )}
              <div className="grid grid-cols-1 gap-3">
                {qData.options.map(opt => (
                  <button key={opt} onClick={() => handleSelectOption(opt)} disabled={status!=='playing'}
                    className={`p-4 rounded-xl border-b-4 font-bold text-left transition-all
                    ${selectedOpt === opt ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:-translate-y-1'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {qData.type === 'order' && (
            <div className="flex flex-col gap-4">
              <div className="min-h-[60px] p-4 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-wrap gap-2 items-center">
                {orderedWords.map((w, i) => <span key={i} onClick={() => handleOrderWord(w)} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg cursor-pointer shadow-sm hover:scale-105 transition-transform">{w}</span>)}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {qData.words.filter(w => !orderedWords.includes(w)).map((w, i) => <span key={i} onClick={() => handleOrderWord(w)} className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer hover:bg-slate-50 hover:-translate-y-1 transition-transform">{w}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {status === 'playing' ? (
            qData.type !== 'speak' && (
              <button onClick={handleCheck} className="w-full py-4 bg-blue-500 text-white font-black rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 hover:bg-blue-400">CHECK ANSWER</button>
            )
          ) : (
            <div className={`p-4 rounded-xl flex flex-col gap-4 animate-pop ${status === 'correct' ? 'bg-emerald-100 border border-emerald-300' : 'bg-rose-100 border border-rose-300'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full text-white shrink-0 ${status === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {status === 'correct' ? <Check className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
                  </div>
                  <div>
                    <h3 className={`font-black text-xl ${status === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>{status === 'correct' ? 'Excellent!' : 'Needs Work'}</h3>
                    <p className={`text-sm font-medium mt-1 ${status === 'correct' ? 'text-emerald-600' : 'text-rose-600'}`}>{feedbackMsg}</p>
                  </div>
                </div>
                {status === 'correct' && (qData.type === 'order' || qData.type === 'speak') && (
                  <button onClick={() => playAudio(qData.answer || qData.targetText)} className="p-2 bg-emerald-200 text-emerald-800 rounded-full hover:bg-emerald-300 transition-colors shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              <button onClick={status === 'correct' ? onWin : () => {setSelectedOpt(null); setOrderedWords([]); setStatus('playing'); setTranscript("");}} 
                className={`w-full py-3 text-white font-black rounded-xl shadow-md transition-all active:translate-y-1 active:shadow-none ${status === 'correct' ? 'bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700' : 'bg-rose-500 hover:bg-rose-600 border-b-4 border-rose-700'}`}>
                {status === 'correct' ? 'CONTINUE' : 'TRY AGAIN'}
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

const MapView = ({ grade, unit, onBack, user, updateUser }) => {
  const theme = MAP_THEMES[unit.theme] || MAP_THEMES.ocean;
  const [currentStationIdx, setCurrentStationIdx] = useState(unit.progress || 0);
  const [activeGame, setActiveGame] = useState(null);

  const getMapNodes = (themeId) => {
    const baseNodes = [
      { id: 1, type: "vocab", x: 20, y: 80 }, { id: 2, type: "grammar", x: 45, y: 65 }, 
      { id: 3, type: "listen", x: 75, y: 55 }, { id: 4, type: "read", x: 40, y: 30 }, 
      { id: 5, type: "boss", x: 80, y: 15 }
    ];
    const themeStyles = {
      ocean: [ { label: "Word Island", icon: "🏝️" }, { label: "Grammar Reef", icon: "🪸" }, { label: "Listen Shell", icon: "🐚" }, { label: "Read Cave", icon: "🌊" }, { label: "Kraken Boss", icon: "🦑" } ],
      forest: [ { label: "Word Tree", icon: "🌲" }, { label: "Grammar Hut", icon: "🛖" }, { label: "Listen Bird", icon: "🦜" }, { label: "Read Bear", icon: "🐻" }, { label: "Tiger Boss", icon: "🐯" } ],
      space: [ { label: "Word Planet", icon: "🪐" }, { label: "Grammar Comet", icon: "☄️" }, { label: "Listen Radar", icon: "🛰️" }, { label: "Read Alien", icon: "👽" }, { label: "UFO Boss", icon: "🛸" } ]
    };
    const styles = themeStyles[themeId] || themeStyles.ocean;
    
    if (grade.id === 'g1' || grade.id === 'g2') {
      return [
        { ...baseNodes[0], ...styles[0] }, { ...baseNodes[2], ...styles[2], x: 60, y: 65 },
        { ...baseNodes[3], ...styles[3], x: 30, y: 35 }, { ...baseNodes[4], ...styles[4], x: 70, y: 15, label: "Mini Boss" }
      ];
    }
    return baseNodes.map((node, i) => ({ ...node, ...styles[i] }));
  };
  
  const nodes = getMapNodes(unit.theme);
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
  <GameModal isOpen={!!activeGame} onClose={() => setActiveGame(null)} station={activeGame} user={user} updateUser={updateUser} onWin={() => {
    setActiveGame(null);
    if (updateUser && user) updateUser({...user, inventory: {...user.inventory, stars: user.inventory.stars + 15}});
    
    if (currentStationIdx < nodes.length - 1) setCurrentStationIdx(p => p + 1);
    else {
       alert("🎉 Xuất sắc! Bạn đã đánh bại Boss và hoàn thành Unit này! (+50 Sao)");
       if (updateUser && user) updateUser({...user, inventory: {...user.inventory, stars: user.inventory.stars + 50}});
       onBack();
    }
  }} />
</div>
);
};

const UnitsView = ({ grade, onBack, onSelectUnit }) => (
  <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in h-full flex flex-col">
    <div className="flex items-center gap-4 mb-8 shrink-0">
      <button onClick={onBack} className="p-3 bg-white/10 rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
      <div><h2 className="text-3xl font-black text-white drop-shadow-md">{grade.name} Journey</h2></div>
    </div>
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-20 hide-scrollbar">
      {GRADE_5_UNITS.map(unit => (
        <button key={unit.id} onClick={() => !unit.locked && onSelectUnit(unit)} 
          className={`relative flex items-center p-5 rounded-[2rem] border-b-[6px] w-full text-left transition-transform active:translate-y-1 active:border-b-0
          ${unit.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-indigo-800 hover:brightness-110 shadow-xl' : 'bg-slate-800/40 border-slate-900/50 opacity-80 cursor-not-allowed'}`}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mr-5 text-white shrink-0">
            {unit.status === 'locked' ? <Lock className="w-6 h-6" /> : <Play className="w-7 h-7 ml-1" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{unit.name}: {unit.title}</h3>
            {unit.status === 'locked' && <p className="text-sm font-medium text-blue-200 mt-1">Pass AI test to unlock</p>}
          </div>
        </button>
      ))}
    </div>
  </div>
);

const GradesView = ({ onSelectGrade }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
    <div className="mb-8 text-center"><h2 className="text-4xl font-black text-white drop-shadow-lg">Select Your Grade</h2></div>
    <div className="flex flex-wrap justify-center items-center gap-4 max-w-5xl w-full">
      {GRADES.map(grade => (
        <button key={grade.id} onClick={() => !grade.locked && onSelectGrade(grade)} 
          className={`relative flex-1 min-w-[140px] max-w-[180px] text-left p-5 rounded-[2rem] border-b-[8px] transition-all
          ${grade.locked ? 'bg-slate-800/60 border-slate-900/80 cursor-not-allowed opacity-70' : `bg-gradient-to-b ${grade.color} border-black/20 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:border-b-0`}`}>
          {grade.locked && <div className="absolute inset-0 bg-slate-900/60 z-10 rounded-[2rem] flex items-center justify-center"><Lock className="w-8 h-8 text-white/50" /></div>}
          <div className="p-3 rounded-2xl bg-white/20 text-white w-fit mb-4"><grade.icon className="w-8 h-8" /></div>
          <h3 className="font-black text-2xl text-white">{grade.name}</h3>
          <p className="text-xs font-bold text-white/70 mt-1">{grade.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const AdminPanel = ({ currentUser }) => {
  const [users, setUsers] = useState(MOCK_USERS);
  
  const toggleBlock = (uid) => setUsers(users.map(u => u.uid === uid ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
  const toggleRole = (uid) => setUsers(users.map(u => u.uid === uid ? { ...u, role: u.role === 'student' ? 'admin' : 'student' } : u));

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in w-full h-full overflow-y-auto hide-scrollbar">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-slate-200">
        <div className="p-6 bg-slate-900 text-white border-b-4 border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3"><ShieldAlert className="w-8 h-8 text-rose-500"/><h2 className="text-2xl font-black">Admin Control Panel</h2></div>
          <div className="bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold border border-slate-700">Logged in as: <span className="text-purple-400 uppercase">{currentUser.role}</span></div>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 font-bold border-b-2 border-slate-100">
                <th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                // Logic: Admins cannot modify Super Admins. 
                const canModify = currentUser.role === 'superadmin' || (currentUser.role === 'admin' && u.role !== 'superadmin');
                
                return (
                  <tr key={u.uid} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <img src={u.avatar} className="w-12 h-12 rounded-2xl bg-slate-200 border-2 border-white shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{u.name}</p>
                        <p className="text-sm text-slate-500 font-medium">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider
                        ${u.role==='superadmin' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                          u.role==='admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider
                        ${u.status==='active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600 border border-slate-300'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {canModify ? (
                        <div className="flex justify-end gap-2">
                           {u.role !== 'superadmin' && (
                             <button onClick={()=>toggleRole(u.uid)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 border
                               ${u.role === 'admin' ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200' : 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'}`}>
                               {u.role === 'admin' ? 'DEMOTE' : 'PROMOTE'}
                             </button>
                           )}
                           <button onClick={()=>toggleBlock(u.uid)} className={`px-4 py-2 rounded-xl text-xs font-black text-white border-b-[3px] transition-all active:translate-y-[2px] active:border-b-0
                             ${u.status==='active' ? 'bg-rose-500 border-rose-700 hover:bg-rose-400' : 'bg-emerald-500 border-emerald-700 hover:bg-emerald-400'}`}>
                             {u.status === 'active' ? 'BLOCK' : 'UNBLOCK'}
                           </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">RESTRICTED</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PracticeHub = () => (
  <div className="p-8 max-w-6xl mx-auto animate-fade-in w-full h-full overflow-y-auto hide-scrollbar">
    <div className="mb-8">
      <h2 className="text-4xl font-black text-white drop-shadow-md mb-2">Practice Hub</h2>
      <p className="text-slate-400 font-medium text-lg">Master your skills across all domains.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] border-b-[8px] border-indigo-900 text-white cursor-pointer hover:-translate-y-2 transition-transform shadow-xl">
        <Timer className="w-12 h-12 mb-4 text-indigo-200" />
        <h3 className="text-3xl font-black mb-2">45-Min Mock Test</h3>
        <p className="text-indigo-100 text-base font-medium">Simulate a full school exam with diverse question types. Get ready for mid-terms!</p>
      </div>
      <div className="p-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] border-b-[8px] border-amber-700 text-white cursor-pointer hover:-translate-y-2 transition-transform shadow-xl">
        <Medal className="w-12 h-12 mb-4 text-amber-100" />
        <h3 className="text-2xl font-black mb-2">Cambridge Advanced</h3>
        <p className="text-amber-50 text-sm font-medium">Extra vocabulary and complex structures to ace international exams.</p>
      </div>
      <div className="p-6 bg-slate-800 rounded-[2rem] border-b-[6px] border-slate-900 text-white cursor-pointer hover:-translate-y-1 transition-transform shadow-lg group">
        <Headphones className="w-10 h-10 mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-black mb-2">Listening Hub</h3>
        <p className="text-slate-400 text-sm font-medium">Train your ears with native speaker audio and dictation exercises.</p>
      </div>
      <div className="p-6 bg-slate-800 rounded-[2rem] border-b-[6px] border-slate-900 text-white cursor-pointer hover:-translate-y-1 transition-transform shadow-lg group">
        <BookOpen className="w-10 h-10 mb-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-black mb-2">Reading Comprehension</h3>
        <p className="text-slate-400 text-sm font-medium">Read exciting stories and answer questions to boost understanding.</p>
      </div>
      <div className="p-6 bg-slate-800 rounded-[2rem] border-b-[6px] border-slate-900 text-white cursor-pointer hover:-translate-y-1 transition-transform shadow-lg group">
        <PenTool className="w-10 h-10 mb-4 text-rose-400 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-black mb-2">Writing Mastery</h3>
        <p className="text-slate-400 text-sm font-medium">Practice sentence ordering and paragraph construction step-by-step.</p>
      </div>
    </div>
  </div>
);

const ArenaLobby = () => (
  <div className="p-8 max-w-5xl mx-auto animate-fade-in w-full h-full flex flex-col items-center justify-center">
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] w-full max-w-lg shadow-2xl text-center">
      <div className="w-24 h-24 bg-gradient-to-tr from-orange-400 to-rose-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
        <Swords className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-4xl font-black text-white mb-3">Arena Lobby</h2>
      <p className="text-slate-400 font-medium text-lg mb-10">Join a live multiplayer match or host your own epic battle!</p>
      
      <div className="flex flex-col gap-4">
        <div className="bg-slate-800 p-2 rounded-3xl flex items-center gap-2 border border-slate-700 focus-within:border-blue-500 transition-colors">
          <Gamepad2 className="w-6 h-6 text-slate-400 ml-4 shrink-0" />
          <input type="text" placeholder="Enter Room PIN" className="w-full bg-transparent text-white font-black text-xl outline-none px-2 py-3 tracking-widest placeholder-slate-500" />
          <button className="bg-blue-500 text-white font-black py-3 px-8 rounded-2xl hover:bg-blue-400 transition-colors shrink-0">JOIN</button>
        </div>
        
        <div className="flex items-center gap-4 my-4"><div className="h-px bg-slate-700 flex-1"></div><span className="text-slate-500 font-bold text-sm uppercase tracking-widest">OR</span><div className="h-px bg-slate-700 flex-1"></div></div>
        
        <button className="w-full bg-slate-800 text-white font-black py-5 text-lg rounded-[2rem] border-2 border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-3">
          <Crown className="w-6 h-6 text-yellow-400" /> HOST A MATCH
        </button>
      </div>
    </div>
  </div>
);

const OnboardingView = ({ onLogin }) => (
  <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 animate-fade-in relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-purple-900/20"></div>
    <div className="z-10 bg-slate-950/60 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-md w-[90%]">
      <div className="w-28 h-28 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
        <Rocket className="w-14 h-14 text-white" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight mb-3">Global Explorer</h1>
      <p className="text-slate-400 font-medium text-lg mb-10">Embark on a journey to master English.</p>
      
      <button onClick={() => onLogin(MOCK_USERS[2])} className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-xl mb-4 text-lg">
        <Fingerprint className="w-6 h-6" /> Login as Student
      </button>
</div>
</div>
);

const MainLayout = ({ user, handleLogout, updateUser }) => {
  const [currentView, setCurrentView] = useState('grades'); // grades, units, map, admin, practice, arena
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  useEffect(() => {
    setDailyQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isTouch = (window.matchMedia("(pointer: coarse)").matches);
      setShowOrientationWarning(isPortrait && isTouch);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const navItems = [
    { id: 'grades', label: "Courses", icon: Library, color: 'text-emerald-400' },
    { id: 'practice', label: "Practice", icon: Dumbbell, color: 'text-blue-400' },
    { id: 'arena', label: "Arena", icon: Swords, color: 'text-orange-400' }
  ];

  if (user.role === 'admin' || user.role === 'superadmin') {
    navItems.push({ id: 'admin', label: "Admin Panel", icon: ShieldAlert, color: 'text-rose-400' });
  }

  const renderContent = () => {
    switch(currentView) {
      case 'grades': return <GradesView onSelectGrade={(g) => { setSelectedGrade(g); setCurrentView('units'); }} />;
      case 'units': return <UnitsView grade={selectedGrade} onBack={() => setCurrentView('grades')} onSelectUnit={(u) => { setSelectedUnit(u); setCurrentView('map'); }} />;
      case 'map': return <MapView grade={selectedGrade} unit={selectedUnit} onBack={() => setCurrentView('units')} user={user} updateUser={updateUser} />;
      case 'admin': return <AdminPanel currentUser={user} />;
      case 'practice': return <PracticeHub />;
      case 'arena': return <ArenaLobby />;
      default: return <GradesView onSelectGrade={(g) => {setSelectedGrade(g); setCurrentView('units')}} />;
    }
  };

  return (
    <>
      {showOrientationWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-fit z-[9999] bg-slate-900/90 backdrop-blur-xl text-white px-5 py-3 rounded-full shadow-2xl flex items-center justify-between border border-blue-500/30 animate-fade-in gap-4">
          <RotateCw className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-xs font-bold text-slate-200">For the best experience, please rotate your device horizontally.</p>
          <button onClick={() => setShowOrientationWarning(false)} className="p-1.5 hover:bg-white/10 rounded-full active:scale-95 shrink-0"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      )}

      <div className="flex h-screen w-screen overflow-hidden bg-[#0f172a] font-sans selection:bg-white/30">
        <style>{globalStyles}</style>
        
        {/* Dynamic Sidebar - Tối ưu kích thước */}
        <aside className="hidden sm:flex flex-col bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 ease-in-out z-50 shadow-2xl relative w-16 hover:w-64 group hide-scrollbar">
          <div className="p-3 flex items-center h-16 border-b border-white/5 shrink-0 overflow-hidden">
            <div className="min-w-[40px] h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg"><Rocket className="w-6 h-6 text-white" /></div>
            <div className="ml-3 transition-opacity duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100"><h1 className="text-lg font-black text-white tracking-wide">EXPLORER</h1></div>
          </div>

          <nav className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto hide-scrollbar">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setCurrentView(item.id)}
                className={`flex items-center p-3 rounded-xl font-black text-sm transition-all border border-transparent overflow-hidden
                ${currentView === item.id ? 'bg-white/10 text-white shadow-inner border-white/10' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                <item.icon className={`min-w-[24px] h-6 ${item.color}`} />
                <span className="ml-4 transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Motivational & Footer - Thiết kế lớn và lấp đầy khoảng trống */}
          <div className="p-4 border-t border-white/5 flex flex-col gap-4 shrink-0 overflow-hidden">
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-[1.5rem] border border-white/10 transition-all duration-500 overflow-hidden opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-64 flex flex-col items-center text-center gap-3 shadow-xl">
              <div className={`p-3 rounded-2xl bg-white/5 ${dailyQuote.color}`}>
                <dailyQuote.icon className="w-8 h-8" />
              </div>
              <p className={`text-sm md:text-base font-black leading-snug ${dailyQuote.color}`}>"{dailyQuote.text}"</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-[1.5rem] border border-white/5 transition-all duration-500 overflow-hidden opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 shadow-inner flex flex-col justify-center">
               <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mb-1">Creator</p>
               <p className="text-white font-black text-sm mb-2">Mr. Khoa</p>
               <div className="flex flex-col gap-1.5 text-white/50 text-xs font-medium">
                 <span className="flex items-center gap-2 truncate hover:text-white transition-colors"><Mail className="w-3.5 h-3.5 shrink-0"/> khoavuexp@gmail.com</span>
                 <span className="flex items-center gap-2 truncate hover:text-white transition-colors"><Phone className="w-3.5 h-3.5 shrink-0"/> Zalo: 0901 637 827</span>
               </div>
            </div>
            
            <button onClick={handleLogout} className="flex items-center justify-center p-3 rounded-xl font-black text-slate-500 bg-slate-900 hover:bg-rose-500 hover:text-white transition-all overflow-hidden border border-transparent hover:border-rose-600 shadow-sm mt-1">
              <LogOut className="min-w-[24px] h-5" /> 
              <span className="ml-3 transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">Log Out</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
          <TopMetricsBar user={user} />
          <div className="flex-1 overflow-hidden relative">
            {renderContent()}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 flex justify-around p-1 z-50 pb-safe">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex flex-col items-center p-2 rounded-xl min-w-[4rem] transition-colors ${currentView === item.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
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
  const [user, setUser] = useState(null);

  if (!user) {
    return <OnboardingView onLogin={(mockUser) => setUser(mockUser)} />;
  }

  return <MainLayout user={user} handleLogout={() => setUser(null)} updateUser={setUser} />;
}