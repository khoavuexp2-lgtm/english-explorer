import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, Shield,
  Zap, Users, Globe, Compass, Rocket, TreePine, Anchor,
  Mail, Key, LogIn, UserPlus, LogOut, LayoutDashboard,
  Swords, Dumbbell, GraduationCap, BarChart3, Settings,
  Mic, PlayCircle, Trophy, BookOpen, Volume2, Info, Check, X, RefreshCw
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Dùng try-catch để app không sập nếu chạy preview không có env
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase config missing, running in degraded mode.");
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const callGemini = async (prompt, isJson = false) => {
  if (!GEMINI_API_KEY) return isJson ? null : "[Chế độ Offline] Vui lòng cấu hình API Key.";
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY.trim() },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message);
    const text = data.candidates[0].content.parts[0].text;
    if (isJson) {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : null;
    }
    return text;
  } catch (err) {
    console.error("Gemini Error:", err);
    return isJson ? null : "Lỗi kết nối AI.";
  }
};

const AudioService = {
  speak: (text, rate = 0.9) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      // Cố gắng tìm giọng US nữ hoặc nam chuẩn
      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-US');
      if (usVoice) utterance.voice = usVoice;
      window.speechSynthesis.speak(utterance);
    }
  },
  recognize: (onResult, onError) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError("Trình duyệt không hỗ trợ thu âm (Hãy dùng Chrome/Edge).");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => onResult(event.results[0][0].transcript);
    recognition.onerror = (event) => onError(event.error);
    recognition.start();
    return recognition;
  }
};

const UNITS = [
  { id: "u1", title: "Unit 1: What's your address?", topic: "Address, hometown, places" },
  { id: "u2", title: "Unit 2: I always get up early", topic: "Daily routines, time" },
  { id: "u3", title: "Unit 3: Where did you go?", topic: "Past holidays, transport" }
];

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl ${className}`}>
    {children}
  </div>
);

const Sidebar = ({ user, role, stars }) => {
  const location = useLocation();
  const navs = [
    { path: '/explore', icon: Compass, label: 'Thám Hiểm' },
    { path: '/arena', icon: Swords, label: 'Đấu Trường' },
    { path: '/practice', icon: Dumbbell, label: 'Luyện Tập' },
    { path: '/mocktest', icon: GraduationCap, label: 'Ôn Thi' },
    { path: '/progress', icon: BarChart3, label: 'Tiến Trình' },
  ];

  return (
    <div className="w-24 md:w-64 h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Globe className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <h1 className="font-black text-xl text-white hidden md:block tracking-wide">Explorer<span className="text-blue-500">Pro</span></h1>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navs.map(n => {
          const active = location.pathname.includes(n.path);
          return (
            <a key={n.path} href={n.path} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}>
              <n.icon className={`w-6 h-6 ${active ? 'animate-bounce-short' : ''}`} />
              <span className="font-bold hidden md:block">{n.label}</span>
            </a>
          );
        })}
        {role === 'admin' && (
          <a href="/admin" className="flex items-center gap-4 p-3 rounded-2xl text-rose-400 hover:bg-rose-950 mt-4 border border-rose-900/50">
            <Shield className="w-6 h-6" /><span className="font-bold hidden md:block">Vùng Admin</span>
          </a>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">{user?.email?.[0].toUpperCase()}</div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.email}</p>
            <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5"><Star className="w-3 h-3 fill-current"/> {stars} Sao</div>
          </div>
        </div>
        <button onClick={() => signOut(auth)} className="flex items-center justify-center gap-2 w-full p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors">
          <LogOut className="w-4 h-4"/> <span className="hidden md:block">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

const SpeakingChallenge = ({ targetSentence, onComplete }) => {
  const [status, setStatus] = useState('idle'); // idle, listening, loading, done
  const [feedback, setFeedback] = useState(null);
  const recognitionRef = useRef(null);

  const handleListen = () => {
    setStatus('listening');
    recognitionRef.current = AudioService.recognize(
      async (transcript) => {
        setStatus('loading');
        const prompt = `Bạn là giáo viên tiếng Anh. Học sinh được yêu cầu nói câu: "${targetSentence}". Họ đã nói: "${transcript}". 
        Hãy đánh giá độ chính xác. Trả về JSON: { "score": điểm_từ_0_đến_100, "feedback": "1 câu nhận xét tiếng Việt kèm emoji động viên và chỉ ra chỗ sai nếu có" }`;
        const result = await callGemini(prompt, true);
        setFeedback({ transcript, ...result });
        setStatus('done');
      },
      (err) => { alert(err); setStatus('idle'); }
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-slate-50 rounded-3xl border-2 border-slate-200">
      <div className="text-center">
        <p className="text-slate-500 font-bold mb-2">Hãy đọc to câu sau:</p>
        <h3 className="text-3xl font-black text-blue-900">{targetSentence}</h3>
      </div>
      
      <button 
        onClick={handleListen}
        disabled={status === 'listening' || status === 'loading'}
        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${
          status === 'listening' ? 'bg-rose-500 animate-pulse scale-110' : 
          status === 'loading' ? 'bg-amber-500' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
        } text-white`}
      >
        {status === 'loading' ? <RefreshCw className="w-10 h-10 animate-spin" /> : <Mic className="w-10 h-10" />}
      </button>

      {status === 'listening' && <p className="text-rose-600 font-bold animate-pulse">Đang thu âm...</p>}
      
      {status === 'done' && feedback && (
        <div className="w-full bg-white p-4 rounded-2xl border flex flex-col items-center gap-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Bạn nói:</span>
            <span className="font-semibold text-slate-800">"{feedback.transcript}"</span>
          </div>
          <div className="text-5xl font-black" style={{color: feedback.score > 80 ? '#22c55e' : feedback.score > 50 ? '#f59e0b' : '#ef4444'}}>
            {feedback.score}/100
          </div>
          <p className="text-center font-medium text-slate-600">{feedback.feedback}</p>
          <button onClick={() => onComplete(feedback.score)} className="mt-2 px-6 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600">Tuyệt vời, Đi tiếp!</button>
        </div>
      )}
    </div>
  );
};

