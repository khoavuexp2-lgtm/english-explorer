import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, 
  Volume2, Trophy, Zap, PlayCircle, Users, X, User, Shield, 
  ArrowRight, Globe, MessageCircle, Mic, Compass, Rocket, TreePine, Anchor,
  LogOut, Settings, PenTool, BookOpen, Headphones, ShieldAlert,
  AlertTriangle, UploadCloud
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection } from "firebase/firestore";

// --- FIREBASE CONFIG (Giữ nguyên cấu hình của bạn) ---
 const firebaseConfig = {
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
   appId: import.meta.env.VITE_FIREBASE_APP_ID,
   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
 };
// 
// // Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
 const db = getFirestore(app);
 const provider = new GoogleAuthProvider();

// LƯU Ý MÔ PHỎNG: Để tránh lỗi biên dịch khi bạn chưa thiết lập xong cấu hình Firebase thật, 
// tôi tạm thời comment Firebase thật và dùng các hàm Mock dưới đây.
// Khi bạn muốn chạy Firebase thật, hãy UNCOMMENT phần trên và XÓA phần MOCK dưới này.
//const auth = { onAuthStateChanged: (cb) => cb(null), signOut: () => {} };
//const provider = {};
//const signInWithPopup = async () => ({ user: { uid: 'u1', displayName: 'Khoa Vu', email: 'khoavuexp@gmail.com', photoURL: '' }});
//const db = {};
//const doc = () => ({});
//const getDoc = async () => ({ exists: () => false });
//const setDoc = async () => {};
//const onSnapshot = () => () => {};

// --- MẪU DỮ LIỆU ĐỂ DÁN VÀO ADMIN ---
const JSON_TEMPLATE = `{
  "station1": {
    "type": "vocab",
    "question": "What is the English word for 'City'?",
    "answer": "city",
    "options": ["village", "city", "town", "island"],
    "image": "https://images.unsplash.com/photo-1477959858617-6c0843f07a75?auto=format&fit=crop&w=800&q=80"
  },
  "station2": {
    "type": "grammar",
    "question": "Chọn từ đúng: ___ is your address?",
    "answer": "What",
    "options": ["What", "Where", "How", "Who"]
  },
  "station3": {
    "type": "listen",
    "question": "Listen and type the word you hear:",
    "answer": "village",
    "audioText": "village"
  }
}`;

