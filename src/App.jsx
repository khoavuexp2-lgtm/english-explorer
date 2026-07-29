import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, 
  Volume2, Trophy, Zap, PlayCircle, Users, X, User, Shield, 
  ArrowRight, Globe, MessageCircle, Mic, Compass, Rocket, TreePine, Anchor
} from 'lucide-react';

// --- NGÔN NGỮ (i18n) ---
const T = {
  vi: {
    appTitle: "Vũ Trụ Kiến Thức",
    loginTitle: "Chào mừng nhà thám hiểm!",
    loginDesc: "Hãy chọn vai trò để bắt đầu (Sau này kết nối Firebase).",
    roleStudent: "Học sinh", roleParent: "Phụ huynh",
    start: "Bắt đầu", selectGrade: "Chọn Khối Lớp",
    lockedGrade: "Sắp ra mắt", adminMode: "Nhập mật khẩu Admin để mở khóa:",
    semester1: "Học Kỳ 1", touchToUnlock: "Vượt ải AI để mở",
    selectMap: "Chọn Vùng Đất",
    vocab: "Từ Vựng", game: "Thử Thách", grammar: "Ngữ Pháp", sentence: "Ghép Câu", speak: "Boss Cuối",
    listen: "Nghe", next: "Tiếp", finish: "Hoàn thành",
    arena: "Đấu Nhóm", typeMessage: "Hỏi AI bất cứ điều gì...",
    joinRoom: "VÀO PHÒNG", arenaDesc: "Nhập mã phòng từ Thầy/Cô",
    errMic: "Trình duyệt không hỗ trợ Mic. Hãy dùng Chrome/Edge."
  },
  en: {
    appTitle: "Knowledge Universe",
    loginTitle: "Welcome Explorer!",
    loginDesc: "Select your role to begin (Firebase integration later).",
    roleStudent: "Student", roleParent: "Parent",
    start: "Start", selectGrade: "Select Grade",
    lockedGrade: "Coming Soon", adminMode: "Enter Admin password:",
    semester1: "Semester 1", touchToUnlock: "Pass AI Test to unlock",
    selectMap: "Choose Land",
    vocab: "Vocabulary", game: "Challenge", grammar: "Grammar", sentence: "Sentence", speak: "Final Boss",
    listen: "Listen", next: "Next", finish: "Finish",
    arena: "Arena", typeMessage: "Ask AI anything...",
    joinRoom: "JOIN ROOM", arenaDesc: "Enter room PIN",
    errMic: "Browser mic not supported. Use Chrome/Edge."
  }
};

// --- DATA CỐT LÕI (Database giả lập - Sau này đưa lên Firestore) ---
const GRADES_DATA = [
  { id: 1, title: "Lớp 1", locked: true },
  { id: 2, title: "Lớp 2", locked: true },
  { id: 3, title: "Lớp 3", locked: true },
  { id: 4, title: "Lớp 4", locked: true },
  { id: 5, title: "Lớp 5", locked: false }
];

const UNITS_DATA = [
  { id: "u1", title: "Unit 1: What's your address?", locked: false },
  { id: "u2", title: "Unit 2: I always get up early", locked: true },
  { id: "u3", title: "Unit 3: Where did you go?", locked: true }
];

// --- CẤU HÌNH API GEMINI TỪ BIẾN MÔI TRƯỜNG ---
// Trong Vite, lấy biến môi trường qua import.meta.env
// Để tránh lỗi sập web khi chạy trên trình duyệt thường, dùng try-catch
let apiKey = "";
try {
  apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
} catch (e) {
  apiKey = ""; // Mặc định rỗng nếu không chạy trên Vite
}

