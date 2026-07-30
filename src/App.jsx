import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
MapPin, Star, Lock, ChevronLeft, CheckCircle2,
Zap, Users, Shield, Globe, Compass, Rocket, TreePine, Anchor,
Mail, Key, LogIn, LogOut, UserPlus, FileText
} from 'lucide-react';

// --- KẾT NỐI FIREBASE ---
import { auth, db } from './firebase';
import {
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
signOut,
onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// ==========================================
// 1. COMPONENT BẢN ĐỒ (Dành cho Học sinh)
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
onEnterStation(index, node); return;
}
setAnimatingTo(index);
shipPosRef.current = { x: node.x, y: node.y };
setTimeout(() => { setAnimatingTo(null); onEnterStation(index, node); }, 1200);
}
};

return (
<div className={relative w-full max-w-4xl h-[600px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-700 bg-gradient-to-t ${config.bg}}>

{config.nodes.map((node, i) => {
if (i === config.nodes.length - 1) return null;
const next = config.nodes[i + 1];
const isNextTarget = progress === i;
const isPassed = progress > i;
return <line key={i} x1={${node.x}%} y1={${node.y}%} x2={${next.x}%} y2={${next.y}%} stroke={isPassed ? "#4ade80" : isNextTarget ? "#fcd34d" : "rgba(255,255,255,0.2)"} strokeWidth="6" strokeDasharray="0 25" strokeLinecap="round" className={isNextTarget ? "animate-pulse" : ""} />
})}

<div className="absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-[1200ms] flex items-center justify-center pointer-events-none" style={{ left: ${shipPosRef.current.x}%, top: ${shipPosRef.current.y}% }}>
{config.ship}

{config.nodes.map((node, index) => {
const isUnlocked = index === 0 || progress >= index;
return (
<div key={index} onClick={() => handleNodeClick(index, node)} className={absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-20 ${isUnlocked ? 'cursor-pointer hover:scale-110' : 'opacity-40 grayscale cursor-not-allowed'} transition-all} style={{ left: ${node.x}%, top: ${node.y}% }}>

{node.v}
{progress > index && }
{!isUnlocked && }

<div className={mt-1 px-3 py-1 rounded-full text-white font-bold text-xs shadow-lg border ${isUnlocked ? 'bg-slate-900/80 border-white/30' : 'bg-slate-800/50 border-transparent'}}>{labels[index]}

);
})}

);
};

// ==========================================
// 2. TRANG ĐĂNG NHẬP / ĐĂNG KÝ
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
setError(''); setLoading(true);
try {
if (isLogin) {
await signInWithEmailAndPassword(auth, email, password);
} else {
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
// Lưu thông tin user mới vào Firestore
await setDoc(doc(db, "users", userCredential.user.uid), {
email: email,
role: "student", // Mặc định ai tạo nick cũng là Học sinh
progress: 0,
stars: 0,
createdAt: new Date()
});
}
navigate('/dashboard');
} catch (err) {
setError(err.message.includes('auth/') ? 'Tài khoản hoặc mật khẩu không chính xác.' : err.message);
}
setLoading(false);
};