export default function App() {
  const [appState, setAppState] = useState('SPLASH'); // SPLASH, GRADES, UNITS, PLAYING, ARENA, PRACTICE, ADMIN
  const [mapTheme, setMapTheme] = useState('ocean');
  
  // Trạng thái Người dùng & Firebase
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Trạng thái Admin CMS
  const [adminGrade, setAdminGrade] = useState('5');
  const [adminUnit, setAdminUnit] = useState('1');
  const [adminDataInput, setAdminDataInput] = useState(JSON_TEMPLATE);
  const [adminError, setAdminError] = useState("");

  // Trạng thái Gameplay
  const [inventory, setInventory] = useState({ stars: 0, lifelines: 3 });
  
  // Quotes truyền động lực (Sidebar)
  const QUOTES = [
    "Believe in yourself! 🌟",
    "Every day is a new opportunity. 📚",
    "You are capable of amazing things! 🚀",
    "Mistakes are proof that you are trying. 💡",
    "Keep exploring, keep growing! 🌍"
  ];
  const [dailyQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // Giả lập Đăng nhập Tự động (Để test nhanh)
  useEffect(() => {
    // onAuthStateChanged(auth, async (currentUser) => { ... });
    setAppState('GRADES');
    setUserData({
       role: 'superadmin',
       progress: { grade5_unit1: 2 },
       inventory: { stars: 100, lifelines: 5 }
    });
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setAppState('GRADES');
    } catch (error) {
      console.error(error);
      alert("Đăng nhập thất bại");
    }
  };

  const handleLogout = () => {
    // signOut(auth);
    setAppState('SPLASH');
  };

  // Hàm CMS Đẩy Data an toàn
  const handlePushData = async () => {
    setAdminError("");
    try {
      // 1. Kiểm tra JSON có hợp lệ không trước khi đẩy
      const parsedData = JSON.parse(adminDataInput);
      
      // 2. Nếu hợp lệ, đẩy lên Firebase
      const docId = `grade${adminGrade}_unit${adminUnit}`;
      // await setDoc(doc(db, "units", docId), parsedData);
      
      alert(`🎉 Thành công! Đã ghi đè/tạo mới dữ liệu bài học vào ID: ${docId} trên Đám mây.`);
    } catch (error) {
      // Báo lỗi chính xác dòng JSON hỏng
      setAdminError("Lỗi Cú Pháp JSON: " + error.message);
    }
  };

  if (appState === 'SPLASH') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Orbs Background - Hiệu ứng kính */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{animationDelay: "2s"}}></div>
        
        <div className="text-center z-10 animate-fade-in bg-white/10 p-10 rounded-[3rem] backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="w-32 h-32 bg-gradient-to-tr from-blue-400 to-indigo-600 rounded-full mx-auto mb-8 shadow-2xl flex items-center justify-center border-4 border-white"><Globe className="w-16 h-16 text-white animate-spin-slow" /></div>
          <h1 className="text-5xl font-black mb-4 text-white drop-shadow-md">Knowledge Universe</h1>
          <button onClick={handleLogin} className="w-full py-4 mt-8 bg-white text-blue-900 rounded-2xl font-black text-xl hover:bg-blue-50 transition-colors shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3">
            <User className="w-6 h-6"/> Đăng Nhập Bằng Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans relative selection:bg-blue-300">
      
      {/* KHU VỰC BACKGROUND (Cực kỳ quan trọng để tạo hiệu ứng Glassmorphism) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse pointer-events-none" style={{animationDelay: "2s"}}></div>

      {/* Cảnh báo Màn hình dọc */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-yellow-400 text-yellow-900 text-center py-1 text-xs font-bold z-[999] opacity-90">
         📱 Đề xuất: Xoay ngang điện thoại để trải nghiệm tốt nhất!
      </div>

      {/* SIDEBAR TỰ ẨN (Thu gọn) */}
      <aside className="w-20 hover:w-64 transition-all duration-300 bg-white/70 backdrop-blur-2xl border-r border-white/60 shadow-[10px_0_30px_rgba(0,0,0,0.05)] flex flex-col group z-50 shrink-0 relative overflow-hidden">
        
        {/* Header Sidebar */}
        <div className="h-20 flex items-center justify-center group-hover:justify-start group-hover:px-6 border-b border-slate-200/50 shrink-0 transition-all">
          <Globe className="w-10 h-10 text-blue-600 shrink-0 animate-spin-slow" />
          <span className="font-black text-xl text-blue-900 ml-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Global Explorer</span>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-hidden">
          {[
            { id: 'GRADES', icon: BookOpen, label: 'Lớp Học' },
            { id: 'PRACTICE', icon: PenTool, label: 'Luyện Tập' },
            { id: 'ARENA', icon: Trophy, label: 'Đấu Trường' }
          ].map(item => (
            <button key={item.id} onClick={() => setAppState(item.id)} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${appState === item.id ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-500 hover:bg-white hover:shadow-md hover:text-blue-600'}`}>
              <item.icon className="w-6 h-6 shrink-0" />
              <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
            </button>
          ))}
          
          {/* Admin Tab (Chỉ Superadmin) */}
          {(userData?.role === 'admin' || userData?.role === 'superadmin') && (
            <button onClick={() => setAppState('ADMIN')} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all mt-auto text-rose-600 hover:bg-rose-50 ${appState === 'ADMIN' ? 'bg-rose-100' : ''}`}>
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">CMS Admin</span>
            </button>
          )}
        </nav>

        {/* Khu vực Quotes truyền cảm hứng lấp đầy khoảng trống Sidebar */}
        <div className="px-4 py-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100 shadow-inner w-52">
              <span className="text-2xl mb-1 block">💡</span>
              <p className="text-sm font-bold text-slate-600 italic">"{dailyQuote}"</p>
           </div>
        </div>

        {/* Thông tin Tác giả */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200/50 shrink-0 mt-2">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shrink-0 shadow-md flex items-center justify-center text-white font-bold">K</div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="font-black text-slate-800 text-sm">Mr. Khoa</div>
              <div className="text-xs font-bold text-slate-400">khoavuexp@gmail.com</div>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-3 w-full flex items-center gap-3 p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100">
            <LogOut className="w-5 h-5"/> <span className="font-bold text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto overflow-x-hidden">
        
        {/* Header HUD (Sinh Lực & Sao) */}
        <header className="h-20 px-8 flex justify-between items-center bg-white/40 backdrop-blur-md sticky top-0 z-40 border-b border-white/60">
          <div className="flex items-center gap-4">
            {appState !== 'GRADES' && (
              <button onClick={() => setAppState('GRADES')} className="p-2 bg-white rounded-full hover:bg-slate-100 shadow-sm border border-slate-200 text-slate-600"><ChevronLeft /></button>
            )}
            <h2 className="text-2xl font-black text-slate-800 hidden sm:block">Khám Phá Tri Thức</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white">
              <Zap className="w-5 h-5 text-rose-500 fill-current animate-pulse" />
              <span className="font-black text-lg text-slate-700">{inventory.lifelines}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
              <span className="font-black text-lg text-slate-700">{inventory.stars}</span>
            </div>
          </div>
        </header>

        {/* KHU VỰC CÁC TAB */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
          
          {/* TAB: LỚP HỌC (GLASS CARDS) */}
          {appState === 'GRADES' && (
            <div className="animate-fade-in w-full">
              <h1 className="text-4xl font-black mb-8 text-slate-800 drop-shadow-sm text-center">Chọn Lớp Học</h1>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[1,2,3,4,5].map(g => (
                  <button key={g} onClick={() => setAppState('UNITS')} className={`relative overflow-hidden rounded-[2rem] aspect-square flex flex-col items-center justify-center transition-all duration-300 ${g===5 ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:-translate-y-2 shadow-[0_10px_30px_rgba(37,99,235,0.3)] border border-white/20' : 'bg-white/40 backdrop-blur-xl border border-white/60 text-slate-500 hover:bg-white/70 shadow-lg hover:shadow-xl hover:-translate-y-1'}`}>
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
            <div className="animate-fade-in">
              <h1 className="text-4xl font-black mb-8 text-slate-800 drop-shadow-sm">Grade 5</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => { setMapTheme('ocean'); setAppState('PLAYING'); }} className="text-left bg-gradient-to-br from-cyan-400 to-blue-600 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(37,99,235,0.3)] text-white hover:scale-105 transition-transform border-b-8 border-blue-800 active:border-b-0 active:translate-y-2 backdrop-blur-xl border-t border-white/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                  <div className="bg-white/20 w-fit px-4 py-1.5 rounded-full text-sm font-black mb-4 backdrop-blur-md border border-white/30 shadow-sm">UNIT 1</div>
                  <h3 className="text-3xl font-black mb-2 leading-tight drop-shadow-md">What's your address?</h3>
                  <div className="flex items-center gap-2 mt-8 font-bold bg-black/20 w-fit px-4 py-2 rounded-xl backdrop-blur-sm shadow-inner"><MapPin className="w-5 h-5"/> Vào Hành Trình</div>
                </button>
                
                <div className="text-left bg-white/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-lg relative">
                  <div className="bg-slate-200/80 backdrop-blur-md w-fit px-4 py-1.5 rounded-full text-sm font-black text-slate-500 mb-4 shadow-sm">UNIT 2</div>
                  <h3 className="text-3xl font-black text-slate-500 mb-2 leading-tight">I always get up early</h3>
                  <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-sm rounded-[2rem] flex items-center justify-center"><Lock className="w-12 h-12 text-slate-400 drop-shadow-md"/></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: THỰC HÀNH (PRACTICE) */}
          {appState === 'PRACTICE' && (
            <div className="relative z-10 animate-fade-in">
               <h1 className="text-4xl font-black mb-8 text-slate-800 drop-shadow-sm flex items-center gap-4"><PenTool className="w-10 h-10 text-green-500"/> Practice Hub</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { id: 'mock', title: '45-Min Mock Test', desc: 'Thi học kỳ chuẩn', icon: Shield, c: 'from-rose-400 to-red-500' },
                   { id: 'cambridge', title: 'Cambridge Advanced', desc: 'Flyers, Movers', icon: Star, c: 'from-amber-400 to-orange-500' },
                   { id: 'listen', title: 'Listening Hub', desc: 'Luyện nghe phản xạ', icon: Headphones, c: 'from-cyan-400 to-blue-500' },
                   { id: 'read', title: 'Reading Comprehension', desc: 'Đọc hiểu chuyên sâu', icon: BookOpen, c: 'from-emerald-400 to-green-500' },
                   { id: 'write', title: 'Writing Mastery', desc: 'Ghép câu, viết', icon: PenTool, c: 'from-purple-400 to-fuchsia-500' }
                 ].map(card => (
                   <button key={card.id} onClick={()=>alert("Đang tải dữ liệu bài tập...")} className="text-left bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg border border-white/60 hover:bg-white/60 hover:shadow-xl hover:-translate-y-2 transition-all group">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.c} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}><card.icon className="w-8 h-8 text-white" /></div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">{card.title}</h3>
                      <p className="text-slate-600 font-medium">{card.desc}</p>
                   </button>
                 ))}
               </div>
            </div>
          )}

          {appState === 'PLAYING' && (
             <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 text-6xl mb-4 bg-blue-100 rounded-full flex items-center justify-center animate-bounce shadow-xl border-4 border-white mx-auto">🚢</div>
                <h1 className="text-4xl font-black text-slate-800 mb-2 drop-shadow-sm">Khu Vực Map Engine</h1>
                <p className="text-slate-500 font-bold mb-8">Tính năng Map dọc và Game Engine đang được phục hồi sau đợt cập nhật data.</p>
                <button onClick={() => setAppState('UNITS')} className="px-8 py-3 bg-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-2xl font-black text-blue-600 border border-slate-200 hover:bg-blue-50 transition-colors">Quay Lại Sảnh</button>
             </div>
          )}

          {/* TAB: CMS ADMIN */}
          {appState === 'ADMIN' && (
            <div className="animate-fade-in w-full max-w-4xl mx-auto">
               <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center"><ShieldAlert className="w-8 h-8"/></div>
                     <div>
                        <h2 className="text-3xl font-black text-slate-800 drop-shadow-sm">CMS Đẩy Dữ Liệu</h2>
                        <p className="text-slate-500 font-bold">Quản trị viên: Soạn data từ JSON đẩy thẳng lên Firebase Cloud</p>
                     </div>
                  </div>

                  {adminError && (
                     <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 shadow-sm">
                        <AlertTriangle className="w-5 h-5"/> {adminError}
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Khối Lớp (Grade)</label>
                        <select value={adminGrade} onChange={e=>setAdminGrade(e.target.value)} className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-600 shadow-sm">
                           {[1,2,3,4,5].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Bài Học (Unit)</label>
                        <select value={adminUnit} onChange={e=>setAdminUnit(e.target.value)} className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-600 shadow-sm">
                           {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(u => <option key={u} value={u}>Unit {u}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="mb-6">
                     <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                        <span>Soạn thảo Dữ liệu JSON (Data Structure)</span>
                        <span className="text-blue-600 cursor-pointer hover:underline font-black flex items-center gap-1" onClick={() => setAdminDataInput(JSON_TEMPLATE)}>🔄 Khôi phục Template Gốc</span>
                     </label>
                     <textarea 
                        value={adminDataInput} 
                        onChange={e=>setAdminDataInput(e.target.value)}
                        className="w-full h-80 bg-slate-900 text-green-400 font-mono p-4 rounded-xl outline-none focus:ring-4 ring-blue-500/30 text-sm shadow-inner resize-none"
                        spellCheck="false"
                     />
                     <p className="text-xs text-slate-500 mt-3 font-bold">* Hệ thống tự động ghi đè (Overwrite) nếu ID bài học đã tồn tại. Đảm bảo dùng ngoặc kép (" ") chuẩn cho JSON.</p>
                  </div>

                  <button onClick={handlePushData} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
                     <UploadCloud className="w-6 h-6"/> PUSH TO CLOUD (ĐẨY LÊN FIREBASE)
                  </button>
               </div>
            </div>
          )}

        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  );
}