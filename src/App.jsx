import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, 
  Volume2, Trophy, Zap, Users, X, Shield, 
  ArrowRight, Globe, MessageCircle, Compass, Rocket, TreePine, Anchor,
  LogOut, Play, Headphones, Flame, MessageSquare, Library,
  Mail, Phone, Target, BookOpen, PenTool, Swords, Mic, ShieldAlert
} from 'lucide-react';

// ---------------- FIREBASE CONFIG KHÁCH HÀNG ----------------
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Bỏ comment các biến môi trường của bạn trên Vercel
const firebaseConfig = {
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
   appId: import.meta.env.VITE_FIREBASE_APP_ID,
  
  // Dữ liệu giả lập để tránh lỗi sập khi chạy thử nghiệm
  //apiKey: "DEMO_KEY", authDomain: "demo.firebaseapp.com", projectId: "demo-project", storageBucket: "demo.appspot.com", messagingSenderId: "123", appId: "1:123:web:456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Template chuẩn cho Admin dán vào hệ thống
const JSON_TEMPLATE = `{
  "station1": { 
    "type": "vocab", 
    "question": "What is the English word for 'Thành phố'?", 
    "answer": "city", 
    "options": ["village", "city", "town", "island"],
    "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80"
  },
  "station2": { 
    "type": "grammar", 
    "question": "Choose the correct preposition: I live ___ the second floor of City Tower.", 
    "answer": "on", 
    "options": ["in", "on", "at", "by"] 
  },
  "station3": { 
    "type": "listen", 
    "question": "Nghe và chọn từ:", 
    "answer": "village", 
    "options": ["city", "village", "mountain", "tower"],
    "audioText": "I live in a small village in the mountains."
  },
  "station4": { 
    "type": "speak", 
    "question": "Đọc to câu sau:", 
    "answer": "What is your address",
    "expectedText": "what is your address" 
  }
}`;

const FALLBACK_DATA = JSON.parse(JSON_TEMPLATE);

// --- BẢN ĐỒ DỌC VỚI HIỆU ỨNG XE DI CHUYỂN (VISUAL MAP) ---
const VisualMap = ({ progress, onEnterStation, theme }) => {
  const mapConfig = {
    ocean: { bg: "from-cyan-400 to-blue-700", vehicle: "🚢", nodes: [{x:30,y:80, i:"🏝️", n:"Word Island"}, {x:70,y:60, i:"🏰", n:"Grammar Castle"}, {x:30,y:40, i:"🐚", n:"Listen Shell"}, {x:50,y:15, i:"🐙", n:"Boss Kraken"}] },
    forest: { bg: "from-green-400 to-emerald-800", vehicle: "🚙", nodes: [{x:30,y:80, i:"🏕️", n:"Camp"}, {x:70,y:60, i:"🌲", n:"Deep Woods"}, {x:30,y:40, i:"🦉", n:"Owl Nest"}, {x:50,y:15, i:"🐻", n:"Bear Cave"}] }
  };
  const config = mapConfig[theme] || mapConfig.ocean;
  
  const initialValidNode = Math.min(progress, config.nodes.length - 1);
  const vPos = useRef({ x: config.nodes[initialValidNode].x, y: config.nodes[initialValidNode].y });
  const [animatingTo, setAnimatingTo] = useState(null);

  const handleClick = (index, node) => {
    if (progress >= index) {
      if (vPos.current.x === node.x && vPos.current.y === node.y) { onEnterStation(index, node); return; }
      setAnimatingTo(index);
      vPos.current = { x: node.x, y: node.y };
      setTimeout(() => { setAnimatingTo(null); onEnterStation(index, node); }, 1200);
    } else {
      alert("Trạm này đang bị khóa! Vui lòng hoàn thành trạm trước đó.");
    }
  };

  return (
    <div className={`relative w-full max-w-lg h-[600px] mx-auto rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-gradient-to-t ${config.bg} border-8 border-white/20 backdrop-blur-xl`}>
      {/* Đường nét đứt (Dashed line) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {config.nodes.map((node, i) => {
          if (i === config.nodes.length - 1) return null;
          const next = config.nodes[i + 1];
          return <line key={i} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke="rgba(255,255,255,0.4)" strokeWidth="6" strokeDasharray="10 15" strokeLinecap="round" />
        })}
      </svg>

      {/* Phương tiện (Vehicle) */}
      <div className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-[1200ms] flex items-center justify-center pointer-events-none" style={{ left: `${vPos.current.x}%`, top: `${vPos.current.y}%` }}>
        <div className="text-5xl drop-shadow-2xl animate-bounce">{config.vehicle}</div>
      </div>

      {/* Các Trạm (Nodes) */}
      {config.nodes.map((node, i) => {
        const isUnlocked = progress >= i;
        return (
          <div key={i} onClick={() => handleClick(i, node)} className={`absolute flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2 z-20 ${isUnlocked ? 'cursor-pointer hover:scale-110' : 'opacity-50 grayscale'} transition-transform`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <div className="relative text-5xl bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/50 shadow-xl">
               {node.i}
               {!isUnlocked && <Lock className="absolute inset-0 m-auto w-8 h-8 text-slate-800" />}
               {progress > i && <CheckCircle2 className="absolute -top-2 -right-2 w-8 h-8 text-white bg-green-500 rounded-full border-2 border-white" />}
            </div>
            <div className="bg-slate-900/80 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg whitespace-nowrap border border-white/20">{node.n}</div>
          </div>
        )
      })}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ role: 'student', stars: 0, lives: 3, status: 'active', name: '' });
  const [appState, setAppState] = useState('SPLASH'); // SPLASH, GRADES, UNITS, MAP, PRACTICE, ARENA, ADMIN
  const [mapTheme, setMapTheme] = useState('ocean');
  const [progress, setProgress] = useState(0);
  const [gameStation, setGameStation] = useState(null); // Data trạm hiện tại đang chơi
  const [showRotateWarning, setShowRotateWarning] = useState(true);

  // States cho Admin
  const [adminGrade, setAdminGrade] = useState('5');
  const [adminUnit, setAdminUnit] = useState('1');
  const [adminDataInput, setAdminDataInput] = useState(JSON_TEMPLATE);

  // Đăng nhập / Kiểm tra Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        let dbData = { role: 'student', stars: 0, lives: 3, status: 'active', name: currentUser.displayName };
        
        // Cấp quyền cứng SuperAdmin
        if (currentUser.email === 'khoavuexp2@gmail.com' || currentUser.email === 'khoavuexp@gmail.com') {
          dbData.role = 'superadmin';
        }

        if (db.app.options.projectId !== "demo-project") {
           try {
              const userRef = doc(db, "users", currentUser.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const data = userSnap.data();
                if (data.status === 'blocked') {
                  alert("Tài khoản đã bị khóa!");
                  signOut(auth); setUser(null); return;
                }
                dbData = { ...dbData, ...data };
              } else {
                await setDoc(userRef, dbData);
              }
           } catch(e) {}
        }
        setUserData(dbData);
        setAppState('GRADES');
      } else {
        setUser(null);
        setAppState('SPLASH');
      }
    });
    return () => unsubscribe();
  }, []);

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGameWin = () => {
    playAudio("Excellent!");
    alert("🎉 Chúc mừng! Bạn vượt qua trạm này (+15 Sao)");
    setUserData(prev => ({ ...prev, stars: prev.stars + 15 }));
    setProgress(p => p + 1);
    setGameStation(null);
  };

  const handleGameLose = () => {
    playAudio("Oops, try again!");
    if (userData.lives > 1) {
      setUserData(prev => ({ ...prev, lives: prev.lives - 1 }));
      alert("❌ Sai rồi! Bị trừ 1 ❤️");
    } else {
      setUserData(prev => ({ ...prev, lives: 0 }));
      alert("💀 BẠN ĐÃ HẾT TIM! Hãy chờ để hồi phục.");
      setGameStation(null);
    }
  };

  // Hàm tải dữ liệu từ Firebase hoặc dùng Data nội bộ nếu không có
  const enterStation = async (index, node) => {
    if (userData.lives <= 0) { alert("Hết tim rồi! Vui lòng nạp thêm để chơi."); return; }
    
    let stationData = FALLBACK_DATA[`station${index + 1}`];
    
    if (db.app.options.projectId !== "demo-project") {
      try {
        const docRef = doc(db, "units", "grade5_unit1"); // Demo cứng
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data()[`station${index + 1}`]) {
           stationData = docSnap.data()[`station${index + 1}`];
        }
      } catch(e) {}
    }
    
    if (!stationData) {
      alert("🚧 Trạm này đang được Admin soạn dữ liệu. Quay lại sau nhé!");
      return;
    }
    setGameStation({ ...stationData, index, nodeName: node.n });
  };

  // Đẩy dữ liệu CMS
  const handlePushData = async () => {
    if (db.app.options.projectId === "demo-project") {
      alert("Vui lòng nhập Firebase Config thật của bạn vào code để push dữ liệu!");
      return;
    }
    
    try {
      // Bẫy lỗi JSON
      const parsedData = JSON.parse(adminDataInput);
      const docId = `grade${adminGrade}_unit${adminUnit}`;
      await setDoc(doc(db, "units", docId), parsedData);
      alert(`✅ Đã nạp thành công dữ liệu vào Cloud: ${docId}`);
    } catch (e) {
      alert(`❌ LỖI ĐỊNH DẠNG JSON:\n${e.message}\n\nVui lòng kiểm tra lại dấu ngoặc kép, dấu phẩy.`);
    }
  };

  if (appState === 'SPLASH') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse"></div>
           <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse" style={{animationDelay: "2s"}}></div>
        </div>
        <div className="z-10 text-center bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] border border-white/20 shadow-2xl max-w-lg w-full m-4">
          <div className="w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-3xl mx-auto mb-8 shadow-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500 border border-white/30">
            <Globe className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Global Explorer</h1>
          <p className="text-blue-200 text-lg mb-10 font-medium">Hệ sinh thái học Tiếng Anh chuẩn Quốc tế</p>
          <button onClick={() => signInWithPopup(auth, provider)} className="w-full py-4 bg-white/90 backdrop-blur-sm text-blue-900 rounded-2xl font-black text-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3">
            Bắt đầu thám hiểm <ArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex overflow-hidden font-sans relative selection:bg-blue-300">
      
      {/* Cảnh báo Màn hình dọc */}
      {showRotateWarning && (
        <div className="fixed top-0 left-0 w-full bg-amber-500 text-amber-50 text-sm font-bold p-2 text-center z-[100] flex justify-center items-center gap-4 shadow-md sm:hidden">
           <span>📱 Rotate device for best experience</span>
           <button onClick={() => setShowRotateWarning(false)} className="bg-amber-700/50 px-2 py-1 rounded hover:bg-amber-700">Dismiss</button>
        </div>
      )}

      {/* SIDEBAR TỰ ẨN (GLASSMORPHISM) */}
      <aside className="group w-20 hover:w-72 h-full bg-white/70 backdrop-blur-2xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.05)] fixed md:relative z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <div className="p-4 flex items-center gap-4 border-b border-slate-200/50">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200/50 border border-white/20"><Compass className="text-white w-7 h-7" /></div>
          <span className="font-black text-2xl text-slate-800 tracking-tight opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Explorer</span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-hidden">
          {[
            { id: 'GRADES', icon: Library, text: 'Học Tập (Courses)', activeBg: 'bg-blue-100 text-blue-700', hover: 'hover:bg-blue-50' },
            { id: 'PRACTICE', icon: PenTool, text: 'Luyện Tập (Practice)', activeBg: 'bg-green-100 text-green-700', hover: 'hover:bg-green-50' },
            { id: 'ARENA', icon: Swords, text: 'Đấu Trường (Arena)', activeBg: 'bg-orange-100 text-orange-700', hover: 'hover:bg-orange-50' },
          ].map(item => (
            <button key={item.id} onClick={() => setAppState(item.id)} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${appState === item.id ? item.activeBg : `text-slate-600 ${item.hover}`}`}>
              <item.icon className="w-6 h-6 shrink-0" />
              <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{item.text}</span>
            </button>
          ))}
          
          {(userData.role === 'admin' || userData.role === 'superadmin') && (
            <button onClick={() => setAppState('ADMIN')} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all mt-auto text-rose-600 hover:bg-rose-50 ${appState === 'ADMIN' ? 'bg-rose-100' : ''}`}>
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">CMS Admin</span>
            </button>
          )}
        </nav>

        {/* Thông tin Tác giả */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200/50 shrink-0">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mb-4 whitespace-nowrap overflow-hidden">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher & Dev</span>
            <span className="font-black text-slate-800 text-lg">Mr. Khoa</span>
            <span className="text-xs text-blue-600 flex items-center gap-2 font-medium"><Mail className="w-3 h-3"/> khoavuexp@gmail.com</span>
            <span className="text-xs text-slate-600 flex items-center gap-2 font-medium"><Phone className="w-3 h-3"/> 0901.637.827</span>
          </div>
          <button onClick={() => signOut(auth)} className="w-full flex items-center gap-4 p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50">
            <LogOut className="w-6 h-6 shrink-0" />
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* VÙNG NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto pl-20 md:pl-0">
        
        {/* Header Glassmorphism */}
        <header className="sticky top-0 h-20 bg-white/50 backdrop-blur-xl border-b border-slate-200/50 flex justify-between items-center px-6 md:px-10 z-40 shrink-0">
          <div className="flex items-center gap-4">
             {['MAP', 'UNITS'].includes(appState) && (
                <button onClick={() => setAppState(appState === 'MAP' ? 'UNITS' : 'GRADES')} className="p-2 bg-white rounded-full hover:scale-110 transition-transform shadow-sm border border-slate-100"><ChevronLeft className="w-6 h-6 text-slate-600" /></button>
             )}
             <h2 className="text-2xl font-black text-slate-800 capitalize hidden sm:block">
                {appState === 'MAP' ? 'G5 - Unit 1' : appState.toLowerCase()}
             </h2>
          </div>
          
          {/* Thông số & Profile */}
          <div className="flex items-center gap-4">
            <div className="flex bg-white/80 backdrop-blur-md rounded-full p-1 border border-slate-200/50 shadow-sm">
               <div className="flex items-center gap-2 px-3 py-1"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-sm" /> <span className="font-black text-slate-700">{userData.stars}</span></div>
               <div className="w-px bg-slate-200 my-1 mx-1"></div>
               <div className="flex items-center gap-2 px-3 py-1"><Zap className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-sm" /> <span className="font-black text-slate-700">{userData.lives}</span></div>
            </div>
            <img src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email}`} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-white" />
          </div>
        </header>

        {/* KHU VỰC CÁC TAB */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* TAB: LỚP HỌC (GLASS CARDS) */}
          {appState === 'GRADES' && (
            <div>
              <h1 className="text-4xl font-black mb-8 text-slate-800 drop-shadow-sm">Chọn Lớp Học</h1>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[1,2,3,4,5].map(g => (
                  <button key={g} onClick={() => setAppState('UNITS')} className={`relative overflow-hidden rounded-[2rem] aspect-square flex flex-col items-center justify-center transition-all ${g===5 ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:-translate-y-2 shadow-xl border border-white/20' : 'bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-400 hover:bg-white shadow-sm hover:shadow-md'}`}>
                    <div className="text-5xl font-black z-10">{g}</div>
                    <div className="font-bold mt-2 opacity-80 z-10">Grade {g}</div>
                    {g !== 5 && <Lock className="absolute top-4 right-4 w-6 h-6 opacity-30" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BÀI HỌC (GLASS CARDS) */}
          {appState === 'UNITS' && (
            <div>
              <h1 className="text-4xl font-black mb-8 text-slate-800 drop-shadow-sm">Grade 5</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => { setMapTheme('ocean'); setAppState('MAP'); }} className="text-left bg-gradient-to-br from-cyan-400 to-blue-600 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(37,99,235,0.2)] text-white hover:scale-105 transition-transform border-b-8 border-blue-800 active:border-b-0 active:translate-y-2 backdrop-blur-xl border-t border-white/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                  <div className="bg-white/20 w-fit px-4 py-1.5 rounded-full text-sm font-black mb-4 backdrop-blur-md border border-white/30">UNIT 1</div>
                  <h3 className="text-3xl font-black mb-2 leading-tight drop-shadow-md">What's your address?</h3>
                  <div className="flex items-center gap-2 mt-8 font-bold bg-black/20 w-fit px-4 py-2 rounded-xl backdrop-blur-sm"><MapPin className="w-5 h-5"/> Mở Bản Đồ Đại Dương</div>
                </button>
                
                <div className="text-left bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border-2 border-slate-200 shadow-sm relative">
                  <div className="bg-slate-200 w-fit px-4 py-1.5 rounded-full text-sm font-black text-slate-500 mb-4">UNIT 2</div>
                  <h3 className="text-3xl font-black text-slate-400 mb-2 leading-tight">I always get up early</h3>
                  <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center"><Lock className="w-12 h-12 text-slate-400"/></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BẢN ĐỒ VÀ GAME ENGINE */}
          {appState === 'MAP' && (
             <VisualMap progress={progress} theme={mapTheme} onEnterStation={enterStation} />
          )}

          {/* MODAL GAME KHI BẤM VÀO TRẠM */}
          {gameStation && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
               <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in border-4 border-slate-100 relative">
                  
                  {/* Hearts Status in Game */}
                  <div className="absolute top-6 right-6 flex items-center gap-2 bg-rose-100 px-4 py-2 rounded-full border border-rose-200 z-10">
                     <Zap className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                     <span className="font-black text-rose-700">{userData.lives}</span>
                  </div>

                  <div className="bg-slate-50 p-6 border-b border-slate-100 pr-32">
                     <h3 className="text-2xl font-black text-slate-800">{gameStation.nodeName}</h3>
                     <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">{gameStation.type} Challenge</span>
                  </div>

                  <div className="p-8 md:p-12 text-center">
                     {gameStation.image && <img src={gameStation.image} alt="Visual" className="w-full h-48 object-cover rounded-3xl mb-8 shadow-md border-4 border-white" />}
                     
                     {/* Nút Nghe cho bài Listen */}
                     {gameStation.type === 'listen' && (
                       <button onClick={() => playAudio(gameStation.audioText)} className="mb-8 mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_10px_25px_rgba(37,99,235,0.4)] border-4 border-white group">
                          <Volume2 className="w-10 h-10 text-white group-hover:animate-ping absolute opacity-40" />
                          <Volume2 className="w-10 h-10 text-white relative z-10" />
                       </button>
                     )}

                     <h2 className="text-3xl font-black text-slate-800 mb-10 leading-tight">{gameStation.question}</h2>

                     {/* Trắc nghiệm */}
                     {(gameStation.type === 'vocab' || gameStation.type === 'grammar' || gameStation.type === 'listen') && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {gameStation.options.map((opt, i) => (
                           <button key={i} onClick={() => {
                             playAudio(opt);
                             if (opt === gameStation.answer) handleGameWin();
                             else handleGameLose();
                           }} className="p-5 bg-white border-2 border-slate-200 rounded-2xl font-bold text-xl text-slate-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm active:scale-95">
                             {opt}
                           </button>
                         ))}
                       </div>
                     )}

                     {/* Luyện Nói (Speaking) */}
                     {gameStation.type === 'speak' && (
                       <div className="flex flex-col items-center">
                         <button onClick={() => {
                            alert(`Thu âm: "${gameStation.answer}"\n(AI giả lập chấm đúng!)`);
                            handleGameWin();
                         }} className="w-32 h-32 rounded-full bg-rose-500 text-white flex items-center justify-center hover:scale-105 shadow-xl shadow-rose-200 border-8 border-rose-100 mb-6 animate-pulse active:scale-95 transition-transform">
                            <Mic className="w-12 h-12" />
                         </button>
                         <p className="text-slate-500 font-bold">Nhấn để thu âm</p>
                       </div>
                     )}
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                     <button onClick={() => setGameStation(null)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600">Thoát</button>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: THỰC HÀNH (PRACTICE) */}
          {appState === 'PRACTICE' && (
            <div>
               <h1 className="text-4xl font-black mb-8 text-slate-800 drop-shadow-sm flex items-center gap-4"><PenTool className="w-10 h-10 text-green-500"/> Practice Hub</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { id: 'mock', title: '45-Min Test', desc: 'Thi học kỳ chuẩn', icon: Target, c: 'from-rose-400 to-red-500' },
                   { id: 'cambridge', title: 'Cambridge', desc: 'Flyers, Movers', icon: Star, c: 'from-amber-400 to-orange-500' },
                   { id: 'listen', title: 'Listening', desc: 'Luyện nghe phản xạ', icon: Headphones, c: 'from-cyan-400 to-blue-500' },
                   { id: 'write', title: 'Writing', desc: 'Ghép câu, viết', icon: BookOpen, c: 'from-purple-400 to-fuchsia-500' }
                 ].map(card => (
                   <button key={card.id} onClick={()=>alert("Module Luyện tập đang nạp data!")} className="text-left bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all group">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.c} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}><card.icon className="w-8 h-8 text-white" /></div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">{card.title}</h3>
                      <p className="text-slate-500 font-medium">{card.desc}</p>
                   </button>
                 ))}
               </div>
            </div>
          )}

          {/* TAB: ADMIN (CMS NHẬP DỮ LIỆU) */}
          {appState === 'ADMIN' && (userData.role === 'superadmin' || userData.role === 'admin') && (
            <div className="max-w-4xl mx-auto pb-20">
               <h1 className="text-4xl font-black mb-8 text-rose-600 drop-shadow-sm flex items-center gap-4"><ShieldAlert className="w-10 h-10"/> CMS Quản Trị</h1>
               
               <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-slate-200">
                  <h3 className="text-2xl font-black mb-2 text-slate-800">Cỗ Máy Nạp Dữ Liệu Lên Cloud</h3>
                  <p className="text-slate-500 mb-8 font-medium">Chọn Lớp, chọn Bài và dán nội dung JSON chuẩn để cập nhật vào Hệ sinh thái.</p>
                  
                  <div className="flex gap-4 mb-6">
                     <div className="flex-1">
                        <label className="font-bold text-slate-700 block mb-2">Lớp (Grade)</label>
                        <select value={adminGrade} onChange={(e) => setAdminGrade(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold outline-none focus:border-blue-500">
                          {[1,2,3,4,5].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                        </select>
                     </div>
                     <div className="flex-1">
                        <label className="font-bold text-slate-700 block mb-2">Bài (Unit)</label>
                        <select value={adminUnit} onChange={(e) => setAdminUnit(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold outline-none focus:border-blue-500">
                          {[...Array(20)].map((_, i) => <option key={i} value={i+1}>Unit {i+1}</option>)}
                        </select>
                     </div>
                  </div>

                  <label className="font-bold text-slate-700 block mb-2">Nội dung Bài Học (Định dạng JSON)</label>
                  <div className="relative">
                     <textarea 
                        value={adminDataInput} 
                        onChange={(e) => setAdminDataInput(e.target.value)}
                        className="w-full h-80 p-6 rounded-2xl bg-[#0f172a] text-[#4ade80] font-mono text-sm border-4 border-slate-800 outline-none mb-6 shadow-inner focus:border-rose-500 transition-colors leading-relaxed"
                        spellCheck="false"
                     />
                  </div>
                  
                  <button onClick={handlePushData} className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white py-5 rounded-2xl font-black text-xl hover:scale-[1.02] transition-transform shadow-[0_10px_25px_rgba(225,29,72,0.4)] flex items-center justify-center gap-3 border border-white/20">
                     <Rocket className="w-7 h-7"/> ĐẨY LÊN ĐÁM MÂY (FIREBASE)
                  </button>
               </div>
            </div>
          )}

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
    </div>
  );
}