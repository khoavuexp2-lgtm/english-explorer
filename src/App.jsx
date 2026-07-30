import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  Map, Swords, Dumbbell, LineChart, LogOut, Loader2, Play, 
  Mic, Headphones, Flame, Heart, Lock, CheckCircle2, Star, 
  X, MessageSquare, ChevronRight, Trophy, Zap, Compass, Library, Shield,
  ShieldAlert, Ban, Unlock, UserCog, UserCheck
} from 'lucide-react';

// MOCK DATABASE & AUTHENTICATION (For Preview Purposes)
const mockAuth = {
  currentUser: null,
  signInWithGoogle: () => new Promise(resolve => {
    setTimeout(() => {
      mockAuth.currentUser = { 
        email: 'khoa.teacher@gmail.com', 
        displayName: 'Master Khoa',
        role: 'admin', // Cấp quyền Admin mặc định để test giao diện
        photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Khoa' 
      };
      resolve(mockAuth.currentUser);
    }, 1000);
  }),
  signOut: () => new Promise(resolve => {
    setTimeout(() => {
      mockAuth.currentUser = null;
      resolve();
    }, 500);
  })
};

const TopMetricsBar = ({ user }) => (
  <div className="flex items-center justify-between px-6 py-3 bg-white border-b-2 border-slate-100 sticky top-0 z-40">
    <div className="flex items-center gap-2">
      <Compass className="w-6 h-6 text-blue-600" />
      <span className="font-black text-xl text-slate-800 hidden sm:block">Global Explorer</span>
    </div>
    <div className="flex items-center gap-4">
      {/* Gamification Stats */}
      <div className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
        <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
        <span className="font-bold text-orange-600">12</span>
      </div>
      <div className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        <span className="font-bold text-yellow-600">450</span>
      </div>
      <div className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
        <span className="font-bold text-rose-600">5</span>
      </div>
      
      {/* User Profile */}
      <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
      <div className="hidden sm:flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-xl pr-3 transition-colors border-2 border-transparent hover:border-slate-100">
        <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-indigo-200 overflow-hidden shadow-sm">
          <img 
            src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.displayName || 'User'}`} 
            alt="Profile Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Explorer</span>
          <span className="text-sm font-black text-slate-700 leading-tight">{user?.displayName?.split(' ')[0] || 'Student'}</span>
        </div>
      </div>
    </div>
  </div>
);

const AIFeedbackModal = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">{title}</h3>
              <p className="text-indigo-100 font-medium text-sm">AI Tutor Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 bg-slate-50">
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Vietnamese Explanation
            </div>
            <p className="text-slate-700 font-medium leading-relaxed mt-2">
              Chào bạn! Trong bài tập này, bạn cần chú ý cấu trúc <strong className="text-indigo-600">"What is your address?"</strong>. 
              Từ "address" đi kèm với giới từ "at" khi nói về địa chỉ số nhà cụ thể (ví dụ: at 123 Main Street), nhưng dùng "in" khi nói về tên đường hoặc thành phố (ví dụ: in London).
              Hãy ghi nhớ mẹo này cho bài kiểm tra sắp tới nhé!
            </p>
          </div>
          <button onClick={onClose} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-md active:scale-95">
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

const ClassesTab = () => {
  const navigate = useNavigate();
  // Configured Grades: 1 & 5 are open. 2, 3, 4 are locked.
  const classes = [
    { id: 'g1', name: "Grade 1", desc: "Starter Phonics", locked: false, color: "text-rose-500", bg: "bg-rose-500", light: "bg-rose-50", hover: "hover:border-rose-500", icon: Zap },
    { id: 'g2', name: "Grade 2", desc: "Junior Explorer", locked: true, color: "text-orange-500", bg: "bg-orange-500", light: "bg-orange-50", hover: "hover:border-orange-500", icon: Star },
    { id: 'g3', name: "Grade 3", desc: "Beginner Explorer", locked: true, color: "text-blue-500", bg: "bg-blue-500", light: "bg-blue-50", hover: "hover:border-blue-500", icon: Library },
    { id: 'g4', name: "Grade 4", desc: "Intermediate Adventurer", locked: true, color: "text-green-500", bg: "bg-green-500", light: "bg-green-50", hover: "hover:border-green-500", icon: Map },
    { id: 'g5', name: "Grade 5", desc: "Advanced Master", locked: false, color: "text-purple-500", bg: "bg-purple-500", light: "bg-purple-50", hover: "hover:border-purple-500", icon: Compass },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="mb-10 text-center md:text-left pt-6">
        <h2 className="text-3xl font-black text-slate-800">My Classes</h2>
        <p className="text-slate-500 font-bold mt-2 text-lg">Select your grade to start learning</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => (
          <div 
            key={cls.id} 
            onClick={() => !cls.locked && navigate('/explore')} 
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col justify-between h-56 shadow-sm group relative overflow-hidden
            ${cls.locked ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : `bg-white border-slate-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${cls.hover}`}`}
          >
            {/* Lock Overlay for locked classes */}
            {cls.locked && (
              <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[2rem]">
                <div className="bg-white/80 p-3 rounded-2xl shadow-sm border border-slate-200">
                  <Lock className="w-6 h-6 text-slate-400" />
                </div>
              </div>
            )}
            
            <div className={cls.locked ? 'opacity-50' : 'opacity-100'}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${cls.light} ${cls.color} group-hover:scale-110 transition-transform duration-300`}>
                <cls.icon className="w-7 h-7" />
              </div>
              <h3 className="font-black text-2xl text-slate-800">{cls.name}</h3>
              <p className="text-slate-500 font-medium text-sm mt-2">{cls.desc}</p>
            </div>
            
            {!cls.locked && (
              <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-400">
                <span>In Progress</span>
                <ChevronRight className={`w-5 h-5 ${cls.color}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ExploreTab = () => {
  // Reconfigured to represent lessons inside Grade 5 - Unit 1
  const mapNodes = [
    { id: 1, title: "Vocabulary", desc: "My Address", type: "start", completed: true },
    { id: 2, title: "Grammar", desc: "Where do you live?", type: "lesson", completed: true },
    { id: 3, title: "Listening", desc: "City vs Village", type: "lesson", completed: false, current: true },
    { id: 4, title: "Speaking", desc: "Pronunciation", type: "chest", completed: false },
    { id: 5, title: "Final Boss", desc: "Unit 1 Test", type: "boss", completed: false }
  ];

  return (
    <div className="max-w-md mx-auto flex flex-col items-center py-8 pb-32">
      <div className="w-full px-6 mb-12 text-center">
        <span className="text-purple-600 font-bold uppercase tracking-wider text-sm mb-2 block">Grade 5 • Semester 1</span>
        <h2 className="text-3xl font-black text-slate-800">Unit 1: What's your address?</h2>
      </div>
      
      <div className="relative w-full flex flex-col items-center gap-10">
        <div className="absolute top-0 bottom-0 w-4 bg-slate-200 rounded-full -z-10"></div>
        <div className="absolute top-0 bottom-1/2 w-4 bg-green-400 rounded-full -z-10"></div>
        
        {mapNodes.map((node, i) => {
          const isOffset = i % 2 !== 0;
          return (
            <div key={node.id} className={`relative w-full flex justify-center ${isOffset ? 'pr-24' : 'pl-24'}`}>
              
              {/* Floating label for current node */}
              {node.current && (
                <div className={`absolute -top-6 ${isOffset ? 'right-12' : 'left-12'} bg-white border-2 border-blue-400 text-blue-600 font-bold px-4 py-1.5 rounded-xl shadow-sm z-20 animate-bounce`}>
                  Start
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-blue-400 rotate-45"></div>
                </div>
              )}

              <button className={`
                relative w-24 h-24 rounded-full border-b-8 flex flex-col items-center justify-center transition-transform hover:scale-105 z-10
                ${node.completed ? 'bg-green-400 border-green-500 text-white' : 
                  node.current ? 'bg-blue-400 border-blue-500 text-white ring-4 ring-blue-100' : 
                  'bg-slate-200 border-slate-300 text-slate-400'}
              `}>
                {node.completed ? <CheckCircle2 className="w-8 h-8" /> : 
                 node.type === 'chest' ? <Trophy className="w-8 h-8" /> : 
                 node.type === 'boss' ? <Shield className="w-8 h-8" /> : 
                 <Star className="w-8 h-8" />}
                 <span className="text-[10px] font-black uppercase mt-1 px-2 text-center leading-tight">{node.title}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PracticeTab = () => {
  const [modalData, setModalData] = useState(null);
  const handlePractice = (title) => setModalData({ isOpen: true, title });

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <h2 className="text-3xl font-black text-slate-800 mb-8 pt-6">Practice Hub</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onClick={() => handlePractice('Listening Pro')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-400 cursor-pointer transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4"><Headphones className="w-8 h-8 text-purple-600" /></div>
          <h3 className="text-xl font-black text-slate-800">Listening Pro</h3>
          <p className="text-slate-500 font-medium mt-1">Train your ears with native speakers. Auto-generated by AI.</p>
        </div>
        <div onClick={() => handlePractice('Speaking Master')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-400 cursor-pointer transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4"><Mic className="w-8 h-8 text-blue-600" /></div>
          <h3 className="text-xl font-black text-slate-800">Speaking Master</h3>
          <p className="text-slate-500 font-medium mt-1">Get instant pronunciation feedback from Gemini.</p>
        </div>
      </div>
      <AIFeedbackModal isOpen={modalData?.isOpen} onClose={() => setModalData(null)} title={modalData?.title} />
    </div>
  );
};

const ArenaTab = () => (
  <div className="max-w-2xl mx-auto text-center py-12 pb-24">
    <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
      <Swords className="w-16 h-16 text-indigo-600" />
    </div>
    <h2 className="text-4xl font-black text-slate-800 mb-4">Multiplayer Arena</h2>
    <p className="text-slate-500 font-bold mb-10 text-lg">Enter a PIN to join your classmates in a live AI battle!</p>
    <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-slate-100 max-w-sm mx-auto">
      <input type="text" placeholder="GAME PIN" className="w-full text-center text-3xl font-black tracking-widest p-4 bg-slate-100 rounded-2xl outline-none border-4 border-transparent focus:border-indigo-400 mb-6 transition-colors uppercase" maxLength={6} />
      <button className="w-full bg-slate-900 hover:bg-black text-white font-black text-xl py-4 rounded-2xl shadow-lg hover:-translate-y-1 transition-all">JOIN NOW</button>
      <div className="mt-4 pt-4 border-t-2 border-slate-100">
        <button className="text-indigo-600 font-bold text-sm hover:underline">Or create a new room as Host</button>
      </div>
    </div>
  </div>
);

const AdminTab = () => {
  // Dữ liệu giả lập - Sau này sẽ Fetch từ Firebase Firestore
  const [users, setUsers] = useState([
    { id: 1, name: "Thầy Khoa", email: "khoa.teacher@gmail.com", role: "admin", status: "active", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Khoa" },
    { id: 2, name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", role: "student", status: "active", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=A" },
    { id: 3, name: "Trần Thị B", email: "tranthib@gmail.com", role: "student", status: "blocked", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=B" },
  ]);

  const toggleRole = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: u.role === 'admin' ? 'student' : 'admin' } : u));
  };

  const toggleBlock = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u));
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="mb-8 pt-6 flex items-center gap-4">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">Admin Control Panel</h2>
          <p className="text-slate-500 font-bold mt-1">Manage users, roles, and platform access.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100">
                <th className="p-5 font-black text-slate-400 uppercase tracking-wider text-sm">User Details</th>
                <th className="p-5 font-black text-slate-400 uppercase tracking-wider text-sm">System Role</th>
                <th className="p-5 font-black text-slate-400 uppercase tracking-wider text-sm">Account Status</th>
                <th className="p-5 font-black text-slate-400 uppercase tracking-wider text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-100 p-1" />
                      <div>
                        <p className="font-black text-slate-800 text-lg">{user.name}</p>
                        <p className="text-sm font-bold text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                      {user.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => toggleRole(user.id)} className={`flex-1 py-2 px-3 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-1.5 ${user.role === 'admin' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
                        <UserCog className="w-4 h-4" /> {user.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button onClick={() => toggleBlock(user.id)} className={`flex-1 py-2 px-3 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-1.5 ${user.status === 'blocked' ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}>
                        {user.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />} {user.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProgressTab = () => (
  <div className="max-w-4xl mx-auto pb-24">
    <h2 className="text-3xl font-black text-slate-800 mb-8 pt-6">My Progress</h2>
    <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 text-center">
      <LineChart className="w-20 h-20 text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-black text-slate-700">Analytics Dashboard</h3>
      <p className="text-slate-500 font-medium">Coming soon. Track your AI scores here.</p>
    </div>
  </div>
);

const MainLayout = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'classes', label: "Classes", icon: Library, path: '/classes', color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'explore', label: "Learn", icon: Map, path: '/explore', color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'practice', label: "Practice", icon: Dumbbell, path: '/practice', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'arena', label: "Arena", icon: Swords, path: '/arena', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'progress', label: "Profile", icon: LineChart, path: '/progress', color: 'text-orange-500', bg: 'bg-orange-50' }
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: "Admin", icon: ShieldAlert, path: '/admin', color: 'text-rose-600', bg: 'bg-rose-100' });
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r-2 border-slate-100 p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate('/classes')}>
          <Compass className="w-10 h-10 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Explorer</h1>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map(item => {
            const isActive = location.pathname.includes(item.path);
            return (
              <button key={item.id} onClick={() => navigate(item.path)} className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-lg transition-all border-2 ${isActive ? `border-slate-200 ${item.bg} ${item.color}` : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
                <item.icon className={`w-6 h-6 ${isActive ? item.color : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
          <LogOut className="w-6 h-6" /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto overflow-x-hidden">
        <TopMetricsBar user={user} />
        <div className="p-4 md:p-8 w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/classes" replace />} />
            <Route path="/classes" element={<ClassesTab />} />
            <Route path="/explore" element={<ExploreTab />} />
            <Route path="/practice" element={<PracticeTab />} />
            <Route path="/arena" element={<ArenaTab />} />
            <Route path="/progress" element={<ProgressTab />} />
            {user?.role === 'admin' && <Route path="/admin" element={<AdminTab />} />}
          </Routes>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-100 flex justify-around p-3 pb-safe z-50">
        {navItems.map(item => {
          const isActive = location.pathname.includes(item.path);
          return (
            <button key={item.id} onClick={() => navigate(item.path)} className={`flex flex-col items-center p-2 rounded-xl min-w-[4rem] ${isActive ? item.bg : 'bg-transparent'}`}>
              <item.icon className={`w-7 h-7 mb-1 ${isActive ? item.color : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold ${isActive ? item.color : 'text-slate-500'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const mockUser = await mockAuth.signInWithGoogle();
    setUser(mockUser);
    setLoading(false);
  };

  const handleLogout = async () => {
    await mockAuth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 text-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-8 shadow-xl flex items-center justify-center transform rotate-12">
            <Compass className="w-12 h-12 text-white -rotate-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Ready to Explore?</h1>
          <p className="text-slate-500 font-medium mb-10">Sign in to continue your English learning journey.</p>
          
          <button onClick={handleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white font-black text-lg py-4 px-6 rounded-2xl transition-all shadow-lg hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <svg className="w-6 h-6 bg-white rounded-full p-1" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <MainLayout user={user} handleLogout={handleLogout} />
    </BrowserRouter>
  );
}