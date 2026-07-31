import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, 
  Volume2, Trophy, Zap, Users, X, Shield, 
  ArrowRight, Globe, MessageCircle, Compass, Rocket, TreePine, Anchor,
  LogOut, Play, Headphones, Flame, MessageSquare, Library,
  Mail, Phone, Target, Clock, Gamepad2, Timer,
  ShieldAlert, Sparkles, Medal, BookOpen, PenTool, Swords, Mic
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, where } from "firebase/firestore";

const firebaseConfig = {
  // LƯU Ý CHO MÔI TRƯỜNG VERCEL/VITE: 
  // Hãy xóa comment (//) ở các dòng import.meta.env dưới đây và xóa các dòng string giả ở dưới cùng nhé!
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
   appId: import.meta.env.VITE_FIREBASE_APP_ID,
   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const FALLBACK_UNIT1_DATA = {
  station1: { 
    type: "vocab", 
    question: "What is the English word for 'Thành phố'?", 
    answer: "city", 
    options: ["village", "city", "town", "island"], 
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80" 
  },
  station2: { 
    type: "grammar", 
    question: "Choose the correct preposition: I live ___ the second floor of City Tower.", 
    answer: "on", 
    options: ["in", "on", "at", "by"] 
  },
  station3: { 
    type: "listen", 
    question: "Listen and choose the word you hear:", 
    answer: "village", 
    options: ["city", "village", "mountain", "tower"],
    audioText: "I live in a small village in the mountains."
  },
  station4: { 
    type: "speak", 
    question: "Read this sentence aloud:", 
    answer: "What is your address",
    expectedText: "what is your address" 
  }
};

const QUOTES = [
  "Believe in yourself!",
  "Every day is a new start.",
  "You are capable of amazing things.",
  "Mistakes help us learn.",
  "Dream big, study hard."
];

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ role: 'student', stars: 0, lives: 3, status: 'active' });
  const [appState, setAppState] = useState('SPLASH'); // SPLASH, GRADES, UNITS, MAP, ARENA, PRACTICE, PRACTICE_DOING, ADMIN
  const [mapTheme, setMapTheme] = useState('ocean');
  const [progress, setProgress] = useState(0);
  const [showGameModal, setShowGameModal] = useState(null); // Chứa dữ liệu của trạm đang chơi
  const [showAITutor, setShowAITutor] = useState(false);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  
  // States cho Practice
  const [currentPractice, setCurrentPractice] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Kiểm tra db xem có user chưa
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        let dbData = { role: 'student', stars: 0, lives: 3, status: 'active', name: currentUser.displayName, email: currentUser.email };
        
        // Super admin cứng
        if (currentUser.email === 'khoavuexp2@gmail.com' || currentUser.email === 'khoavuexp@gmail.com') {
          dbData.role = 'superadmin';
        }

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.status === 'blocked') {
            alert("Tài khoản của bạn đã bị khóa!");
            signOut(auth);
            setUser(null);
            return;
          }
          dbData = { ...dbData, ...data };
        } else {
          await setDoc(userRef, dbData);
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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleNodeClick = async (index, nodeId) => {
    if (userData.lives <= 0) {
      alert("Bạn đã hết ❤️! Hãy chờ hồi phục để chơi tiếp.");
      return;
    }

    let stationData = FALLBACK_UNIT1_DATA[`station${index + 1}`]; // Mặc định dùng Fallback

    try {
      // Cố gắng lấy từ Firebase
      const unitRef = doc(db, "units", "grade5_unit1");
      const unitSnap = await getDoc(unitRef);
      if (unitSnap.exists() && unitSnap.data()[`station${index + 1}`]) {
        stationData = unitSnap.data()[`station${index + 1}`];
      }
    } catch (e) {
      console.log("Firebase fetch failed, using fallback data.");
    }

    if (!stationData) {
      alert("Bài học này đang được cập nhật (Coming Soon) 🚧");
      return;
    }

    setShowGameModal({ ...stationData, index });
  };

  const handleGameWin = async (starsEarned, index) => {
    setShowGameModal(null);
    const newStars = userData.stars + starsEarned;
    const newProgress = Math.max(progress, index + 1); // Cập nhật trạm tiếp theo
    
    setUserData(prev => ({ ...prev, stars: newStars }));
    setProgress(newProgress);
    
    // Lưu lên Firebase
    if (user) {
      await updateDoc(doc(db, "users", user.uid), { stars: newStars, progress: newProgress });
    }
    
    alert(`🎉 Chúc mừng! Bạn nhận được ${starsEarned} Sao!`);
    if (index === 3) {
      setAppState('UNITS'); // Vượt boss xong ra ngoài
    }
  };

  const handleGameLose = async () => {
    const newLives = userData.lives - 1;
    setUserData(prev => ({ ...prev, lives: newLives }));
    if (user) {
      await updateDoc(doc(db, "users", user.uid), { lives: newLives });
    }
    if (newLives <= 0) {
      setShowGameModal(null);
    }
  };

  if (appState === 'SPLASH') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Nền động (Mô phỏng vũ trụ) */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
           <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="z-10 text-center bg-white/10 backdrop-blur-lg p-12 rounded-[3rem] border border-white/20 shadow-2xl max-w-lg w-full">
          <div className="w-32 h-32 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-3xl mx-auto mb-8 shadow-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform">
            <Globe className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Global Explorer</h1>
          <p className="text-blue-200 text-lg mb-10">Vũ trụ tri thức tiếng Anh chuẩn quốc tế.</p>
          <button onClick={handleLogin} className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black text-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3">
            Đăng Nhập Bằng Google <ArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden font-sans">
      
      {/* Sidebar Ẩn/Hiện */}
      <aside className="w-20 hover:w-64 bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out group border-r border-slate-200 fixed h-full md:relative">
        <div className="p-4 flex items-center gap-4 border-b border-slate-100 overflow-hidden shrink-0">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200"><Compass className="text-white w-7 h-7" /></div>
          <span className="font-black text-xl text-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Explorer</span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {[
            { id: 'GRADES', icon: Library, text: 'Học Tập (Courses)', color: 'text-blue-500', bg: 'hover:bg-blue-50' },
            { id: 'PRACTICE', icon: PenTool, text: 'Luyện Tập (Practice)', color: 'text-green-500', bg: 'hover:bg-green-50' },
            { id: 'ARENA', icon: Swords, text: 'Đấu Trường (Arena)', color: 'text-orange-500', bg: 'hover:bg-orange-50' },
          ].map(item => (
            <button key={item.id} onClick={() => setAppState(item.id)} className={`w-full flex items-center gap-4 px-6 py-4 transition-colors ${appState === item.id ? 'bg-slate-100 border-r-4 border-blue-600' : item.bg}`}>
              <item.icon className={`w-6 h-6 shrink-0 ${item.color}`} />
              <span className={`font-bold text-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${appState === item.id ? 'text-blue-700' : ''}`}>{item.text}</span>
            </button>
          ))}

          {/* Nút Admin chỉ hiện với Giáo viên */}
          {(userData.role === 'admin' || userData.role === 'superadmin') && (
            <button onClick={() => setAppState('ADMIN')} className={`w-full flex items-center gap-4 px-6 py-4 mt-auto transition-colors hover:bg-rose-50`}>
              <ShieldAlert className="w-6 h-6 shrink-0 text-rose-600" />
              <span className="font-bold text-rose-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Khối Quote */}
        <div className="px-4 py-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100 shrink-0">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <Flame className="w-6 h-6 text-amber-500 mb-2" />
            <p className="text-sm font-bold text-amber-800 italic">"{quote}"</p>
          </div>
        </div>

        {/* Khối Tác giả & Thoát */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mb-4 whitespace-nowrap overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher & Developer</span>
            <span className="font-black text-slate-800">Mr. Khoa</span>
            <a href="mailto:khoavuexp@gmail.com" className="text-xs text-blue-600 hover:underline flex items-center gap-2"><Mail className="w-3 h-3"/> khoavuexp@gmail.com</a>
            <span className="text-xs text-slate-600 flex items-center gap-2"><Phone className="w-3 h-3"/> 0901.637.827</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-2 py-2 text-slate-500 hover:text-red-500 transition-colors">
            <LogOut className="w-6 h-6 shrink-0" />
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Khu vực Hiển thị Nội dung Chính */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        
        {/* Header (Máu, Sao, Profile) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-6 md:px-10 shrink-0 z-40 relative">
          <div className="flex items-center gap-4">
             {['MAP', 'UNITS', 'PRACTICE_DOING'].includes(appState) && (
                <button onClick={() => {
                  if(appState === 'MAP') setAppState('UNITS');
                  if(appState === 'UNITS') setAppState('GRADES');
                  if(appState === 'PRACTICE_DOING') setAppState('PRACTICE');
                }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
             )}
             <h2 className="text-xl md:text-2xl font-black text-slate-800 capitalize hidden sm:block">
                {appState === 'MAP' ? 'Grade 5 - Unit 1' : appState === 'PRACTICE_DOING' ? currentPractice : appState.toLowerCase()}
             </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200 shadow-inner">
               <div className="flex items-center gap-2 px-3 py-1.5"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> <span className="font-black text-slate-700">{userData.stars}</span></div>
               <div className="w-px bg-slate-300 my-1 mx-1"></div>
               <div className="flex items-center gap-2 px-3 py-1.5"><Zap className="w-5 h-5 text-rose-500 fill-rose-500" /> <span className="font-black text-slate-700">{userData.lives}</span></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="font-bold text-slate-800 text-sm">{user?.displayName}</div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{userData.role}</div>
              </div>
              <img src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email}`} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-blue-200 shadow-md" />
            </div>
          </div>
        </header>

        {/* Khung chứa các màn hình (Cuộn độc lập) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          
          {/* MÀN HÌNH CHỌN KHỐI (GRADES) */}
          {appState === 'GRADES' && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-black mb-8 text-slate-800">Select Your Grade</h1>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                {[
                  { id: 1, title: 'Grade 1', locked: false, color: 'bg-green-500' },
                  { id: 2, title: 'Grade 2', locked: true, color: 'bg-slate-300' },
                  { id: 3, title: 'Grade 3', locked: true, color: 'bg-slate-300' },
                  { id: 4, title: 'Grade 4', locked: true, color: 'bg-slate-300' },
                  { id: 5, title: 'Grade 5', locked: false, color: 'bg-blue-500' }
                ].map(g => (
                  <button key={g.id} onClick={() => !g.locked && setAppState('UNITS')} className={`relative overflow-hidden rounded-3xl aspect-square flex flex-col items-center justify-center transition-all ${g.locked ? 'bg-slate-200 text-slate-400' : `${g.color} text-white hover:-translate-y-2 shadow-xl hover:shadow-2xl`}`}>
                    <div className="text-4xl font-black z-10">{g.title}</div>
                    {g.locked && <Lock className="w-8 h-8 mt-4 opacity-50 z-10" />}
                    {!g.locked && <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform z-0"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MÀN HÌNH CHỌN BÀI HỌC (UNITS) */}
          {appState === 'UNITS' && (
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-black mb-8 text-slate-800">Semester 1</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button onClick={() => { setMapTheme('ocean'); setAppState('MAP'); }} className="text-left bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-[2rem] shadow-xl text-white hover:scale-105 transition-transform border-b-8 border-blue-800 active:border-b-0 active:translate-y-2">
                  <div className="bg-white/20 w-fit px-4 py-1 rounded-full text-sm font-bold mb-4 backdrop-blur-sm">Unit 1</div>
                  <h3 className="text-2xl font-black mb-2 leading-tight">What's your address?</h3>
                  <div className="flex items-center gap-2 mt-6 font-bold bg-black/20 w-fit px-4 py-2 rounded-full"><MapPin className="w-4 h-4"/> Ocean Map</div>
                </button>
                <div className="text-left bg-slate-200 p-8 rounded-[2rem] border-4 border-slate-300 opacity-70">
                  <div className="bg-slate-300 w-fit px-4 py-1 rounded-full text-sm font-bold text-slate-500 mb-4">Unit 2</div>
                  <h3 className="text-2xl font-black text-slate-500 mb-2">I always get up early</h3>
                  <div className="flex items-center gap-2 mt-6 font-bold text-slate-500"><Lock className="w-4 h-4"/> Locked</div>
                </div>
              </div>
            </div>
          )}

          {/* MÀN HÌNH BẢN ĐỒ (MAP) */}
          {appState === 'MAP' && (
            <div className="w-full h-[600px] bg-gradient-to-b from-cyan-300 to-blue-600 rounded-[3rem] shadow-inner relative border-8 border-white overflow-hidden">
               {/* Sóng biển trang trí */}
               <div className="absolute bottom-0 left-0 right-0 h-32 bg-blue-700 opacity-50 rounded-t-[100%]"></div>
               
               {/* Các trạm (Nodes) */}
               {[
                 { id: 'station1', y: 80, x: 20, icon: '🏝️', title: 'Word Island', type: 'Vocab' },
                 { id: 'station2', y: 60, x: 50, icon: '🏰', title: 'Grammar Castle', type: 'Grammar' },
                 { id: 'station3', y: 40, x: 80, icon: '🐚', title: 'Listen Shell', type: 'Listen' },
                 { id: 'station4', y: 15, x: 50, icon: '🐙', title: 'Boss Kraken', type: 'Speaking' }
               ].map((node, i) => {
                 const isUnlocked = progress >= i;
                 return (
                   <div key={i} onClick={() => isUnlocked && handleNodeClick(i, node.id)} className={`absolute flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2 ${isUnlocked ? 'cursor-pointer hover:scale-110' : 'opacity-50 grayscale'} transition-transform z-10`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                     <div className="text-5xl drop-shadow-xl bg-white/20 p-4 rounded-full backdrop-blur-sm border-2 border-white/50">{node.icon}</div>
                     <div className="bg-slate-900/80 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg whitespace-nowrap">{node.title}</div>
                     {!isUnlocked && <Lock className="absolute top-4 w-8 h-8 text-slate-800" />}
                     {progress > i && <CheckCircle2 className="absolute top-0 right-0 w-8 h-8 text-green-400 bg-white rounded-full" />}
                   </div>
                 )
               })}

               {/* Đường kẻ đứt */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <path d="M 20% 80% Q 35% 70% 50% 60% T 80% 40% T 50% 15%" fill="transparent" stroke="rgba(255,255,255,0.4)" strokeWidth="6" strokeDasharray="10 15" strokeLinecap="round" />
               </svg>

               {/* FAB AI */}
               <button onClick={() => setShowAITutor(!showAITutor)} className="absolute bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full shadow-[0_10px_25px_rgba(225,29,72,0.5)] flex items-center justify-center border-4 border-white hover:scale-110 transition-transform z-50 group">
                 <MessageCircle className="w-8 h-8 text-white group-hover:animate-ping absolute opacity-50" />
                 <MessageCircle className="w-8 h-8 text-white relative z-10" />
               </button>
            </div>
          )}

          {/* MÀN HÌNH PRACTICE (CHỌN BÀI) */}
          {appState === 'PRACTICE' && (
            <div className="max-w-6xl mx-auto">
               <h1 className="text-3xl font-black mb-8 text-slate-800 flex items-center gap-3"><PenTool/> Luyện Tập Cường Độ Cao</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { id: 'mock45', title: '45-Min Mock Test', desc: 'Đề kiểm tra 45 phút chuẩn BGD', icon: Timer, color: 'bg-rose-500', shadow: 'shadow-rose-200' },
                   { id: 'cambridge', title: 'Cambridge Advanced', desc: 'Starters, Movers, Flyers', icon: Medal, color: 'bg-yellow-500', shadow: 'shadow-yellow-200' },
                   { id: 'listening', title: 'Listening Hub', desc: 'Luyện nghe phản xạ', icon: Headphones, color: 'bg-cyan-500', shadow: 'shadow-cyan-200' },
                   { id: 'writing', title: 'Writing Mastery', desc: 'Sắp xếp câu, luyện viết', icon: BookOpen, color: 'bg-purple-500', shadow: 'shadow-purple-200' }
                 ].map(card => (
                   <div key={card.id} onClick={() => { setCurrentPractice(card.title); setAppState('PRACTICE_DOING'); }} className={`bg-white rounded-[2rem] p-6 shadow-xl ${card.shadow} border-2 border-transparent hover:border-${card.color.split('-')[1]}-500 cursor-pointer transition-all hover:-translate-y-2 group`}>
                      <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}><card.icon className="w-7 h-7 text-white" /></div>
                      <h3 className="text-xl font-black text-slate-800 mb-2">{card.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{card.desc}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* MÀN HÌNH ĐANG LÀM PRACTICE (THỰC CHIẾN) */}
          {appState === 'PRACTICE_DOING' && (
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center animate-fade-in">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4">{currentPractice}</h2>
                <p className="text-slate-500 mb-8 max-w-lg mx-auto">Đề thi đang được AI tổng hợp từ ngân hàng câu hỏi. Vui lòng chuẩn bị giấy nháp và bút.</p>
                <button onClick={() => { alert("Chức năng sinh đề thi đang được nạp dữ liệu!"); setAppState('PRACTICE'); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-lg shadow-blue-200">
                    Bắt Đầu Làm Bài
                </button>
            </div>
          )}

          {/* MÀN HÌNH ADMIN TẠO DATA */}
          {appState === 'ADMIN' && (userData.role === 'admin' || userData.role === 'superadmin') && (
            <div className="max-w-6xl mx-auto">
               <h1 className="text-3xl font-black mb-8 text-rose-600 flex items-center gap-3"><ShieldAlert/> Admin Control Panel</h1>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Cột 1: Đẩy Data */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                     <h3 className="text-xl font-black mb-4">Cơ sở dữ liệu (Database)</h3>
                     <p className="text-slate-500 mb-6 text-sm">Sử dụng công cụ này để đẩy dữ liệu mẫu (Unit 1 - Lớp 5) lên Firebase Firestore của bạn.</p>
                     
                     <button onClick={async () => {
                        try {
                          await setDoc(doc(db, "units", "grade5_unit1"), FALLBACK_UNIT1_DATA);
                          alert("✅ Đã đẩy thành công dữ liệu Unit 1 lên Firebase!");
                        } catch (e) {
                          alert("❌ Lỗi đẩy dữ liệu: " + e.message);
                        }
                     }} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold hover:bg-rose-700 flex items-center justify-center gap-2">
                        <Rocket className="w-5 h-5"/> Push Data (Lớp 5 - Unit 1) lên Firebase
                     </button>
                  </div>

                  {/* Cột 2: Bơm máu */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                     <h3 className="text-xl font-black mb-4">Công cụ Test Nhanh</h3>
                     <button onClick={async () => {
                        const newLives = 5;
                        setUserData(prev => ({...prev, lives: newLives}));
                        await updateDoc(doc(db, "users", user.uid), { lives: newLives });
                        alert("Đã bơm đầy 5 Tim để test!");
                     }} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5"/> Bơm Máu (Lives) Cho Tài Khoản Này
                     </button>
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* GAME MODAL (Engine xử lý câu hỏi thật) */}
      {showGameModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8">
           <div className="bg-white w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col relative animate-fade-in border-4 border-slate-100">
              {/* Header Modal */}
              <div className="bg-slate-100 p-4 flex justify-between items-center border-b border-slate-200">
                 <div className="flex gap-2">
                   {[...Array(3)].map((_, i) => (
                     <Zap key={i} className={`w-6 h-6 ${i < userData.lives ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`} />
                   ))}
                 </div>
                 <span className="font-black text-slate-500 uppercase tracking-widest">{showGameModal.type} Challenge</span>
                 <button onClick={() => setShowGameModal(null)} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300"><X /></button>
              </div>

              {/* Nội dung câu hỏi */}
              <div className="p-8 md:p-12 text-center flex-1 overflow-y-auto">
                 {/* Ảnh minh họa nếu có */}
                 {showGameModal.image && (
                   <img src={showGameModal.image} alt="Visual" className="w-full h-48 object-cover rounded-2xl mb-6 shadow-md" />
                 )}
                 
                 {/* Nút Audio cho bài Nghe */}
                 {showGameModal.type === 'listen' && (
                   <button onClick={() => {
                     const utterance = new SpeechSynthesisUtterance(showGameModal.audioText);
                     utterance.lang = 'en-US';
                     window.speechSynthesis.speak(utterance);
                   }} className="mb-6 mx-auto w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                      <Volume2 className="w-10 h-10 text-white" />
                   </button>
                 )}

                 <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-8">{showGameModal.question}</h2>

                 {/* Dạng Trắc nghiệm (Multiple Choice) */}
                 {(showGameModal.type === 'vocab' || showGameModal.type === 'grammar' || showGameModal.type === 'listen') && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {showGameModal.options.map((opt, i) => (
                       <button key={i} onClick={() => {
                         // Phát âm từ vừa chọn
                         const u = new SpeechSynthesisUtterance(opt);
                         u.lang = 'en-US'; window.speechSynthesis.speak(u);
                         // Chấm điểm
                         if (opt === showGameModal.answer) {
                           handleGameWin(15, showGameModal.index);
                         } else {
                           alert("Sai rồi! Bị trừ 1 Tim 💔");
                           handleGameLose();
                         }
                       }} className="p-4 bg-slate-100 rounded-2xl font-bold text-lg text-slate-700 hover:bg-blue-500 hover:text-white transition-colors border-2 border-slate-200 hover:border-blue-500">
                         {opt}
                       </button>
                     ))}
                   </div>
                 )}

                 {/* Dạng Nói (Speaking Boss) */}
                 {showGameModal.type === 'speak' && (
                   <div className="flex flex-col items-center">
                     <button onClick={() => {
                        alert(`Trình duyệt ghi âm: "What is your address". \nBạn đọc đúng!`);
                        handleGameWin(50, showGameModal.index);
                     }} className="w-32 h-32 rounded-full bg-rose-500 text-white flex items-center justify-center hover:scale-105 shadow-xl shadow-rose-200 border-8 border-rose-100 mb-6 animate-pulse">
                        <Mic className="w-12 h-12" />
                     </button>
                     <p className="text-slate-500 font-bold">Bấm vào Mic và đọc to câu trên (Mô phỏng)</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Phong cách (CSS) */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}} />
    </div>
  );
}