return (






Global Explorer
{isLogin ? 'Đăng nhập để tiếp tục hành trình' : 'Tạo hồ sơ nhà thám hiểm mới'}


    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4">{error}</div>}

    <form onSubmit={handleAuth} className="space-y-4">
      <div>
        <label className="text-sm font-bold text-slate-700 block mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 font-medium" placeholder="nhathamhiem@gmail.com" />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 block mb-2">Mật khẩu</label>
        <div className="relative">
          <Key className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 font-medium" placeholder="••••••••" />
        </div>
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6">
        {loading ? 'Đang xử lý...' : isLogin ? <><LogIn className="w-5 h-5"/> Vào Game</> : <><UserPlus className="w-5 h-5"/> Tạo Tài Khoản</>}
      </button>
    </form>

    <div className="mt-6 text-center">
      <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 hover:text-blue-600 font-semibold text-sm">
        {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
      </button>
    </div>
  </div>
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
    @keyframes spin-slow { 100% { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  `}} />
</div>


);
};

// ==========================================
// 3. BẢNG ĐIỀU KHIỂN CHUNG (Sau đăng nhập)
// ==========================================
const Dashboard = ({ user, role }) => {
const navigate = useNavigate();
const [progress, setProgress] = useState(0);

const handleLogout = () => {
signOut(auth);
};

return (




Global Explorer


    <div className="flex items-center gap-3 sm:gap-4">
      {role === 'admin' && (
        <button onClick={() => navigate('/admin')} className="bg-red-100 text-red-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold flex items-center gap-1 sm:gap-2 hover:bg-red-200 transition-colors text-sm sm:text-base">
          <Shield className="w-4 h-4"/> <span className="hidden sm:inline">Vùng Admin</span>
        </button>
      )}
      <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
        <Star className="w-4 h-4 text-yellow-500 fill-current" /> <span className="font-bold text-yellow-700">0</span>
      </div>
      <button onClick={handleLogout} className="bg-slate-200 text-slate-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-2 transition-colors text-sm">
         Thoát <LogOut className="w-4 h-4"/>
      </button>
    </div>
  </header>

  <main className="flex-1 p-4 md:p-8">
    <div className="max-w-4xl mx-auto mb-8 text-center">
      <h2 className="text-3xl font-black mb-2 text-slate-800">Bản Đồ Học Tập</h2>
      <p className="text-slate-500 font-medium">Chào mừng {user.email}! Hãy bắt đầu hành trình.</p>
    </div>
    
    {/* Bản đồ đại dương mặc định, bạn có thể thêm logic chọn theme sau */}
    <VisualMap progress={progress} theme="ocean" onEnterStation={(i, node) => {
      alert(`Hệ thống đang chuẩn bị gọi Firebase lấy câu hỏi cho trạm: ${node.v}`);
      if (progress < 3) setProgress(p => p + 1);
    }} />
  </main>
</div>


);
};

// ==========================================
// 4. TRANG QUẢN TRỊ VIÊN (Giáo viên)
// ==========================================
const AdminPanel = () => {
const navigate = useNavigate();
return (



<button onClick={() => navigate('/dashboard')} className="p-2 bg-red-800 rounded-full hover:bg-red-700">
 Trung Tâm Chỉ Huy (Admin)





 Quản Lý Bài Học
Thêm, sửa, xóa các câu hỏi từ vựng và ngữ pháp. Nội dung được lưu bảo mật trên Firestore.
Thiết kế bài học mới


 Quản Lý Học Sinh
Xem tiến độ, điểm số và quản lý danh sách tài khoản học sinh trong lớp.
Xem danh sách lớp




);
};

// ==========================================
// 5. BỘ ĐỊNH TUYẾN & BẢO VỆ ROUTES (MAIN)
// ==========================================
export default function App() {
const [user, setUser] = useState(null);
const [role, setRole] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
// Lắng nghe trạng thái đăng nhập từ Firebase
const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
if (currentUser) {
setUser(currentUser);
try {
// Lấy quyền user từ DB Firestore
const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
if (userDoc.exists()) {
setRole(userDoc.data().role);
} else {
setRole('student'); // Mặc định nếu không tìm thấy
}
} catch (error) {
console.error("Lỗi lấy quyền:", error);
setRole('student');
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
return (


Đang kết nối vệ tinh Firebase...

);
}

return (


{/* Route gốc: Đã login thì văng vào Dashboard, chưa thì ở Login */}
<Route path="/" element={user ?  : } />

    {/* Route bảo vệ: Bắt buộc phải Login mới vào được Map */}
    <Route path="/dashboard" element={
      user ? <Dashboard user={user} role={role} /> : <Navigate to="/" replace />
    } />
    
    {/* Route Tuyệt Mật: Bắt buộc phải là Admin mới vào được */}
    <Route path="/admin" element={
      user && role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" replace />
    } />
  </Routes>
</BrowserRouter>


);
}