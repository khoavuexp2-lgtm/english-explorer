import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
MapPin, Star, Lock, ChevronLeft, CheckCircle2,
Zap, Users, Shield, Globe, Compass, Rocket, TreePine, Anchor,
Mail, Key, LogIn, LogOut, UserPlus
} from 'lucide-react';

// --- KẾT NỐI FIREBASE TỪ FILE CẤU HÌNH ---
// Đảm bảo bạn đã có file src/firebase.js như đã hướng dẫn
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
onEnterStation(index, node);
return;
}
setAnimatingTo(index);
shipPosRef.current = { x: node.x, y: node.y };
setTimeout(() => { setAnimatingTo(null); onEnterStation(index, node); }, 1200);
}
};

return (
<div className={relative w-full max-w-4xl h-[600px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-700 bg-gradient-to-t ${config.bg}}>
{/* Nét đứt nối trạm */}

{config.nodes.map((node, i) => {
if (i === config.nodes.length - 1) return null;
const next = config.nodes[i + 1];
const isNextTarget = progress === i;
const isPassed = progress > i;
return <line key={i} x1={${node.x}%} y1={${node.y}%} x2={${next.x}%} y2={${next.y}%} stroke={isPassed ? "#4ade80" : isNextTarget ? "#fcd34d" : "rgba(255,255,255,0.2)"} strokeWidth="6" strokeDasharray="0 25" strokeLinecap="round" className={isNextTarget ? "animate-pulse" : ""} />
})}


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
// 2. TRANG ĐĂNG NHẬP (Dùng Firebase Auth)
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
    // Lưu thông tin mặc định vào Firestore khi tạo nick mới
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      role: "student", // Mặc định là học sinh
      progress: 0,
      stars: 0,
      createdAt: new Date()
    });
  }
  navigate('/dashboard'); // Thành công thì chuyển vào bản đồ
} catch (err) {
  console.error(err);
  setError(err.message.includes('auth/') ? 'Tài khoản hoặc mật khẩu không chính xác.' : err.message);
}
setLoading(false);


};

return (






Global Explorer

{isLogin ? 'Đăng nhập để tiếp tục hành trình' : 'Tạo hồ sơ nhà thám hiểm mới'}



    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4 border border-red-100">{error}</div>}

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
      
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6 shadow-md">
        {loading ? 'Đang kết nối vệ tinh...' : isLogin ? <><LogIn className="w-5 h-5"/> Vào Game</> : <><UserPlus className="w-5 h-5"/> Tạo Tài Khoản</>}
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
// 3. TRANG BẢN ĐỒ CHÍNH (Dành cho user đã đăng nhập)
// ==========================================
const Dashboard = ({ user, role }) => {
const navigate = useNavigate();
// Giả lập tiến độ hiện tại, thực tế sẽ lấy từ Firestore
const [progress, setProgress] = useState(0);

const handleLogout = () => {
signOut(auth);
};

return (


 Global Explorer

    <div className="flex items-center gap-3 sm:gap-4">
      {/* Nút vào khu vực quản trị - CHỈ HIỆN KHI LÀ ADMIN */}
      {role === 'admin' && (
        <button onClick={() => navigate('/admin')} className="bg-red-100 text-red-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold flex items-center gap-1 sm:gap-2 hover:bg-red-200 transition-colors text-sm sm:text-base border border-red-200">
          <Shield className="w-4 h-4"/> <span className="hidden sm:inline">Vùng Admin</span>
        </button>
      )}
      
      <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-200">
        <Star className="w-4 h-4 text-yellow-500 fill-current" /> <span className="font-bold text-yellow-700">0</span>
      </div>
      
      <button onClick={handleLogout} className="bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors text-sm border border-slate-200">
         Thoát <LogOut className="w-4 h-4"/>
      </button>
    </div>
  </header>

  <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
    <div className="w-full relative">
      <VisualMap progress={progress} theme="ocean" onEnterStation={(index, node) => {
        alert(`Sắp tới chúng ta sẽ fetch bài học từ Firebase cho trạm: ${node.v}`); 
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
// 4. KHU VỰC QUẢN TRỊ (Dành cho Admin)
// ==========================================
const AdminPanel = () => {
const navigate = useNavigate();
return (



 Khu Vực Quản Trị Hệ Thống
<button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-slate-800 rounded-lg font-bold hover:bg-slate-700 flex items-center gap-2">
 Quay lại Bản đồ



    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Quản lý bài học</h3>
        <p className="text-slate-400 mb-4">Soạn thảo, thêm, sửa câu hỏi và đẩy trực tiếp lên Firestore mà học sinh không thể xem lén code.</p>
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold text-white w-full">Vào soạn giáo án</button>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Dữ liệu học sinh</h3>
        <p className="text-slate-400 mb-4">Xem tiến trình, điểm số và quản lý danh sách tài khoản của toàn bộ học sinh trong hệ thống.</p>
        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold text-white w-full">Xem danh sách lớp</button>
      </div>
    </div>
  </div>
</div>


);
};

// ==========================================
// 5. APP GỐC - ĐIỀU HƯỚNG BẢO MẬT (Router)
// ==========================================
export default function App() {
const [user, setUser] = useState(null);
const [role, setRole] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
// Trình theo dõi bảo mật: Luôn lắng nghe xem có ai đang đăng nhập không
const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
if (currentUser) {
setUser(currentUser);
try {
// Kéo thông tin Role (Quyền) từ Firestore xuống
const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
if (userDoc.exists()) {
setRole(userDoc.data().role);
} else {
setRole('student'); // An toàn: Không rõ thì cho làm học sinh
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

// Đang check Firebase thì hiện màn hình loading
if (loading) {
return (


Đang kết nối trạm không gian...

);
}

// Chia đường (Routing)
return (


{/* Route gốc: Nếu đã login thì đá văng vào Dashboard, chưa thì cho Login */}
<Route path="/" element={ user ?  :  } />

    {/* Route bảo vệ: Bắt buộc Login mới được vào Bản đồ */}
    <Route path="/dashboard" element={
      user ? <Dashboard user={user} role={role} /> : <Navigate to="/" replace />
    } />
    
    {/* Route tuyệt mật: Bắt buộc phải là Admin mới được vào */}
    <Route path="/admin" element={
      user && role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" replace />
    } />
  </Routes>
</BrowserRouter>


);
}