const WordBlockChallenge = ({ sentence, onComplete }) => {
  const words = sentence.split(" ").map(w => w.replace(/[^a-zA-Z]/g, ""));
  const [shuffled, setShuffled] = useState([...words].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleSelect = (word, index) => {
    setSelected([...selected, {word, originalIndex: index}]);
    setShuffled(shuffled.filter((_, i) => i !== index));
  };

  const handleRemove = (item, index) => {
    const newSelected = [...selected];
    newSelected.splice(index, 1);
    setSelected(newSelected);
    setShuffled([...shuffled, item.word]);
  };

  const checkAnswer = () => {
    const current = selected.map(s => s.word).join(" ");
    const target = words.join(" ");
    if (current.toLowerCase() === target.toLowerCase()) {
      setIsCorrect(true);
      setTimeout(() => onComplete(100), 1500);
    } else {
      setIsCorrect(false);
      setTimeout(() => setIsCorrect(null), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <Volume2 className="w-8 h-8 text-blue-500 mx-auto mb-2 cursor-pointer hover:scale-110" onClick={() => AudioService.speak(sentence)} />
        <p className="text-slate-500 font-bold">Nghe và sắp xếp lại thành câu hoàn chỉnh</p>
      </div>

      {/* Vùng chọn */}
      <div className={`w-full min-h-[80px] p-4 bg-slate-100 rounded-2xl border-4 flex flex-wrap gap-2 ${isCorrect === true ? 'border-green-400 bg-green-50' : isCorrect === false ? 'border-rose-400 bg-rose-50' : 'border-slate-300'}`}>
        {selected.map((item, idx) => (
          <button key={idx} onClick={() => handleRemove(item, idx)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 animate-fade-in">
            {item.word}
          </button>
        ))}
      </div>

      {/* Vùng từ lộn xộn */}
      <div className="flex flex-wrap justify-center gap-3">
        {shuffled.map((word, idx) => (
          <button key={idx} onClick={() => handleSelect(word, idx)} className="px-4 py-2 bg-white text-slate-800 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 hover:scale-105 transition-all">
            {word}
          </button>
        ))}
      </div>

      <button onClick={checkAnswer} disabled={selected.length !== words.length} className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
        Kiểm tra
      </button>
    </div>
  );
};

const ExplorePage = ({ updateStars }) => {
  const [mapTheme, setMapTheme] = useState('space');
  const [stationModal, setStationModal] = useState(null); // null, vocab, listen, write, speak

  const mapConfig = {
    space: { bg: "from-[#161638] to-[#2a2a5a]", ship: "🚀", nodes: [{x:20,y:80, type:'vocab', v:"🪐"},{x:50,y:65, type:'listen', v:"☄️"},{x:80,y:45, type:'write', v:"🛰️"},{x:40,y:15, type:'speak', v:"👽"}] }
  };
  const config = mapConfig[mapTheme];
  const progress = 3; // Giả lập tiến độ

  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-3xl font-black text-slate-800 mb-6">Unit 1: Hành trình Không gian</h2>
      <div className={`relative flex-1 w-full max-w-4xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-800 bg-gradient-to-t ${config.bg}`}>
        
        {/* Nét đứt */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {config.nodes.map((node, i) => {
            if (i === config.nodes.length - 1) return null;
            const next = config.nodes[i + 1];
            return <line key={i} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke="#4ade80" strokeWidth="6" strokeDasharray="0 25" strokeLinecap="round" />
          })}
        </svg>

        {config.nodes.map((node, i) => (
          <div key={i} onClick={() => setStationModal(node.type)} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform z-20" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <div className="text-7xl drop-shadow-2xl animate-bounce-short">{node.v}</div>
            <div className="mt-2 px-4 py-1.5 bg-slate-900/80 text-white font-bold text-xs rounded-full border border-white/20 uppercase tracking-widest">{node.type}</div>
          </div>
        ))}
      </div>

      {/* Modal Trạm Học Tập */}
      {stationModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-lg p-6 relative">
            <button onClick={() => setStationModal(null)} className="absolute top-4 right-4 text-slate-500 hover:bg-slate-100 p-2 rounded-full"><X/></button>
            <h3 className="text-2xl font-black text-center mb-6 capitalize text-slate-800">Trạm {stationModal}</h3>
            
            {stationModal === 'speak' && <SpeakingChallenge targetSentence="I live in a big city" onComplete={(score) => { updateStars(score); setStationModal(null); }}/>}
            {stationModal === 'write' && <WordBlockChallenge sentence="I always get up early" onComplete={(score) => { updateStars(score); setStationModal(null); }}/>}
            {(stationModal === 'vocab' || stationModal === 'listen') && (
              <div className="text-center p-8">
                <Dumbbell className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse"/>
                <p className="font-medium text-slate-600 mb-6">Tính năng trắc nghiệm bằng AI đang được kết nối...</p>
                <button onClick={() => { updateStars(20); setStationModal(null); }} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">Hoàn thành giả lập (+20 Sao)</button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};

const ArenaPage = () => {
  const [pin, setPin] = useState("");
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <GlassCard className="w-full max-w-md p-8 text-center border-4 border-indigo-200">
        <Swords className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">Đấu Trường Sinh Tử</h2>
        <p className="text-slate-500 font-medium mb-8">Nơi học sinh tự tạo phòng và thách đấu AI hoặc bạn bè.</p>
        
        <input type="text" placeholder="NHẬP MÃ PIN (VD: 123456)" value={pin} onChange={e=>setPin(e.target.value)} className="w-full text-center text-3xl font-black py-4 bg-slate-100 rounded-2xl border-4 border-slate-200 focus:outline-none focus:border-indigo-500 mb-4 tracking-[0.5em]" />
        
        <div className="flex gap-4">
          <button className="flex-1 py-4 bg-indigo-600 text-white font-black text-xl rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/30">VÀO PHÒNG</button>
          <button className="flex-1 py-4 bg-white text-indigo-600 border-2 border-indigo-200 font-black text-xl rounded-2xl hover:bg-indigo-50">TẠO MỚI</button>
        </div>
      </GlassCard>
    </div>
  );
};

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!auth) return setError("Hệ thống Offline: Không có kết nối Firebase.");
    setError(''); setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), { email, role: "student", stars: 0, progress: 0, createdAt: new Date() });
      }
    } catch (err) {
      setError("Email hoặc Mật khẩu không chính xác.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 shadow-2xl shadow-blue-600/50 flex items-center justify-center transform rotate-12">
          <Rocket className="w-12 h-12 text-white -rotate-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Explorer</span></h1>
        <p className="text-slate-400 font-medium text-lg">Nền tảng học Tiếng Anh thông minh với AI</p>
      </div>

      <GlassCard className="w-full max-w-md p-8 border-slate-700 bg-slate-900/80">
        {error && <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-sm font-bold mb-6 text-center">{error}</div>}
        
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-blue-500" placeholder="Email thám hiểm..." />
            </div>
          </div>
          <div>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input type="password" required minLength="6" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-blue-500" placeholder="Mật khẩu bí mật..." />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-blue-900/50 mt-4 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin"/> : (isLogin ? "Bắt Đầu Hành Trình" : "Tạo Hồ Sơ Mới")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 hover:text-white font-medium text-sm underline decoration-slate-600 underline-offset-4">
            {isLogin ? 'Nhà thám hiểm mới? Đăng ký ngay' : 'Đã có hồ sơ? Đăng nhập'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ role: 'student', stars: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return setLoading(false);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const uDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (uDoc.exists()) setUserData(uDoc.data());
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStars = async (amount) => {
    setUserData(p => ({ ...p, stars: p.stars + amount }));
    if (user && db) await updateDoc(doc(db, 'users', user.uid), { stars: increment(amount) });
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center"><RefreshCw className="w-12 h-12 text-blue-500 animate-spin" /></div>;

  return (
    <BrowserRouter>
      {/* Khai báo style CSS cho các Animation tùy chỉnh */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15%); } }
        .animate-bounce-short { animation: bounce-short 1s ease-in-out infinite; }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />

      <Routes>
        <Route path="/" element={user ? <Navigate to="/explore" replace /> : <LoginPage />} />
        
        {/* Layout Chính sau khi đăng nhập */}
        <Route path="/*" element={
          user ? (
            <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
              <Sidebar user={user} role={userData.role} stars={userData.stars} />
              <main className="flex-1 h-full overflow-y-auto">
                <Routes>
                  <Route path="/explore" element={<ExplorePage updateStars={updateStars} />} />
                  <Route path="/arena" element={<ArenaPage />} />
                  <Route path="/practice" element={<div className="p-8 text-center mt-20"><Dumbbell className="w-20 h-20 mx-auto text-slate-300"/><h2 className="text-3xl font-black text-slate-400 mt-4">Khu Luyện Tập Đang Xây Dựng...</h2></div>} />
                  <Route path="/mocktest" element={<div className="p-8 text-center mt-20"><GraduationCap className="w-20 h-20 mx-auto text-slate-300"/><h2 className="text-3xl font-black text-slate-400 mt-4">Trung Tâm Ôn Thi Đang Xây Dựng...</h2></div>} />
                  <Route path="/progress" element={<div className="p-8 text-center mt-20"><BarChart3 className="w-20 h-20 mx-auto text-slate-300"/><h2 className="text-3xl font-black text-slate-400 mt-4">Báo Cáo Tiến Trình Đang Xây Dựng...</h2></div>} />
                  <Route path="/admin" element={userData.role === 'admin' ? <div className="p-8 text-center mt-20 text-rose-500 font-black text-4xl">KHU VỰC QUẢN TRỊ ADMIN</div> : <Navigate to="/explore" />} />
                  <Route path="*" element={<Navigate to="/explore" replace />} />
                </Routes>
              </main>
            </div>
          ) : <Navigate to="/" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}