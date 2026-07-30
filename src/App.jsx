import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, 
  Zap, Users, Shield, Globe, Compass, Rocket, TreePine, Anchor,
  Mail, Key, LogIn, UserPlus, LogOut
} from 'lucide-react';

// --- KẾT NỐI FIREBASE TỪ FILE CẤU HÌNH BẠN ĐÃ TẠO ---
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// ==========================================
// 1. COMPONENT BẢN ĐỒ (Đã sửa triệt để lỗi dòng 52)
// ==========================================
const VisualMap = ({ progress, onEnterStation, theme }) => {
  const mapConfig = {
    ocean: { bg: "from-[#112240] to-[#233554]", ship: "🚢", nodes: [{x:20,y:80, v:"🏝️"},{x:50,y:65, v:"🪸"},{x:80,y:45, v:"⛵"},{x:40,y:15, v:"🐙"}] },
    desert: { bg: "from-[#8c5900] to-[#cfa144]", ship: "🐪", nodes: [{x:20,y:80, v:"🏜️"},{x:50,y:65, v:"⛺"},{x:80,y:45, v:"🌵"},{x:40,y:15, v:"🦂"}] },
    forest: { bg: "from-[#1a4a1a] to-[#2d6a2d]", ship: "🚙", nodes: [{x:20,y:80, v:"🌲"},{x:50,y:65, v:"🛖"},{x:80,y:45, v:"🍄"},{x:40,y:15, v:"🐻"}] },
    space: { bg: "from-[#161638] to-[#2a2a5a]", ship: "🚀", nodes: [{x:20,y:80, v:"🪐"},{x:50,y:65, v:"☄️"},{x:80,y:45, v:"🛰️"},{x:40,y:15, v:"👽"}] }
  };
  const config = mapConfig[theme] || mapConfig.ocean;
  
  const initialValidNode = Math.min(progress, config.nodes.length - 1);
  const shipPosRef = useRef({ x: config.nodes[initialValidNode].x, y: config.nodes[initialValidNode].y });
  const [animatingTo, setAnimatingTo] = useState(null);
  
  const labels = ["Từ Vựng", "Thử Thách", "Ngữ Pháp", "Boss Cuối"];

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
    // ĐÂY LÀ DÒNG 52 ĐÃ ĐƯỢC CHUẨN HÓA CÚ PHÁP BACKTICK (DẤU NHÁY NGƯỢC)
    <div className={`relative w-full max-w-4xl h-[600px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-700 bg-gradient-to-t ${config.bg}`}>
      
      {/* Nét đứt nối trạm */}
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

// ==========================================
// 2. TRANG ĐĂNG NHẬP (Bảo mật Firebase)
// ==========================================
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Lưu data mặc định khi tạo nick mới
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          role: "student", // Mặc định ai cũng là học sinh
          progress: 0,
          stars: 0,
          createdAt: new Date()
        });
      }
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      setError("Tài khoản hoặc mật khẩu không chính xác.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 shadow-lg flex items-center justify-center">
            <Globe className="w-10 h-10 text-white animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Global Explorer</h1>
          <p className="text-slate-500 text-sm font-medium">
            {isLogin ? 'Đăng nhập để vào bản đồ học tập' : 'Tạo hồ sơ nhà thám hiểm mới'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500" placeholder="hocsinh@gmail.com" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Mật khẩu</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6">
            {loading ? 'Đang kết nối...' : isLogin ? <><LogIn className="w-5 h-5"/> Vào Game</> : <><UserPlus className="w-5 h-5"/> Đăng ký</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 hover:text-blue-600 font-semibold text-sm">
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. TRANG DASHBOARD CHÍNH (Chỉ thấy khi đăng nhập)
// ==========================================
const Dashboard = ({ role }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0); 

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-white p-4 shadow-sm flex justify-between items-center z-50 sticky top-0 border-b border-slate-200">
        <h1 className="text-xl font-black text-blue-900 flex items-center gap-2"><Compass className="w-5 h-5"/> Global Explorer</h1>
        
        <div className="flex items-center gap-3">
          {/* NÚT VÀO VÙNG ADMIN - CHỈ HIỆN KHI CÓ QUYỀN */}
          {role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-red-200 text-sm">
              <Shield className="w-4 h-4"/> Admin
            </button>
          )}
          
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full"><Star className="w-4 h-4 text-yellow-500 fill-current" /> <span className="font-bold text-yellow-700">0</span></div>
          <button onClick={() => signOut(auth)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-slate-200">
            Thoát <LogOut className="w-4 h-4"/>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full relative">
          <VisualMap progress={progress} theme="space" onEnterStation={(index, node) => {
            alert(`Sắp tới sẽ gọi Firebase lấy câu hỏi cho trạm: ${node.v}`); 
            if (progress < 3) setProgress(p => p + 1);
          }} />
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-short { animation: bounce-short 1.5s ease-in-out infinite; }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  );
};

// ==========================================
// 4. KHU VỰC ADMIN
// ==========================================
const AdminPanel = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 flex flex-col items-center justify-center">
      <Shield className="w-20 h-20 text-red-500 mb-6" />
      <h1 className="text-4xl font-black text-white mb-4">Vùng Quản Trị Tuyệt Mật</h1>
      <p className="text-slate-400 mb-8">Nơi giáo viên soạn bài và xem điểm học sinh (Sẽ xây dựng tiếp sau khi Vercel lên sóng).</p>
      <button onClick={() => navigate('/dashboard')} className="bg-blue-600 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 hover:bg-blue-700">
        <ChevronLeft /> Về lại Bản đồ
      </button>
    </div>
  );
};

// ==========================================
// 5. BỘ ĐIỀU HƯỚNG TỔNG (ROUTER)
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) setRole(userDoc.data().role);
        } catch (e) {
          console.error("Lỗi lấy quyền:", e);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen bg-slate-100 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ user ? <Navigate to="/dashboard" replace /> : <LoginPage /> } />
        <Route path="/dashboard" element={ user ? <Dashboard role={role} /> : <Navigate to="/" replace /> } />
        <Route path="/admin" element={ user && role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" replace /> } />
      </Routes>
    </BrowserRouter>
  );
}