const callAITutor = async (message, persona) => {
  if (!apiKey) {
    return `[Chế độ Local] Chào bạn, mình là ${persona}. Hãy cấu hình VITE_GEMINI_API_KEY trong file .env để kết nối bộ não AI nhé! 🤖`;
  }

  const prompt = `Bạn là ${persona}, một gia sư AI dạy tiếng Anh. 
  Quy tắc:
  1. Trả lời ngắn gọn, dùng emoji.
  2. NHẬN DIỆN NGÔN NGỮ: Nếu học sinh hỏi bằng tiếng Việt, trả lời bằng tiếng Việt. Nếu hỏi bằng tiếng Anh, trả lời bằng tiếng Anh.
  Câu hỏi: "${message}"`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! Kết nối mạng có vấn đề rồi. Thử lại sau nhé! 🛸";
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

// --- COMPONENT: AI TUTOR NỔI ---
const AITutor = ({ theme, onClose, t }) => {
  const [messages, setMessages] = useState([{ sender: 'ai', text: "Hi! Need help? Cần tớ giúp gì không? Mình hiểu cả Tiếng Anh và Tiếng Việt nhé! 🤖" }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const tutorConfig = {
    ocean: { name: "Captain Octopus", visual: "🐙", color: "text-cyan-600", bg: "bg-cyan-100" },
    desert: { name: "Sage Camel", visual: "🐪", color: "text-amber-600", bg: "bg-amber-100" },
    forest: { name: "Wise Owl", visual: "🦉", color: "text-green-600", bg: "bg-green-100" },
    space: { name: "Tutor Gemmy", visual: "👽", color: "text-indigo-600", bg: "bg-indigo-100" }
  };
  const tutor = tutorConfig[theme] || tutorConfig.ocean;

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput(''); setIsTyping(true);
    
    const aiResponse = await callAITutor(userMsg, tutor.name);
    setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    setIsTyping(false);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="fixed bottom-24 right-8 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border-4 border-slate-200 z-[100] flex flex-col overflow-hidden animate-fade-in">
      <div className={`${tutor.bg} p-4 flex justify-between items-center border-b-4 border-slate-200`}>
        <div className="flex items-center gap-3">
          <div className="text-4xl animate-bounce">{tutor.visual}</div>
          <div><h3 className={`font-black text-lg ${tutor.color}`}>{tutor.name}</h3><p className="text-xs font-bold opacity-70">Bilingual AI Tutor</p></div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><X /></button>
      </div>
      <div className="h-72 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-3 rounded-2xl max-w-[85%] font-medium text-sm shadow-sm ${msg.sender === 'ai' ? 'bg-white border-2 border-slate-200 self-start' : 'bg-blue-500 text-white self-end'}`}>{msg.text}</div>
        ))}
        {isTyping && <div className="bg-white border-2 p-3 rounded-2xl self-start">...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 bg-white border-t-2 flex gap-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder={t.typeMessage} className="flex-1 bg-slate-100 rounded-xl px-4 py-2 outline-none" />
        <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl"><ArrowRight /></button>
      </div>
    </div>
  );
};

