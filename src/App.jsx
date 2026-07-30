import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, Shield,
  Zap, Users, Globe, Compass, Rocket, TreePine, Anchor,
  LogOut, LayoutDashboard, Swords, Dumbbell, GraduationCap, 
  BarChart3, Settings, Mic, PlayCircle, Trophy, Volume2, 
  X, RefreshCw, UserCheck, UserX, Crown
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs } from "firebase/firestore";

// --- CẤU HÌNH BẢO MẬT ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Lỗi cấu hình Firebase, chạy chế độ Offline.");
}

// 👑 ĐIỀN DANH SÁCH EMAIL SUPER ADMIN VÀO ĐÂY (Cách nhau bằng dấu phẩy)
const SUPER_ADMIN_EMAILS = [
  "khoavuexp@gmail.com", 
  "khoavuexp2@gmail.com"
];

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const callGemini = async (prompt, isJson = false) => {
  if (!GEMINI_API_KEY) return isJson ? null : "[Offline Mode] Thiếu API Key.";
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
      window.speechSynthesis.speak(utterance);
    }
  }
};

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl ${className}`}>{children}</div>
);

// Menu Trái
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
    <div className="w-24 md:w-64 h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-50 shadow-2xl">
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Globe className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <h1 className="font-black text-xl text-white hidden md:block tracking-wide">Explorer<span className="text-blue-500">Pro</span></h1>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden">
        {navs.map(n => {
          const active = location.pathname.includes(n.path);
          return (
            <a key={n.path} href={n.path} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}>
              <n.icon className={`w-6 h-6 flex-shrink-0 ${active ? 'animate-bounce-short' : ''}`} />
              <span className="font-bold hidden md:block">{n.label}</span>
            </a>
          );
        })}
        
        {/* NÚT DÀNH RIÊNG CHO ADMIN */}
        {role === 'admin' && (
          <a href="/admin" className="flex items-center gap-4 p-3 rounded-2xl text-rose-400 hover:bg-rose-950 mt-4 border border-rose-900/50">
            <Shield className="w-6 h-6 flex-shrink-0" /><span className="font-bold hidden md:block">Vùng Quản Trị</span>
          </a>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <img src={user?.photoURL || "https://ui-avatars.com/api/?name=User"} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-slate-700" />
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.displayName || user?.email}</p>
            <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5"><Star className="w-3 h-3 fill-current"/> {stars} Sao</div>
          </div>
        </div>
        <button onClick={() => signOut(auth)} className="flex items-center justify-center gap-2 w-full p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors text-slate-300 hover:text-white">
          <LogOut className="w-4 h-4"/><span className="hidden md:block">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsersList(usersData);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId, currentRole, email) => {
    // Không cho phép tước quyền của nhóm Super Admin
    if (SUPER_ADMIN_EMAILS.includes(email)) {
      alert("Không thể thay đổi quyền của Super Admin!");
      return;
    }
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      alert("Lỗi khi thay đổi quyền. Đảm bảo Firestore Rules cho phép.");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-rose-100 rounded-2xl"><Shield className="w-8 h-8 text-rose-600" /></div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">Quản Trị Hệ Thống</h2>
          <p className="text-slate-500 font-medium">Kiểm soát người dùng và cấp quyền Giáo viên</p>
        </div>
      </div>

      <GlassCard className="flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/50">
          <h3 className="text-xl font-bold text-slate-800">Danh sách Người dùng</h3>
          <button onClick={fetchUsers} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"><RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
        
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b">
              <tr>
                <th className="p-4 font-bold text-slate-600 text-sm uppercase">Học sinh</th>
                <th className="p-4 font-bold text-slate-600 text-sm uppercase">Email</th>
                <th className="p-4 font-bold text-slate-600 text-sm uppercase">Điểm (Sao)</th>
                <th className="p-4 font-bold text-slate-600 text-sm uppercase">Vai trò</th>
                <th className="p-4 font-bold text-slate-600 text-sm uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.email}`} className="w-10 h-10 rounded-full" alt="Avatar"/>
                    <span className="font-bold text-slate-800">{u.name || "Nhà thám hiểm"}</span>
                  </td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4 font-bold text-amber-500"><Star className="w-4 h-4 inline mr-1 -mt-1"/>{u.stars || 0}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'admin' ? 'Giáo viên (Admin)' : 'Học sinh'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleRole(u.id, u.role, u.email)}
                      className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ml-auto ${u.role === 'admin' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md'}`}
                    >
                      {u.role === 'admin' ? <><UserX className="w-4 h-4"/> Rút quyền</> : <><Crown className="w-4 h-4"/> Phong Admin</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usersList.length === 0 && !loading && <div className="p-8 text-center text-slate-500">Chưa có ai đăng nhập vào hệ thống.</div>}
        </div>
      </GlassCard>
    </div>
  );
};

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    if (!auth) return setError("Hệ thống Offline: Không có kết nối Firebase.");
    setLoading(true); setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Xử lý tạo mới hoặc cập nhật Role trong Database
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let role = 'student';
      // Super Admin: Luôn tự động ép quyền thành Admin nếu email có trong danh sách
      if (SUPER_ADMIN_EMAILS.includes(user.email)) role = 'admin';

      if (!userSnap.exists()) {
        // Tạo hồ sơ mới lần đầu đăng nhập
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          role: role,
          stars: 0,
          progress: 0,
          createdAt: new Date()
        });
      } else {
        // Nếu là Super Admin nhưng lỡ bị sửa quyền, ép lại thành admin
        if (SUPER_ADMIN_EMAILS.includes(user.email) && userSnap.data().role !== 'admin') {
          await updateDoc(userRef, { role: 'admin' });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background động */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="z-10 text-center mb-10">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 shadow-2xl flex items-center justify-center transform rotate-12">
          <Rocket className="w-12 h-12 text-white -rotate-12" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Explorer</span></h1>
        <p className="text-slate-400 font-medium text-lg max-w-md mx-auto">Nền tảng học Tiếng Anh thông minh tích hợp AI dành cho thế hệ Alpha.</p>
      </div>

      <GlassCard className="z-10 w-full max-w-md p-8 border-slate-700 bg-slate-900/60">
        {error && <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-sm font-bold mb-6 text-center">{error}</div>}
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading} 
          className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-lg py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 group"
        >
          {loading ? <RefreshCw className="w-6 h-6 animate-spin"/> : (
            <>
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                <path fill="none" d="M1 1h22v22H1z"/>
              </svg>
              Tiếp tục với Google
            </>
          )}
        </button>
        <p className="text-slate-500 text-xs text-center mt-6">Không cần đăng ký, sử dụng ngay tài khoản Google của bạn.</p>
      </GlassCard>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return setLoading(false);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Nghe thay đổi dữ liệu User thời gian thực
        const uDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (uDoc.exists()) setUserData(uDoc.data());
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
      <p className="text-blue-500 font-bold animate-pulse">Đang nạp dữ liệu vũ trụ...</p>
    </div>
  );

  return (
    <BrowserRouter>
      {/* Khai báo style CSS cho Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15%); } }
        .animate-bounce-short { animation: bounce-short 1s ease-in-out infinite; }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />

      <Routes>
        <Route path="/" element={user ? <Navigate to="/explore" replace /> : <LoginPage />} />
        
        {/* Layout Chính sau khi đăng nhập */}
        <Route path="/*" element={
          user && userData ? (
            <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
              <Sidebar user={user} role={userData.role} stars={userData.stars} />
              
              <main className="flex-1 h-full overflow-y-auto bg-slate-100 relative">
                <Routes>
                  {/* Bản đồ gốc của bạn nằm ở đây */}
                  <Route path="/explore" element={
                    <div className="p-8 text-center mt-20">
                      <Compass className="w-20 h-20 mx-auto text-blue-500 animate-bounce-short"/>
                      <h2 className="text-3xl font-black text-slate-800 mt-4">Khu vực Bản Đồ RPG</h2>
                      <p className="text-slate-500 mt-2">Dữ liệu bản đồ đã sẵn sàng tích hợp AI sinh câu hỏi.</p>
                    </div>
                  } />
                  
                  {/* Khu vực Admin - Đã khóa cửa bảo vệ */}
                  <Route path="/admin" element={
                    userData.role === 'admin' ? <AdminPage /> : <Navigate to="/explore" />
                  } />

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