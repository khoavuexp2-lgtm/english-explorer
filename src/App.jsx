import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
Map, Swords, Dumbbell, GraduationCap, LineChart,
ShieldAlert, LogOut, Loader2, Sparkles, Play,
Mic, Headphones, Flame, Heart, Hexagon, Lock,
CheckCircle2, Star, X, MessageSquare
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

// SETUP YOUR SUPER ADMIN EMAILS HERE
const SUPER_ADMIN_EMAILS = ["khoavuexp@gmail.com", "admin2@gmail.com"];

// ==========================================
// 1. REUSABLE UI COMPONENTS (EdTech Style)
// ==========================================

// Top Bar with Gamification Metrics (Streaks, Lives, Gems)
const TopMetricsBar = () => (

// Simulated AI Feedback Modal (Demonstrating English UI + Vietnamese Explanation)
const AIFeedbackModal = ({ isOpen, onClose, title }) => {
if (!isOpen) return null;
return (



 AI Tutor Feedback




Exercise
{title}


      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 relative">
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm"><MessageSquare className="w-4 h-4 text-white"/></div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 block">Giải thích từ AI (Vietnamese)</span>
        <p className="text-slate-700 text-sm leading-relaxed">
          Bạn phát âm từ <strong className="text-amber-600">"Environment"</strong> hơi giống "En-vi-ron-men". 
          <br/><br/>
          <strong>Mẹo nhỏ:</strong> Trọng âm rơi vào âm tiết thứ 2 <em>/ɪnˈvaɪ.rən.mənt/</em>. Bạn hãy thử nhấn mạnh vào chữ <strong>"vai"</strong> và đọc lướt các âm còn lại nhé!
        </p>
      </div>
      
      <button onClick={onClose} className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-colors">
        Got it, thanks!
      </button>
    </div>
  </div>
</div>


);
};

// ==========================================
// 2. MAIN TABS
// ==========================================

const ExploreTab = () => {
const mapNodes = [
{ id: 1, title: "Basics 1", type: "vocab", status: "completed", icon: "🌟" },
{ id: 2, title: "Phrases", type: "grammar", status: "completed", icon: "🗣️" },
{ id: 3, title: "Food", type: "vocab", status: "current", icon: "🍔" },
{ id: 4, title: "Animals", type: "vocab", status: "locked", icon: "🦁" },
{ id: 5, title: "Checkpoint", type: "boss", status: "locked", icon: "🏰" },
];

return (



Unit 1: The Beginning
Build your foundation



  {/* Vertical Path Map */}
  <div className="relative w-full flex flex-col items-center gap-8 px-4">
    {mapNodes.map((node, index) => {
      // Calculate zigzag position
      const isLeft = index % 2 === 0;
      const translateX = isLeft ? '-translate-x-12' : 'translate-x-12';
      
      let bgColor = "bg-slate-200";
      let shadow = "";
      let textColor = "text-slate-400";
      
      if (node.status === "completed") {
        bgColor = "bg-green-500";
        shadow = "shadow-[0_8px_0_rgb(22,163,74)] active:shadow-[0_0px_0_rgb(22,163,74)] active:translate-y-2";
        textColor = "text-white";
      } else if (node.status === "current") {
        bgColor = "bg-blue-500";
        shadow = "shadow-[0_8px_0_rgb(37,99,235)] active:shadow-[0_0px_0_rgb(37,99,235)] active:translate-y-2 ring-4 ring-blue-200 animate-pulse-slow";
        textColor = "text-white";
      }

      return (
        <div key={node.id} className={`relative flex flex-col items-center transform ${translateX} w-24 z-10`}>
          {/* Node Button */}
          <button className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${bgColor} ${shadow}`}>
            {node.status === "locked" ? <Lock className="w-8 h-8 text-slate-400" /> : 
             node.status === "completed" ? <CheckCircle2 className="w-10 h-10 text-white" /> : 
             node.icon}
          </button>
          {/* Floating Label */}
          <div className={`absolute -bottom-6 font-bold text-sm bg-white/80 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-200 shadow-sm ${node.status === 'current' ? 'text-blue-600' : 'text-slate-500'}`}>
            {node.title}
          </div>
        </div>
      );
    })}

    {/* Connecting SVG Path (Background) */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{top: '40px', left: '0'}}>
      <path d="M 50% 0 Q 30% 60, 50% 120 T 50% 240 Q 70% 300, 50% 360" fill="transparent" stroke="#e2e8f0" strokeWidth="15" strokeLinecap="round" />
    </svg>
  </div>
</div>


);
};

const PracticeTab = () => {
const [showFeedback, setShowFeedback] = useState(false);
const [activeTask, setActiveTask] = useState("");

const handleStartTask = (taskName) => {
setActiveTask(taskName);
// Simulate completing a task and getting AI feedback
setTimeout(() => setShowFeedback(true), 800);
};

return (

Training Camp
Targeted exercises powered by AI

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all group flex flex-col justify-between">
      <div>
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Headphones className="w-8 h-8" /></div>
        <h3 className="font-bold text-xl mb-2 text-slate-800">Listening</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">AI generates natural audio. Listen and answer comprehension questions.</p>
      </div>
      <button onClick={() => handleStartTask("Listening Practice")} className="w-full py-4 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 rounded-2xl font-bold transition-colors">Start Session</button>
    </div>

    <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-purple-200 hover:shadow-xl transition-all group flex flex-col justify-between">
      <div>
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Mic className="w-8 h-8" /></div>
        <h3 className="font-bold text-xl mb-2 text-slate-800">Speaking</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">Record your voice. AI analyzes your pronunciation and fluency instantly.</p>
      </div>
      <button onClick={() => handleStartTask("Speaking Practice")} className="w-full py-4 bg-purple-50 hover:bg-purple-500 hover:text-white text-purple-600 rounded-2xl font-bold transition-colors">Start Speaking</button>
    </div>

    <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group flex flex-col justify-between">
      <div>
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Sparkles className="w-8 h-8" /></div>
        <h3 className="font-bold text-xl mb-2 text-slate-800">Word Blocks</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">Tap to build sentences. Master grammar structure visually.</p>
      </div>
      <button onClick={() => handleStartTask("Grammar Blocks")} className="w-full py-4 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-2xl font-bold transition-colors">Build Sentences</button>
    </div>
  </div>

  <AIFeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} title={activeTask} />
</div>


);
};

const ArenaTab = () => (

<h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Battle Arena</h2>
<p className="text-slate-500 mb-10 max-w-sm text-lg">Join a live room or create your own AI-generated challenge.</p>

<div className="bg-white p-3 rounded-3xl shadow-lg flex items-center gap-2 border border-slate-200 w-full max-w-sm focus-within:ring-4 ring-indigo-100 transition-all">
  <input type="text" placeholder="Game PIN" className="flex-1 bg-transparent px-4 py-3 outline-none font-black text-center tracking-[0.3em] text-2xl uppercase text-slate-700 placeholder-slate-300" maxLength={6} />
  <button className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform active:scale-95">
    <Play className="fill-current w-6 h-6" />
  </button>
</div>

<div className="mt-10 flex items-center gap-4 text-slate-400 font-bold text-sm">
  <div className="h-px bg-slate-200 w-16"></div>
  OR
  <div className="h-px bg-slate-200 w-16"></div>
</div>

<button className="mt-6 bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold py-3 px-8 rounded-2xl transition-colors">
  Host a Match
</button>


const ProgressTab = () => (

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Profile Card */}
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center col-span-1">
    <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-black text-3xl border-4 border-white shadow-lg">
      {auth.currentUser?.email?.[0].toUpperCase() || 'U'}
    </div>
    <h3 className="font-bold text-xl text-slate-800">{auth.currentUser?.displayName || 'Explorer'}</h3>
    <p className="text-slate-400 font-medium mb-6">{auth.currentUser?.email}</p>
    
    <div className="w-full grid grid-cols-2 gap-4">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="text-yellow-500 flex justify-center mb-1"><Star className="w-6 h-6 fill-current"/></div>
        <div className="font-black text-xl text-slate-700">1,250</div>
        <div className="text-xs font-bold text-slate-400 uppercase">Total XP</div>
      </div>
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="text-orange-500 flex justify-center mb-1"><Flame className="w-6 h-6 fill-current"/></div>
        <div className="font-black text-xl text-slate-700">12</div>
        <div className="text-xs font-bold text-slate-400 uppercase">Day Streak</div>
      </div>
    </div>
  </div>

  {/* Skills Analysis */}
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 col-span-1 lg:col-span-2">
    <h3 className="font-bold text-xl text-slate-800 mb-6">Skill Analysis</h3>
    
    <div className="space-y-6">
      {[
        { name: "Listening", score: 85, color: "bg-orange-500" },
        { name: "Speaking", score: 60, color: "bg-purple-500" },
        { name: "Reading", score: 92, color: "bg-blue-500" },
        { name: "Writing (Grammar)", score: 75, color: "bg-green-500" }
      ].map(skill => (
        <div key={skill.name}>
          <div className="flex justify-between font-bold mb-2">
            <span className="text-slate-700">{skill.name}</span>
            <span className="text-slate-500">{skill.score}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div className={`${skill.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{width: `${skill.score}%`}}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


const AdminTab = () => (

<div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
  <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
    <h3 className="font-bold text-lg text-slate-700">User Management</h3>
    <button className="text-sm font-bold bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 shadow-sm hover:bg-slate-50">Export Data</button>
  </div>
  <div className="p-10 text-center flex flex-col items-center justify-center">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400"><LogOut className="w-8 h-8"/></div>
    <p className="text-slate-500 font-medium">Database connection required to load student list.</p>
    <button className="mt-4 text-blue-600 font-bold hover:underline">Refresh Data</button>
  </div>
</div>


// ==========================================
// 3. LAYOUT (SIDEBAR & BOTTOM NAV)
// ==========================================

const MainLayout = ({ userData }) => {
const navigate = useNavigate();
const location = useLocation();

const handleLogout = () => { signOut(auth); };

const navItems = [
{ id: 'explore', label: "Learn", icon: Map, path: '/explore', activeColor: 'text-green-500', activeBg: 'bg-green-50' },
{ id: 'practice', label: "Practice", icon: Dumbbell, path: '/practice', activeColor: 'text-blue-500', activeBg: 'bg-blue-50' },
{ id: 'arena', label: "Arena", icon: Swords, path: '/arena', activeColor: 'text-indigo-500', activeBg: 'bg-indigo-50' },
{ id: 'mocktest', label: "Tests", icon: GraduationCap, path: '/mocktest', activeColor: 'text-purple-500', activeBg: 'bg-purple-50' },
{ id: 'progress', label: "Profile", icon: LineChart, path: '/progress', activeColor: 'text-orange-500', activeBg: 'bg-orange-50' }
];

return (


  {/* Desktop Sidebar */}
  <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10">
    <div className="p-6">
      <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
        <span className="bg-blue-600 text-white p-1.5 rounded-xl"><Sparkles className="w-5 h-5"/></span>
        Explorer
      </h1>
    </div>
    
    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
      {navItems.map(item => {
        const isActive = location.pathname.includes(item.path);
        return (
          <button key={item.id} onClick={() => navigate(item.path)} 
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all border-2 
              ${isActive ? `${item.activeBg}${item.activeColor} border-current` : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
            <item.icon className="w-6 h-6" /> {item.label}
          </button>
        )
      })}
    </nav>

    <div className="p-4 space-y-2">
      {userData?.role === 'admin' && (
        <button onClick={() => navigate('/admin')} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
          <ShieldAlert className="w-5 h-5"/> Admin Area
        </button>
      )}
      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
        <LogOut className="w-5 h-5"/> Sign Out
      </button>
    </div>
  </aside>

  {/* Main Content Area */}
  <main className="flex-1 flex flex-col h-full relative overflow-y-auto pb-24 md:pb-0 hide-scrollbar">
    
    {/* Mobile Header / Desktop TopBar */}
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center md:bg-transparent md:border-none md:p-6 md:justify-end">
      <h1 className="text-xl font-black text-slate-800 md:hidden flex items-center gap-2">
         <span className="bg-blue-600 text-white p-1 rounded-lg"><Sparkles className="w-4 h-4"/></span> Explorer
      </h1>
      <TopMetricsBar />
    </header>

    <div className="w-full">
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<ExploreTab />} />
        <Route path="/arena" element={<ArenaTab />} />
        <Route path="/practice" element={<PracticeTab />} />
        <Route path="/progress" element={<ProgressTab />} />
        <Route path="/mocktest" element={<div className="p-10 text-center text-slate-500 mt-20 font-medium"><GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300"/>Mock Tests are locked until Level 5.</div>} />
        {userData?.role === 'admin' && <Route path="/admin" element={<AdminTab />} />}
      </Routes>
    </div>
  </main>

  {/* Mobile Bottom Navigation */}
  <nav className="md:hidden bg-white border-t border-slate-200 fixed bottom-0 w-full flex justify-around px-2 pt-2 pb-safe z-50">
    {navItems.map(item => {
       const isActive = location.pathname.includes(item.path);
       return (
        <button key={item.id} onClick={() => navigate(item.path)} className={`p-2 rounded-2xl flex flex-col items-center gap-1 min-w-[64px] ${isActive ? item.activeColor : 'text-slate-400'}`}>
          <div className={`p-1.5 rounded-xl ${isActive ? item.activeBg : ''}`}>
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} style={isActive ? {strokeWidth: 2.5} : {}} />
          </div>
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
       )
    })}
  </nav>
  
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
    .pb-safe { padding-bottom: env(safe-area-inset-bottom, 24px); }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes pulse-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .animate-pulse-slow { animation: pulse-slow 2s infinite; }
  `}} />
</div>


);
};

// ==========================================
// 4. LOGIN SCREEN
// ==========================================
const LoginScreen = () => {
const [loading, setLoading] = useState(false);

const handleGoogleLogin = async () => {
setLoading(true);
const provider = new GoogleAuthProvider();
try {
await signInWithPopup(auth, provider);
// Let the onAuthStateChanged listener handle the redirection
} catch (error) {
console.error("Login Error:", error);
setLoading(false);
}
};

return (


  {/* Decorative Background Elements */}
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>
  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>

  <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2rem] shadow-xl text-center z-10 relative border border-slate-100">
    <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.3)] transform rotate-3">
      <Sparkles className="w-10 h-10 text-white" />
    </div>
    <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Explorer Pro</h1>
    <p className="text-slate-500 mb-10 font-medium leading-relaxed">Master a new language with AI-powered interactive lessons.</p>
    
    <button 
      onClick={handleGoogleLogin} 
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 py-4 rounded-2xl font-bold text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100"
    >
      {loading ? <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> : (
        <>
          <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </>
      )}
    </button>
  </div>
</div>


);
};

// ==========================================
// 5. ROOT APP & AUTH LISTENER
// ==========================================
export default function App() {
const [user, setUser] = useState(null);
const [userData, setUserData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
if (currentUser) {
setUser(currentUser);
const userRef = doc(db, 'users', currentUser.uid);

    const unsubDoc = onSnapshot(userRef, async (uDoc) => {
      if (uDoc.exists()) {
        setUserData({ id: uDoc.id, ...uDoc.data() });
        setLoading(false); 
      } else {
        // New user creation
        const isAdmin = SUPER_ADMIN_EMAILS.includes(currentUser.email);
        await setDoc(userRef, {
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: isAdmin ? 'admin' : 'student',
          stars: 0,
          createdAt: new Date()
        });
        // Snapshot will re-trigger naturally
      }
    });
    return () => unsubDoc();
  } else {
    setUser(null);
    setUserData(null);
    setLoading(false);
  }
});
return () => unsubscribe();


}, []);

if (loading || (user && !userData)) return (





Syncing Data...

);

return (

{user && userData ?
 :

}

);
}