// --- COMPONENT: BẢN ĐỒ RPG ---
const VisualMap = ({ progress, onEnterStation, theme, t }) => {
  const mapConfig = {
    ocean: { bg: "from-[#112240] to-[#233554]", ship: "🚢", nodes: [{x:20,y:80, v:"🏝️"},{x:50,y:65, v:"🪸"},{x:80,y:45, v:"⛵"},{x:40,y:15, v:"🐙"}] },
    desert: { bg: "from-[#8c5900] to-[#cfa144]", ship: "🐪", nodes: [{x:20,y:80, v:"🏜️"},{x:50,y:65, v:"⛺"},{x:80,y:45, v:"🌵"},{x:40,y:15, v:"🦂"}] },
    forest: { bg: "from-[#1a4a1a] to-[#2d6a2d]", ship: "🚙", nodes: [{x:20,y:80, v:"🌲"},{x:50,y:65, v:"🛖"},{x:80,y:45, v:"🍄"},{x:40,y:15, v:"🐻"}] },
    space: { bg: "from-[#161638] to-[#2a2a5a]", ship: "🚀", nodes: [{x:20,y:80, v:"🪐"},{x:50,y:65, v:"☄️"},{x:80,y:45, v:"🛰️"},{x:40,y:15, v:"👽"}] }
  };
  const config = mapConfig[theme] || mapConfig.ocean;
  
  // Trí nhớ vị trí phương tiện
  const initialValidNode = Math.min(progress, config.nodes.length - 1);
  const shipPosRef = useRef({ x: config.nodes[initialValidNode].x, y: config.nodes[initialValidNode].y });
  const [animatingTo, setAnimatingTo] = useState(null);

  const labels = [t.vocab, t.game, t.grammar, t.speak];

  const handleNodeClick = (index, node) => {
    if (index === 0 || progress >= index) {
      if (animatingTo !== null) return;
      if (shipPosRef.current.x === node.x && shipPosRef.current.y === node.y) {
        onEnterStation(index, node);
        return;
      }
      setAnimatingTo(index);
      shipPosRef.current = { x: node.x, y: node.y };
      setTimeout(() => { setAnimatingTo(null); onEnterStation(index, node); }, 1200);
    }
  };

  return (
    <div className={`relative w-full max-w-4xl h-[600px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-700 bg-gradient-to-t ${config.bg}`}>
      {/* Vẽ đường nét đứt (Dots) nối các trạm */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {config.nodes.map((node, i) => {
          if (i === config.nodes.length - 1) return null;
          const next = config.nodes[i + 1];
          const isNextTarget = progress === i;
          const isPassed = progress > i;
          return <line key={i} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke={isPassed ? "#4ade80" : isNextTarget ? "#fcd34d" : "rgba(255,255,255,0.2)"} strokeWidth="6" strokeDasharray="0 25" strokeLinecap="round" className={isNextTarget ? "animate-pulse" : ""} />
        })}
      </svg>

      {/* Phương tiện */}
      <div className="absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-[1200ms] flex items-center justify-center pointer-events-none" style={{ left: `${shipPosRef.current.x}%`, top: `${shipPosRef.current.y}%` }}>
        <div className="text-5xl drop-shadow-2xl animate-bounce-short">{config.ship}</div>
      </div>

      {/* Điểm trạm */}
      {config.nodes.map((node, index) => {
        const isUnlocked = index === 0 || progress >= index;
        return (
          <div key={index} onClick={() => handleNodeClick(index, node)} className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-20 ${isUnlocked ? 'cursor-pointer hover:scale-110' : 'opacity-40 grayscale cursor-not-allowed'} transition-all`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <div className="text-6xl drop-shadow-2xl relative">
              {node.v}
              {progress > index && <CheckCircle2 className="absolute -top-2 -right-2 text-white bg-green-500 rounded-full p-1 w-8 h-8 border-2 border-white" />}
              {!isUnlocked && <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-80 text-slate-900" />}
            </div>
            <div className={`mt-1 px-3 py-1 rounded-full text-white font-bold text-xs shadow-lg border ${isUnlocked ? 'bg-slate-900/80 border-white/30' : 'bg-slate-800/50 border-transparent'}`}>{labels[index]}</div>
          </div>
        );
      })}
    </div>
  );
};

// --- APP CHÍNH TRẠNG THÁI ---
export default function App() {
  const [lang, setLang] = useState('vi');
  const t = T[lang];
  const [appState, setAppState] = useState('ONBOARDING'); // ONBOARDING, GRADES, UNITS, MAP_SELECT, PLAYING, ARENA
  const [courses, setCourses] = useState(UNITS_DATA);
  const [mapTheme, setMapTheme] = useState('ocean');
  const [progress, setProgress] = useState(0);
  const [inventory, setInventory] = useState({ stars: 0, lifelines: 2 });
  const [showTutor, setShowTutor] = useState(false);

  // Mở khóa bằng Password (Dành cho Giáo viên)
  const handleAdminUnlock = () => {
    const pwd = prompt(t.adminMode);
    if (pwd === 'admin123') {
      setCourses(courses.map(c => ({...c, locked: false})));
      alert("Đã mở khóa toàn bộ bài học!");
    }
  };

  // Vượt ải bằng AI (Học vượt)
  const handleAIPass = (unitId) => {
    if (window.confirm("AI sẽ tạo một bài Test. Nếu vượt qua, bạn sẽ mở khóa bài này. Đồng ý?")) {
      setTimeout(() => {
        alert("Bạn đã làm bài Test AI giả lập và đạt 100 điểm. Unit đã được mở khóa!");
        setCourses(courses.map(c => c.id === unitId ? {...c, locked: false} : c));
      }, 1000);
    }
  };

  const handleWinStation = () => {
    setInventory(prev => ({...prev, stars: prev.stars + 20}));
    if (progress < 3) setProgress(p => p + 1);
    setAppState('PLAYING');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* HEADER TOÀN CỤC */}
      {appState !== 'ONBOARDING' && (
        <header className="bg-white p-4 shadow-sm flex justify-between items-center z-50 sticky top-0 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {appState !== 'GRADES' && (
              <button onClick={() => {
                if(appState === 'PLAYING' || appState === 'ARENA') setAppState('MAP_SELECT');
                else if(appState === 'MAP_SELECT') setAppState('UNITS');
                else if(appState === 'UNITS') setAppState('GRADES');
              }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ChevronLeft /></button>
            )}
            <h1 className="text-xl font-black text-blue-900 hidden sm:flex items-center gap-2"><Compass className="w-5 h-5"/> Global Explorer</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Đổi ngôn ngữ */}
            <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="bg-slate-100 p-2 rounded-full font-bold text-slate-700 flex items-center gap-1 border hover:bg-slate-200">
              <Globe className="w-5 h-5"/> {lang.toUpperCase()}
            </button>
            
            <button onClick={() => setAppState('ARENA')} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-full font-bold hidden sm:flex items-center gap-1">
              <Users className="w-4 h-4"/> {t.arena}
            </button>
            
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full"><Zap className="w-4 h-4 text-blue-500 fill-current" /> <span className="font-bold text-slate-700">{inventory.lifelines}</span></div>
            <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full"><Star className="w-4 h-4 text-yellow-500 fill-current" /> <span className="font-bold text-yellow-700">{inventory.stars}</span></div>
          </div>
        </header>
      )}

      {/* KHU VỰC CHÍNH */}
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        {appState === 'ONBOARDING' && (
          <div className="text-center animate-fade-in max-w-md">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-indigo-600 rounded-full mx-auto mb-8 shadow-2xl flex items-center justify-center"><Globe className="w-12 h-12 text-white animate-spin-slow" /></div>
            <h1 className="text-4xl font-black mb-2">{t.loginTitle}</h1>
            <p className="text-slate-500 mb-8">{t.loginDesc}</p>
            <button onClick={() => setAppState('GRADES')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-700">{t.start}</button>
          </div>
        )}
        
        {appState === 'GRADES' && (
          <div className="text-center w-full max-w-4xl"><h2 className="text-4xl font-black mb-8">{t.selectGrade}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {GRADES_DATA.map(g => (
                <button key={g.id} onClick={() => !g.locked && setAppState('UNITS')} className={`p-6 rounded-3xl border-4 font-black text-xl ${g.locked ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-white border-blue-400 text-blue-600 hover:scale-105 shadow-xl'}`}>
                  {g.title} {g.locked && <span className="block text-xs mt-2 font-normal text-slate-500">{t.lockedGrade}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {appState === 'UNITS' && (
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">{t.semester1}</h2>
              <button onClick={handleAdminUnlock} className="text-slate-400 hover:text-red-500" title="Admin Mode"><Shield /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(u => (
                <div key={u.id} onClick={() => { if(!u.locked) setAppState('MAP_SELECT'); else handleAIPass(u.id); }} className={`p-8 rounded-3xl border-4 cursor-pointer relative overflow-hidden ${u.locked ? 'bg-slate-200 border-slate-300' : 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-700 text-white hover:scale-105 shadow-xl'}`}>
                  <h3 className={`text-2xl font-black ${u.locked ? 'text-slate-500' : ''}`}>{u.title}</h3>
                  {u.locked && <button className="mt-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2"><Zap className="w-4 h-4"/> {t.touchToUnlock}</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {appState === 'MAP_SELECT' && (
          <div className="text-center w-full max-w-4xl"><h2 className="text-4xl font-black mb-8">{t.selectMap}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {id: 'ocean', name: 'Đại Dương', icon: Anchor, bg: 'bg-cyan-900'},
                {id: 'desert', name: 'Sa Mạc', icon: MapPin, bg: 'bg-amber-900'},
                {id: 'forest', name: 'Rừng Rậm', icon: TreePine, bg: 'bg-green-900'},
                {id: 'space', name: 'Vũ Trụ', icon: Rocket, bg: 'bg-indigo-900'}
              ].map(m => (
                <button key={m.id} onClick={() => { setMapTheme(m.id); setAppState('PLAYING'); }} className={`${m.bg} text-white p-8 rounded-3xl font-black text-xl hover:scale-105 transition-transform flex flex-col items-center gap-4 shadow-xl`}>
                  <m.icon className="w-12 h-12" /> {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {appState === 'PLAYING' && (
          <div className="w-full relative">
            <VisualMap progress={progress} onEnterStation={() => {
              alert("Giả lập vào bài học thành công! Bấm OK để tự động chiến thắng và nhận Sao."); 
              handleWinStation();
            }} theme={mapTheme} t={t} />
            
            {/* FAB AI Tutor */}
            <button onClick={() => setShowTutor(!showTutor)} className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 z-[90] border-4 border-white animate-bounce">
              <MessageCircle className="w-8 h-8 text-white" />
            </button>
            {showTutor && <AITutor theme={mapTheme} onClose={() => setShowTutor(false)} t={t} />}
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-short { animation: bounce-short 1.5s ease-in-out infinite; }
      `}} />
    </div>
  );
}