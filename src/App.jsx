import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Star, Lock, ChevronLeft, CheckCircle2, 
  Volume2, Trophy, Zap, PlayCircle, Users, X, User, Shield, 
  ArrowRight, Globe, MessageCircle, Mic, Compass, Rocket, 
  TreePine, Anchor, Fingerprint, LogOut, Flame, Heart, 
  AlertCircle, Check, Crown, ShieldAlert, BookOpen, Library,
  Dumbbell, Swords, Play, Timer, Medal, Headphones, PenTool, 
  Mail, Phone, RotateCw, Gamepad2, Sparkles, Loader2, Code,
  Bot, Cpu, Clock, LayoutGrid, UserCog, Ban, Unlock, SkipForward,
  Settings, Database, TrendingUp, Filter
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, query, where, addDoc } from "firebase/firestore";

let firebaseConfig = {};
try {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
} catch (error) { console.warn("Running in Preview Mode."); }

let app, auth, db;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) { console.warn("Firebase config error:", error); }

const audioCache = new Map(); 
const globalAudioPlayer = new Audio();
let isAudioUnlocked = false;

// Mở khóa Audio trên thiết bị Apple
const unlockAudioEngine = () => {
    if (isAudioUnlocked) return;
    globalAudioPlayer.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIAD+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+AAAAAElOR08AAAAQAAAABAAAAAA=";
    globalAudioPlayer.play().then(() => { globalAudioPlayer.pause(); }).catch(()=>{});
    
    if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
    }
    isAudioUnlocked = true;
    document.removeEventListener('touchstart', unlockAudioEngine);
    document.removeEventListener('click', unlockAudioEngine);
};
if (typeof document !== 'undefined') {
    document.addEventListener('touchstart', unlockAudioEngine);
    document.addEventListener('click', unlockAudioEngine);
}

// BỘ TẠO MÃ HASH ĐỘC NHẤT
const generateSafeId = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  const cleanStr = text.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  return `${cleanStr}_${Math.abs(hash)}`;
};

// Giọng Robot mặc định (Phát trực tiếp trình duyệt, KHÔNG BAO GIỜ lưu lên database)
const playSystemAudio = (text) => { 
  if ('speechSynthesis' in window) {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    if (typeof text !== 'string') return;
    let speakText = text.replace(/_+/g, 'blank').replace(/\blive\b/gi, 'livv').replace(/\blives\b/gi, 'livvz');
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = 'en-US'; utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

// HÀM TẢI AUDIO TỪ FIREBASE DÀNH CHO HỌC SINH (SIÊU TỐC ĐỘ, TRẢ VỀ MP3)
const fetchAndCacheAudio = async (text) => {
  if (!text) return null;
  const cleanText = text.trim();
  const safeId = generateSafeId(cleanText);
  
  if (audioCache.has(safeId)) return audioCache.get(safeId);

  // Chỉ tìm trên Firebase do Admin đã build sẵn (Không cần hàm convert Wav rườm rà nữa)
  if (db) {
      try {
          const docSnap = await getDoc(doc(db, "audio_cache", safeId));
          if (docSnap.exists()) {
              const audioUrl = docSnap.data().audioBase64; // Data URL chuẩn MP3 luôn
              audioCache.set(safeId, audioUrl);
              return audioUrl;
          }
      } catch (err) { console.warn("Firebase Cache read error:", err); }
  }
  return null;
};

// Hàm preload cho học sinh (Chỉ check DB, không gọi AI)
const preloadTTS = (text) => { fetchAndCacheAudio(text); };

const playPremiumAudio = async (text) => {
  if (!text) return;
  const cleanText = text.trim();

  if (globalAudioPlayer.src === "" || globalAudioPlayer.src === window.location.href) {
      globalAudioPlayer.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIAD+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+AAAAAElOR08AAAAQAAAABAAAAAA=";
      globalAudioPlayer.play().then(() => globalAudioPlayer.pause()).catch(()=>{});
  }

  try {
      const url = await fetchAndCacheAudio(cleanText);
      if (url) {
          globalAudioPlayer.src = url;
          globalAudioPlayer.load();
          await globalAudioPlayer.play();
      } else {
          // Rơi về giọng Robot nếu Admin chưa Build Audio câu này
          console.warn("Chưa có âm thanh trên Cloud, phát giọng hệ thống.");
          playSystemAudio(cleanText);
      }
  } catch (error) {
      console.warn("Lỗi phát âm thanh:", error);
      playSystemAudio(cleanText); 
  }
};

const fetchArenaQuestionsFromBank = async (scope, numQs, gradeId) => {
  if (!db) return [{ question: "Mất kết nối Database. Vui lòng kiểm tra Firebase.", options: ["OK", "A", "B", "C"], answer: "OK" }];
  
  let vocabGrammarPool = [];
  let readingPool = [];
  let listeningPool = [];
  
  let targetUnits = [];
  if (scope === 'Unit 1') targetUnits = ['1'];
  else if (scope === 'Unit 2') targetUnits = ['2'];
  else if (scope === 'Unit 3') targetUnits = ['3'];
  else targetUnits = ['1', '2', '3', '4', '5']; 
  
  const gNum = gradeId.replace('g', ''); 
  
  try {
      for (const u of targetUnits) {
          const sources = [
              { coll: 'units', doc: `grade${gNum}_unit${u}` },
              { coll: 'practice', doc: `grade${gNum}_prac${u}` },
              { coll: 'extra', doc: `grade${gNum}_extra${u}` },
              { coll: 'cambridge', doc: `grade${gNum}_cambridge${u}` } 
          ];

          for (const s of sources) {
              const snap = await getDoc(doc(db, s.coll, s.doc));
              if (snap.exists()) {
                  const data = snap.data();
                  const arraysToCheck = ['vocab', 'grammar', 'listen', 'read', 'questions', 'listening', 'reading', 'boss'];
                  
                  arraysToCheck.forEach(key => {
                      if (data[key] && Array.isArray(data[key])) {
                          data[key].forEach(q => {
                              if (q.type === 'speak') return;
                              if (q.options && q.answer && q.question) {
                                  let finalQ = q.question;
                                  let qObj = { ...q, question: finalQ };
                                  
                                  if (q.type === 'listen-fill') qObj.question += `\n[ ${q.textBefore} ___ ${q.textAfter} ]`;
                                  else if (q.passage) qObj.question = `Read:\n${q.passage}\n\nQ: ${q.question}`;

                                  if (key === 'read' || key === 'reading' || q.passage) readingPool.push(qObj);
                                  else if (key === 'listen' || key === 'listening' || q.audioText) listeningPool.push(qObj);
                                  else vocabGrammarPool.push(qObj);
                              }
                          });
                      }
                  });
              }
          }
      }

      readingPool = readingPool.sort(() => Math.random() - 0.5).slice(0, 2); 
      listeningPool = listeningPool.sort(() => Math.random() - 0.5).slice(0, 3); 
      
      let finalPool = [...vocabGrammarPool, ...readingPool, ...listeningPool];
      const uniqueQuestions = Array.from(new Map(finalPool.map(item => [item.question, item])).values());
      return uniqueQuestions.sort(() => Math.random() - 0.5).slice(0, numQs);
  } catch (e) { console.error("Bank fetch error:", e); }
  
  return [{ question: "Không tìm thấy câu hỏi. Admin vui lòng Push thêm Data!", options: ["OK", "A", "B", "C"], answer: "OK" }];
};

const evaluateSpeech = (transcript, target) => {
  let cleanTranscript = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  let cleanTarget = target.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  cleanTranscript = cleanTranscript.replace(/favorite/g, 'favourite').replace(/color/g, 'colour');
  cleanTarget = cleanTarget.replace(/favorite/g, 'favourite').replace(/color/g, 'colour');

  const normalizationDict = {
    '15': 'fifteen', '16': 'sixteen', '38': 'thirty eight', '81': 'eighty one',
    '93': 'ninety three', '116': 'one hundred and sixteen', '33': 'thirty three',
    '97': 'ninety seven', '67': 'sixty seven', '79': 'seventy nine', '23': 'twenty three',
    'st': 'street', 'rd': 'road', 'ave': 'avenue'
  };

  const transcriptWords = cleanTranscript.split(' ').map(word => normalizationDict[word] || word);
  cleanTranscript = transcriptWords.join(' ').replace(/\s+/g, ' ').trim();
  cleanTarget = cleanTarget.replace(/\s+/g, ' ').trim();

  if (cleanTranscript === cleanTarget) return { pass: true, msg: "Perfect pronunciation!" };
  if (cleanTranscript.includes('bag') && cleanTarget.includes('big')) return { pass: false, msg: "You pronounced 'bag' instead of 'big'." };
  return { pass: false, msg: `Try again! Remember to speak clearly.` };
};

const syncUserWithDb = async (googleUser) => {
  if (!db) return null;
  const defaultInventory = { stars: 0, flames: 0, lives: 5, freeRefillUsed: false };
  const defaultName = googleUser.displayName || "Explorer";
  const defaultAvatar = googleUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultName}`;
  const adminEmails = ["khoavuexp2@gmail.com", "khoavuexp@gmail.com"];
  const isHardcodedAdmin = adminEmails.includes(googleUser.email);

  try {
    const userRef = doc(db, "users", googleUser.uid);
    const userSnap = await getDoc(userRef);
    const today = new Date().toDateString();

    if (userSnap.exists()) {
      const data = userSnap.data();
      const finalRole = isHardcodedAdmin ? "admin" : (data.role || "student");
      let streak = data.streak || 0;
      let lastLogin = data.lastLogin || "";
      if (lastLogin !== today) {
         const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
         if (lastLogin === yesterday.toDateString()) streak += 1; else streak = 1;
         await updateDoc(userRef, { streak, lastLogin: today, role: finalRole });
      } else if (isHardcodedAdmin && data.role !== "admin") {
         await updateDoc(userRef, { role: "admin" });
      }
      return { uid: googleUser.uid, ...data, name: data.name || defaultName, avatar: data.avatar || defaultAvatar, role: finalRole, status: data.status || "active", inventory: data.inventory || defaultInventory, completedUnits: data.completedUnits || [], unitProgress: data.unitProgress || {}, streak, lastLogin: today, badges: data.badges || [] };
    } else {
      const newUser = { uid: googleUser.uid, name: defaultName, email: googleUser.email, role: isHardcodedAdmin ? "admin" : "student", avatar: defaultAvatar, status: "active", inventory: defaultInventory, completedUnits: [], unitProgress: {}, streak: 1, lastLogin: today, badges: [] };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error) {
    return { uid: googleUser.uid, name: defaultName, role: isHardcodedAdmin ? "admin" : "student", avatar: defaultAvatar, status: "active", inventory: defaultInventory, completedUnits: [], unitProgress: {}, streak: 1, badges: [] };
  }
};

const globalStyles = `
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  .animate-shake { animation: shake 0.4s ease-in-out; }
  @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  .animate-float { animation: float 3s ease-in-out infinite; }
  @keyframes pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
  .animate-pulse-ring { animation: pulse-ring 2s infinite; }
  @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
  @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  .animate-bounce-short { animation: bounce-short 1.5s ease-in-out infinite; }
  @keyframes timer-shrink { from { width: 100%; } to { width: 0%; } }
  .animate-timer { animation: timer-shrink linear forwards; }
`;

const COMPLIMENTS = ["Excellent!", "Awesome!", "Perfect!", "Brilliant!", "Fantastic!", "Great job!", "You're a star!"];
const MOTIVATIONAL_QUOTES = [
  { text: "Every mistake is a step forward!", icon: Sparkles, color: "text-yellow-400" },
  { text: "You are a vocabulary ninja!", icon: Swords, color: "text-blue-400" },
  { text: "Practice makes perfect!", icon: Trophy, color: "text-emerald-400" },
  { text: "Keep pushing your limits!", icon: Rocket, color: "text-orange-400" },
  { text: "English is your superpower!", icon: Zap, color: "text-purple-400" }
];

const GRADES = [
  { id: 'g1', name: "Grade 1", desc: "Phonics & Words", locked: false, color: "from-emerald-400 to-teal-500", icon: Zap },
  { id: 'g2', name: "Grade 2", desc: "Basic Phrases", locked: false, color: "from-blue-400 to-cyan-500", icon: Shield },
  { id: 'g3', name: "Grade 3", desc: "Beginner Sentences", locked: false, color: "from-amber-400 to-orange-500", icon: LayoutGrid },
  { id: 'g4', name: "Grade 4", desc: "Intermediate", locked: false, color: "from-rose-400 to-pink-500", icon: BookOpen },
  { id: 'g5', name: "Grade 5", desc: "Advanced Master", locked: false, color: "from-purple-500 to-indigo-600", icon: Crown },
];

const MAP_THEMES = {
  ocean: { bg: "from-[#0891b2] to-[#1e3a8a]", vehicle: "⛵", pathColor: "rgba(255,255,255,0.4)" },
  space: { bg: "from-[#0f172a] to-[#312e81]", vehicle: "🚀", pathColor: "rgba(255,255,255,0.2)" },
  forest: { bg: "from-[#14532d] to-[#064e3b]", vehicle: "🚙", pathColor: "rgba(255,255,255,0.3)" }
};

const TopMetricsBar = ({ user }) => (
  <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-3 sm:p-4 flex justify-between items-center z-40 relative shadow-lg shrink-0">
    <div className="flex gap-2 sm:gap-3">
      <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-white/5 shadow-inner" title="Daily Streak">
         <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 fill-orange-500" />
         <span className="text-white font-black text-sm sm:text-base">{user?.streak || 0}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-white/5 shadow-inner" title="Total Stars">
         <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
         <span className="text-white font-black text-sm sm:text-base">{user?.inventory?.stars || 0}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-white/5 shadow-inner" title="Hearts (Lives)">
         <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500 animate-bounce-short" />
         <span className="text-white font-black text-sm sm:text-base">{user?.inventory?.lives ?? 5}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 sm:gap-3 text-right">
      <div className="hidden sm:block">
        <h2 className="text-white font-black text-lg leading-tight">{user?.name || "Explorer"}</h2>
        <span className={`font-bold text-xs uppercase tracking-widest ${user?.role==='admin' ? 'text-rose-400' : 'text-blue-400'}`}>{user?.role || "STUDENT"}</span>
      </div>
      <div className="relative cursor-pointer group">
        <img src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=Explorer`} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 shadow-md bg-slate-800" alt="avatar" />
      </div>
    </div>
  </div>
);

const LeaderboardView = ({ showToast }) => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if (!db) return;
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role !== 'admin') {
             users.push({ id: doc.id, name: data.name, avatar: data.avatar, stars: data.inventory?.stars || 0, streak: data.streak || 0 });
          }
        });
        users.sort((a, b) => b.stars - a.stars);
        setTopUsers(users.slice(0, 10));
      } catch (e) {
        showToast("Cannot fetch leaderboard data.");
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in w-full h-full overflow-y-auto hide-scrollbar relative z-10 pb-24 lg:pb-8">
      <div className="text-center mb-8">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md">Global Leaderboard</h2>
        <p className="text-slate-400 font-medium mt-2">Top 10 Explorers with the highest Stars</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-2 sm:p-6">
        {loading ? (
           <div className="flex justify-center p-8"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
        ) : topUsers.length === 0 ? (
           <div className="text-center p-8 text-slate-400 font-bold">No explorers found yet!</div>
        ) : (
           <div className="flex flex-col gap-2 sm:gap-3">
             {topUsers.map((u, i) => (
               <div key={u.id} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10 transition-transform hover:-translate-y-1 ${i===0 ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10' : i===1 ? 'bg-gradient-to-r from-slate-300/20 to-slate-400/10' : i===2 ? 'bg-gradient-to-r from-orange-400/20 to-orange-500/10' : 'bg-slate-800/50'}`}>
                 <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-base shrink-0 ${i===0 ? 'bg-yellow-400 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : i===1 ? 'bg-slate-300 text-slate-800' : i===2 ? 'bg-orange-400 text-orange-900' : 'bg-slate-700 text-slate-300'}`}>{i+1}</div>
                 <img src={u.avatar} alt="avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 bg-slate-700"/>
                 <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm sm:text-lg truncate">{u.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500"/> {u.streak} Days</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/5">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-black text-sm sm:text-xl">{u.stars}</span>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

const UnderConstructionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-slate-200">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"><Cpu className="w-10 h-10 text-blue-500 animate-bounce" /></div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Under Construction!</h3>
        <p className="text-slate-600 font-medium mb-8">This module is currently being updated by our academic team. Data is not yet available on the Cloud.</p>
        <button onClick={onClose} className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 transition-all">GOT IT</button>
      </div>
    </div>
  );
};

const GameModal = ({ isOpen, onClose, station, onWin, user, updateUser, sessionData, titleLabel }) => {
  const [sessionQList, setSessionQList] = useState([]);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [orderedWords, setOrderedWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [status, setStatus] = useState('playing'); 
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [isFirstTry, setIsFirstTry] = useState(true);
  const [isStationFinished, setIsStationFinished] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (sessionData && isOpen) {
       let fullList = [];
       if (station && station.type) {
           fullList = sessionData[station.type] || [];
       } else if (Array.isArray(sessionData)) {
           fullList = sessionData;
       } else if (sessionData.questions) {
           fullList = sessionData.questions;
       }
       if (!Array.isArray(fullList)) fullList = [fullList];
       
       const isLongTest = fullList.length > 10;
       const limit = isLongTest ? fullList.length : Math.min(5, fullList.length);
       const shuffled = [...fullList].sort(() => Math.random() - 0.5).slice(0, limit);
       setSessionQList(shuffled);
       setQIndex(0); setStatus('playing'); setFeedbackMsg("");
       setSelectedOpt(null); setOrderedWords([]); setTranscript(""); setAudioUrl(null);
       setCorrectCount(0); setIsFirstTry(true); setIsStationFinished(false);
    }
  }, [station, sessionData, isOpen, retryTrigger]);

  const qData = sessionQList[qIndex];

  useEffect(() => {
    if (qData) {
        const mainText = qData.audioText || qData.targetText || qData.question;
        if (mainText) preloadTTS(mainText);
        if (qData.options) qData.options.forEach(opt => preloadTTS(opt));
        if (qData.words) qData.words.forEach(w => preloadTTS(w));
    }
    if (qData?.type === 'order' && qData.words) setShuffledWords([...qData.words].sort(() => Math.random() - 0.5));
  }, [qData, qIndex]);

  useEffect(() => {
    if (status === 'correct' && qData?.type === 'order') playPremiumAudio(qData.answer);
  }, [status, qData, qIndex]);

  useEffect(() => {
    if (qData?.type === 'speak') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onresult = (event) => {
          const spokenText = event.results[0][0].transcript;
          setTranscript(spokenText); handleVoiceCheck(spokenText); setIsListening(false);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
        };
        recognitionRef.current.onerror = (event) => {
          setIsListening(false);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
          if (event.error === 'no-speech') { setFeedbackMsg("Didn't hear anything. Try again!"); setStatus('playing'); } 
          else { setFeedbackMsg("Mic Error: " + event.error); setStatus('wrong'); if (isFirstTry) { setIsFirstTry(false); deductLife(); } }
        };
        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
        };
      }
    }
  }, [qData]);

  if (!isOpen) return null;
  if (!sessionQList || sessionQList.length === 0) return <UnderConstructionModal isOpen={true} onClose={onClose} />;

  const handleMainAudioClick = () => {
     const textToSpeak = qData.audioText || qData.targetText || qData.question;
     if (textToSpeak) playPremiumAudio(textToSpeak);
  };

  const toggleListen = async () => {
    if (isListening) { 
        recognitionRef.current?.stop(); 
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
        setIsListening(false); 
    } else { 
        setTranscript(""); setStatus('playing'); setFeedbackMsg("");
        if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let options = {};
            if (MediaRecorder.isTypeSupported('audio/mp4')) options = { mimeType: 'audio/mp4' };
            else if (MediaRecorder.isTypeSupported('audio/webm')) options = { mimeType: 'audio/webm' };

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorder.onstop = () => {
                const mimeType = mediaRecorder.mimeType || 'audio/mp4';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType }); 
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url); stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start(); recognitionRef.current?.start(); setIsListening(true); 
        } catch (err) {
            console.error("Microphone access denied or error:", err);
            setFeedbackMsg("Please allow microphone access to record.");
        }
    }
  };

  const deductLife = () => { if (updateUser && user && (user.inventory?.lives ?? 0) > 0) updateUser({...user, inventory: {...user.inventory, lives: (user.inventory.lives || 1) - 1}}); }
  const rewardStars = (amount) => { if (updateUser && user) updateUser({...user, inventory: {...user.inventory, stars: (user.inventory.stars || 0) + amount}}); }
  const getCompliment = () => COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];

  const handleVoiceCheck = (spokenText) => {
    const evaluation = evaluateSpeech(spokenText, qData.targetText);
    if (evaluation.pass) {
        if (isFirstTry) { setCorrectCount(c => c + 1); rewardStars(2); }
        setStatus('correct'); setFeedbackMsg(getCompliment());
    } else { 
        setStatus('wrong'); setFeedbackMsg(evaluation.msg);
        if (isFirstTry) { setIsFirstTry(false); deductLife(); }
    }
  };

  const handleSelectOption = (opt) => { setSelectedOpt(opt); playPremiumAudio(opt); };

  const handleCheck = () => {
    let isCorrect = false;
    if (['multiple-choice', 'listen-fill', 'read'].includes(qData.type)) isCorrect = (selectedOpt === qData.answer);
    else if (qData.type === 'order') isCorrect = (orderedWords.join(" ") === qData.answer);

    if (isCorrect) {
        if (isFirstTry) { setCorrectCount(c => c + 1); rewardStars(2); }
        setStatus('correct'); setFeedbackMsg(getCompliment());
    } else {
        setStatus('wrong'); setFeedbackMsg(qData.explain || "Not quite right.");
        if (isFirstTry) { setIsFirstTry(false); deductLife(); }
    }
  };

  const handleOrderWord = (w) => {
    if (orderedWords.includes(w)) setOrderedWords(orderedWords.filter(x => x !== w));
    else { setOrderedWords([...orderedWords, w]); playPremiumAudio(w); }
  };

  const handleContinue = () => {
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    if (status === 'correct') {
      if (qIndex < sessionQList.length - 1) {
        setQIndex(p => p + 1); setStatus('playing'); setFeedbackMsg("");
        setSelectedOpt(null); setOrderedWords([]); setTranscript(""); setIsFirstTry(true);
      } else setIsStationFinished(true);
    } else { 
        setSelectedOpt(null); setOrderedWords([]); setStatus('playing'); setTranscript(""); 
        if (qData?.type === 'order' && qData.words) setShuffledWords([...qData.words].sort(() => Math.random() - 0.5));
    }
  };

  const handleSkip = () => {
    if (isFirstTry) deductLife();
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    if (qIndex < sessionQList.length - 1) {
        setQIndex(p => p + 1); setStatus('playing'); setFeedbackMsg("");
        setSelectedOpt(null); setOrderedWords([]); setTranscript(""); setIsFirstTry(true);
    } else setIsStationFinished(true);
  };

  const currentLives = user?.inventory?.lives ?? 5;
  const currentStars = user?.inventory?.stars ?? 0;
  const hasUsedFreeRefill = user?.inventory?.freeRefillUsed === true;

  if (currentLives <= 0 && !isStationFinished) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-rose-500">
            <Heart className="w-16 h-16 text-rose-500 fill-rose-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Out of Hearts!</h3>
            <p className="text-slate-600 font-medium mb-6 text-sm sm:text-base">You need hearts to continue the journey.</p>
            <div className="flex flex-col gap-3">
              {currentStars >= 30 ? (
                 <button onClick={() => { if(updateUser) updateUser({...user, inventory: {...user.inventory, lives: 5, stars: currentStars - 30}}); setStatus('playing'); }} className="w-full py-3.5 bg-blue-500 text-white font-black rounded-xl text-sm border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all flex justify-center items-center gap-2">
                   REFILL 5 HEARTS <span className="flex items-center text-yellow-300">(-30 <Star className="w-4 h-4 fill-yellow-300 ml-1"/>)</span>
                 </button>
              ) : !hasUsedFreeRefill ? (
                 <button onClick={() => { if(updateUser) updateUser({...user, inventory: {...user.inventory, lives: 5, freeRefillUsed: true}}); setStatus('playing'); }} className="w-full py-3.5 bg-emerald-500 text-white font-black rounded-xl text-sm border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">
                   EMERGENCY REFILL (FREE 1 TIME)
                 </button>
              ) : (
                 <button disabled className="w-full py-3.5 bg-slate-300 text-slate-500 font-black rounded-xl text-sm border-b-4 border-slate-400 cursor-not-allowed">NOT ENOUGH STARS</button>
              )}
              <button onClick={onClose} className="w-full py-3.5 bg-slate-200 text-slate-700 font-black rounded-xl text-sm hover:bg-slate-300 transition-colors">QUIT & PRACTICE MORE</button>
            </div>
          </div>
        </div>
      );
  }

  if (isStationFinished) {
      const accuracy = Math.round((correctCount / sessionQList.length) * 100);
      const isPassed = accuracy >= 80;
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
           <div className={`bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 ${isPassed ? 'border-emerald-500' : 'border-rose-500'}`}>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 border-4 bg-slate-50">
                 {isPassed ? <Crown className="w-10 h-10 text-yellow-500 fill-yellow-500 animate-bounce" /> : <AlertCircle className="w-10 h-10 text-rose-500 animate-shake" />}
              </div>
              <h3 className={`text-2xl sm:text-3xl font-black mb-2 ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>{isPassed ? 'Test Cleared!' : 'Test Failed'}</h3>
              <p className="text-slate-600 font-bold mb-6 text-lg">Score: <span className={isPassed ? 'text-emerald-500' : 'text-rose-500'}>{accuracy}%</span> {isPassed ? '' : '(Need 80%)'}</p>
              
              <div className="flex flex-col gap-3">
                 {isPassed ? (
                    <button onClick={() => { if(onWin) onWin(); else onClose(); }} className="w-full py-3.5 bg-emerald-500 text-white font-black rounded-xl text-base border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">CLAIM REWARDS</button>
                 ) : (
                    <button onClick={() => setRetryTrigger(p => p + 1)} className="w-full py-3.5 bg-blue-500 text-white font-black rounded-xl text-base border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all">RETRY TEST</button>
                 )}
                 <button onClick={onClose} className="w-full py-3.5 bg-slate-200 text-slate-700 font-black rounded-xl text-sm hover:bg-slate-300 transition-colors">RETURN</button>
              </div>
           </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden relative max-h-[95vh] sm:max-h-[90vh] ${status==='wrong'?'animate-shake border-4 border-rose-500':status==='correct'?'border-4 border-emerald-500':''}`}>
        <div className="bg-slate-100 p-3 sm:p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{station?.icon || <Library className="w-6 h-6 text-blue-500"/>}</span>
            <div className="flex flex-col">
              <h3 className="font-black text-slate-800 text-sm sm:text-lg uppercase leading-none">{titleLabel || station?.label || "Practice"}</h3>
              {sessionQList.length > 1 && <span className="text-[10px] sm:text-xs font-black text-blue-600 uppercase">Question {qIndex + 1} of {sessionQList.length}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200" title="Hearts (Lives)">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500"/><span className="font-bold text-slate-700 text-xs sm:text-sm">{currentLives}</span>
             </div>
             <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200" title="Stars">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/><span className="font-bold text-slate-700 text-xs sm:text-sm">{currentStars}</span>
             </div>
             <button onClick={onClose} className="p-1 sm:p-1.5 bg-slate-200 rounded-full hover:bg-slate-300 ml-1"><X className="w-4 h-4 sm:w-5 sm:h-5"/></button>
          </div>
        </div>

        <div className="p-3 sm:p-6 flex flex-col gap-3 sm:gap-5 overflow-y-auto flex-1 hide-scrollbar">
          {qData.image && <img src={qData.image} alt="Visual" onError={(e) => e.target.style.display='none'} className="w-full h-32 sm:h-48 object-cover rounded-xl shadow-md border-2 border-slate-100" />}
          {qData.passage && <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-700 font-medium text-xs sm:text-sm shadow-inner max-h-32 overflow-y-auto whitespace-pre-wrap">{qData.passage}</div>}
          
          <h2 className="text-base sm:text-xl font-black text-slate-800 flex items-start gap-2 sm:gap-3 leading-tight">
            <button onClick={handleMainAudioClick} className="p-2 sm:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-95 shrink-0 shadow-md">
              <Volume2 className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <span className="pt-0.5">{qData.question}</span>
          </h2>
          
          {qData.type === 'speak' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="text-lg sm:text-2xl font-black text-slate-800 text-center px-2">"{qData.targetText}"</div>
              <button onClick={toggleListen} className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse-ring' : 'bg-blue-50 text-blue-600 border-4 border-blue-200 hover:scale-105'}`}>
                <Mic className={`w-8 h-8 sm:w-10 sm:h-10 ${isListening ? 'animate-bounce' : ''}`} />
              </button>
              <div className="text-center w-full px-4">
                 {isListening ? (
                    <p className="text-rose-500 font-bold animate-pulse text-sm">Listening... Speak now!</p>
                 ) : (
                    transcript ? (
                      <div className="bg-slate-100 p-3 sm:p-4 rounded-xl border border-slate-200 shadow-inner flex flex-col gap-2">
                         <div>
                            <p className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">You said:</p>
                            <p className="text-slate-800 font-black text-lg">"{transcript}"</p>
                         </div>
                         {audioUrl && (
                            <div className="mt-2 border-t border-slate-200 pt-3">
                               <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider">Your Voice:</p>
                               <audio controls src={audioUrl} className="w-full h-10 outline-none rounded-lg" />
                            </div>
                         )}
                      </div>
                    ) : (
                      <p className="text-slate-500 font-medium text-sm">{qData.hint}</p>
                    )
                 )}
                 {status === 'playing' && feedbackMsg && <p className="text-rose-500 font-bold text-sm mt-2">{feedbackMsg}</p>}
              </div>
            </div>
          )}

          {['multiple-choice', 'listen-fill', 'read'].includes(qData.type) && (
            <div className="flex flex-col gap-2">
              {qData.type === 'listen-fill' && (
                 <div className="text-sm sm:text-base font-bold text-slate-700 text-center py-2 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl">{qData.textBefore} <span className="inline-block min-w-[50px] sm:min-w-[80px] border-b-4 border-blue-400 mx-1 text-blue-600">{selectedOpt || '...'}</span> {qData.textAfter}</div>
              )}
              <div className="grid grid-cols-1 gap-2">
                {qData.options.map(opt => (
                  <button key={opt} onClick={() => handleSelectOption(opt)} disabled={status!=='playing'} className={`p-2.5 sm:p-4 rounded-xl border-b-[3px] sm:border-b-4 font-bold text-sm sm:text-base text-left transition-all ${selectedOpt === opt ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:-translate-y-1'}`}>{opt}</button>
                ))}
              </div>
            </div>
          )}

          {qData.type === 'order' && (
            <div className="flex flex-col gap-3">
              <div className="min-h-[48px] sm:min-h-[60px] p-2 sm:p-4 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-wrap gap-2 items-center">
                {orderedWords.map((w, i) => <span key={i} onClick={() => handleOrderWord(w)} className="px-2 py-1 sm:px-3 sm:py-2 bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-lg cursor-pointer hover:scale-105">{w}</span>)}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {shuffledWords.filter(w => !orderedWords.includes(w)).map((w, i) => <span key={i} onClick={() => handleOrderWord(w)} className="px-2 py-1 sm:px-3 sm:py-2 bg-white border-2 border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-lg cursor-pointer hover:-translate-y-1">{w}</span>)}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          {status === 'playing' ? (
            <div className="flex gap-2">
              <button onClick={handleSkip} className="px-4 py-3 sm:py-4 bg-slate-200 text-slate-500 hover:text-slate-700 font-black rounded-xl active:translate-y-1 hover:bg-slate-300 transition-colors flex items-center justify-center border-b-4 border-slate-300 active:border-b-0 shrink-0" title="Skip Question">
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              {qData.type !== 'speak' && (
                <button onClick={handleCheck} className="flex-1 py-3 sm:py-4 bg-blue-500 text-white font-black rounded-xl border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 hover:bg-blue-400 text-sm sm:text-base">
                  CHECK ANSWER
                </button>
              )}
            </div>
          ) : (
            <div className={`p-3 rounded-xl flex flex-col gap-3 animate-pop ${status === 'correct' ? 'bg-emerald-100 border border-emerald-300' : 'bg-rose-100 border border-rose-300'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-full text-white shrink-0 ${status === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{status === 'correct' ? <Check className="w-4 h-4 sm:w-5 sm:h-5"/> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5"/>}</div>
                  <div>
                    <h3 className={`font-black text-sm sm:text-lg ${status === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>{status === 'correct' ? feedbackMsg : 'Needs Work'}</h3>
                    <p className={`text-[10px] sm:text-xs font-medium mt-0.5 ${status === 'correct' ? 'text-emerald-600' : 'text-rose-600'}`}>{status === 'correct' ? '+2 Stars Awarded' : feedbackMsg}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleContinue} className={`flex-1 py-2.5 sm:py-3 text-white text-sm sm:text-base font-black rounded-xl shadow-md active:translate-y-1 ${status === 'correct' ? 'bg-emerald-500 border-b-4 border-emerald-700' : 'bg-rose-500 border-b-4 border-rose-700'}`}>{status === 'correct' ? 'CONTINUE' : 'TRY AGAIN'}</button>
                {status === 'wrong' && (
                  <button onClick={handleSkip} className="px-4 py-2.5 sm:py-3 bg-slate-300 text-slate-700 font-black rounded-xl active:translate-y-1 flex items-center justify-center gap-1 text-sm sm:text-base border-b-4 border-slate-400 hover:bg-slate-400 transition-colors" title="Skip this question (-1 Heart)">
                    SKIP <SkipForward className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MapView = ({ grade, unit, onBack, user, updateUser, currentUnitData }) => {
  const theme = MAP_THEMES[unit.theme] || MAP_THEMES.ocean;
  const isUnitCompleted = user?.completedUnits?.includes(unit.id);
  const savedProgress = isUnitCompleted ? 4 : (user?.unitProgress?.[unit.id] || 0);
  
  const [currentStationIdx, setCurrentStationIdx] = useState(savedProgress); 
  const [activeGame, setActiveGame] = useState(null);

  const getMapNodes = () => {
    const baseNodes = [ { id: 1, type: "vocab", x: 20, y: 80 }, { id: 2, type: "grammar", x: 45, y: 65 }, { id: 3, type: "listen", x: 75, y: 55 }, { id: 4, type: "read", x: 40, y: 30 }, { id: 5, type: "boss", x: 80, y: 15 } ];
    const styles = [ { label: "Word Island", icon: "🏝️" }, { label: "Grammar Reef", icon: "🪸" }, { label: "Listen Shell", icon: "🐚" }, { label: "Read Cave", icon: "🌊" }, { label: "Kraken Boss", icon: "🦑" } ];
    return baseNodes.map((node, i) => ({ ...node, ...styles[i] }));
  };
  
  const nodes = getMapNodes();
  const pathD = nodes.reduce((acc, node, i) => i === 0 ? `M ${node.x} ${node.y}` : `${acc} L ${node.x} ${node.y}`, "");

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 animate-fade-in relative">
      <button onClick={onBack} className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50 p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 border border-white/20 shadow-xl"><ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /></button>
      <div className={`relative w-full flex-1 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-[4px] sm:border-[6px] border-white/10 bg-gradient-to-tr ${theme.bg}`}>
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/80 backdrop-blur-xl px-4 py-1.5 sm:px-6 sm:py-2 rounded-2xl border border-white/10 shadow-2xl whitespace-nowrap">
          <span className="text-white font-black tracking-widest text-[10px] sm:text-sm uppercase">{grade.name} • {unit.name}</span>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
           <path d={pathD} fill="transparent" stroke={theme.pathColor} strokeWidth="2.5" strokeDasharray="4 6" strokeLinecap="round" />
        </svg>
        <div className="absolute z-30 transition-all duration-1000 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl pointer-events-none" style={{ left: `${nodes[currentStationIdx].x}%`, top: `${nodes[currentStationIdx].y}%`, marginTop: '-35px' }}>
          <div className="text-4xl sm:text-6xl animate-float">{theme.vehicle}</div>
        </div>
        {nodes.map((node, index) => {
          const isPassed = isUnitCompleted || index < currentStationIdx;
          const isCurrent = !isUnitCompleted && index === currentStationIdx;
          const isLocked = !isUnitCompleted && index > currentStationIdx;
          return (
            <button key={node.id} onClick={() => !isLocked && setActiveGame(node)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 sm:gap-2 group ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-110 transition-transform'}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
              <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-4xl shadow-2xl border-2 sm:border-4 backdrop-blur-md relative ${isCurrent ? 'bg-white/30 border-white ring-4 ring-white/30 animate-pulse' : isPassed ? 'bg-white/20 border-white/50' : 'bg-slate-900/50 border-slate-700'}`}>
                {node.icon}
                {isPassed && <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-emerald-500 rounded-full p-0.5 sm:p-1 border border-white"><CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5 text-white" /></div>}
                {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-full"><Lock className="w-5 h-5 sm:w-8 sm:h-8 text-white/50"/></div>}
              </div>
              <div className="px-2 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-xs font-black shadow-xl border backdrop-blur-md uppercase bg-slate-900/90 text-white border-white/20 whitespace-nowrap">{node.label}</div>
            </button>
          );
        })}
      </div>
      
      <GameModal isOpen={!!activeGame} onClose={() => setActiveGame(null)} station={activeGame} sessionData={currentUnitData} user={user} updateUser={updateUser} titleLabel={`${unit.name} - ${activeGame?.label}`} onWin={() => {
        setActiveGame(null);
        let newStars = (user?.inventory?.stars ?? 0) + 15;
        if (currentStationIdx < nodes.length - 1) {
            const nextIdx = currentStationIdx + 1;
            if(!isUnitCompleted) setCurrentStationIdx(nextIdx); 
            if (updateUser && user && !isUnitCompleted) {
               updateUser({...user, inventory: {...user.inventory, stars: newStars}, unitProgress: {...(user.unitProgress || {}), [unit.id]: nextIdx}});
            } else if (updateUser && user) {
               updateUser({...user, inventory: {...user.inventory, stars: newStars}});
            }
        } else {
           if (updateUser && user) {
               let finalStars = newStars + (isUnitCompleted ? 0 : 35); 
               let newCompleted = [...new Set([...(user.completedUnits || []), unit.id])];
               updateUser({...user, inventory: {...user.inventory, stars: finalStars}, completedUnits: newCompleted, unitProgress: {...(user.unitProgress || {}), [unit.id]: nodes.length - 1}});
           }
           onBack();
        }
      }} />
    </div>
  );
};

const GenericListSelector = ({ title, grade, items, onBack, onSelect, icon: Icon, colorClass }) => (
  <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:py-8 sm:px-4 animate-fade-in h-full flex flex-col z-10 relative">
    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 shrink-0">
      <button onClick={onBack} className="p-2 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-colors"><ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /></button>
      <div><h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-md">{grade.name} - {title}</h2></div>
    </div>
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 sm:gap-4 pb-24 sm:pb-20 hide-scrollbar">
      {items && items.length > 0 ? items.map(item => (
        <button key={item.id} onClick={() => onSelect(item)} 
          className={`relative flex items-center p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] border-b-[4px] sm:border-b-[6px] w-full text-left transition-transform active:translate-y-1 active:border-b-0 ${colorClass}`}>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-5 shrink-0 bg-white/20 text-white">
            <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-xl font-black text-white">{item.name}: {item.title}</h3>
          </div>
        </button>
      )) : (
        <div className="text-center p-8 bg-white/5 rounded-[2rem] border border-white/10 text-white/50 font-bold">Chưa có dữ liệu từ Admin.</div>
      )}
    </div>
  </div>
);

const UnitsView = ({ grade, syllabus, onBack, onSelectUnit, user }) => (
  <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:py-8 sm:px-4 animate-fade-in h-full flex flex-col z-10 relative">
    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 shrink-0">
      <button onClick={onBack} className="p-2 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-colors"><ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /></button>
      <div><h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-md">{grade.name} Journey</h2></div>
    </div>
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 sm:gap-4 pb-24 sm:pb-20 hide-scrollbar">
      {syllabus?.units && syllabus.units.length > 0 ? syllabus.units.map(unit => {
        const isCompleted = user?.completedUnits?.includes(unit.id);
        const progress = user?.unitProgress?.[unit.id] || 0;
        return (
        <button key={unit.id} onClick={() => onSelectUnit(unit)} 
          className={`relative flex items-center p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] border-b-[4px] sm:border-b-[6px] w-full text-left transition-transform active:translate-y-1 active:border-b-0
          ${isCompleted ? 'bg-emerald-500 border-emerald-700 hover:brightness-110 shadow-xl' :
            progress > 0 ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-orange-800 hover:brightness-110 shadow-xl' :
            'bg-gradient-to-r from-blue-500 to-indigo-600 border-indigo-800 hover:brightness-110 shadow-xl'}`}>
          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-5 shrink-0 ${isCompleted ? 'bg-emerald-600 text-white' : progress > 0 ? 'bg-orange-700 text-white' : 'bg-white/20 text-white'}`}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7" /> : progress > 0 ? <Loader2 className="w-5 h-5 sm:w-7 sm:h-7 animate-spin" /> : <Play className="w-5 h-5 sm:w-7 sm:h-7 ml-1" />}
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-xl font-black text-white">{unit.name}: {unit.title}</h3>
            {isCompleted && <p className="text-[10px] sm:text-sm font-bold text-emerald-100 mt-0.5 sm:mt-1 flex items-center gap-1"><Star className="w-3 h-3 sm:w-4 sm:h-4 fill-emerald-100"/> Mastered</p>}
            {!isCompleted && progress > 0 && <p className="text-[10px] sm:text-sm font-bold text-orange-100 mt-0.5 sm:mt-1 flex items-center gap-1">In Progress (Station {progress + 1}/5)</p>}
          </div>
        </button>
      )}) : (
        <div className="text-center p-8 bg-white/5 rounded-[2rem] border border-white/10 text-white font-bold">
           <Database className="w-12 h-12 text-white/30 mx-auto mb-4" />
           Chưa có dữ liệu Khung chương trình.<br/>Admin vui lòng vào Admin Panel, chọn "6. Syllabus" để Push Data.
        </div>
      )}
    </div>
  </div>
);

const GradesView = ({ onSelectGrade }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 pb-24 lg:pb-4">
    <div className="mb-6 sm:mb-8 text-center"><h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">Select Your Grade</h2></div>
    <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 max-w-5xl w-full">
      {GRADES.map(grade => (
        <button key={grade.id} onClick={() => onSelectGrade(grade)} 
          className={`relative flex-1 min-w-[120px] sm:min-w-[140px] max-w-[150px] sm:max-w-[180px] text-left p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border-b-[6px] sm:border-b-[8px] transition-all bg-gradient-to-b ${grade.color} border-black/20 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:border-b-0`}>
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/20 text-white w-fit mb-2 sm:mb-4"><grade.icon className="w-6 h-6 sm:w-8 sm:h-8" /></div>
          <h3 className="font-black text-lg sm:text-2xl text-white">{grade.name}</h3>
          <p className="text-[10px] sm:text-xs font-bold text-white/70 mt-1">{grade.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const PracticeHub = ({ grade, onSelectCategory }) => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in w-full h-full overflow-y-auto hide-scrollbar relative z-10 pb-24 lg:pb-8">
    <div className="mb-8">
      <h2 className="text-4xl font-black text-white drop-shadow-md mb-2">{grade.name} Practice Hub</h2>
      <p className="text-slate-400 font-medium text-lg">Master your skills across all domains.</p>
    </div>
    
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2"><LayoutGrid className="w-6 h-6 text-emerald-400"/> Skill Drills</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => onSelectCategory('listening')} className="p-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl border-b-[6px] border-teal-800 text-white hover:-translate-y-1 shadow-lg text-left">
            <Headphones className="w-8 h-8 mb-3 text-teal-100" />
            <h4 className="text-xl font-black">Listening</h4>
            <p className="text-sm font-medium text-teal-100">By Unit</p>
          </button>
          <button onClick={() => onSelectCategory('speaking')} className="p-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl border-b-[6px] border-cyan-800 text-white hover:-translate-y-1 shadow-lg text-left">
            <Mic className="w-8 h-8 mb-3 text-cyan-100" />
            <h4 className="text-xl font-black">Speaking</h4>
            <p className="text-sm font-medium text-cyan-100">By Unit</p>
          </button>
          <button onClick={() => onSelectCategory('reading')} className="p-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl border-b-[6px] border-rose-800 text-white hover:-translate-y-1 shadow-lg text-left">
            <BookOpen className="w-8 h-8 mb-3 text-rose-100" />
            <h4 className="text-xl font-black">Reading</h4>
            <p className="text-sm font-medium text-rose-100">By Unit</p>
          </button>
          <button onClick={() => onSelectCategory('extra')} className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl border-b-[6px] border-purple-800 text-white hover:-translate-y-1 shadow-lg text-left">
            <Star className="w-8 h-8 mb-3 text-purple-100" />
            <h4 className="text-xl font-black">Extra Exercises</h4>
            <p className="text-sm font-medium text-purple-100">Arena Prep</p>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2"><Timer className="w-6 h-6 text-amber-400"/> Full Exams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => onSelectCategory('tests')} className="text-left p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] border-b-[8px] border-indigo-900 text-white hover:-translate-y-2 transition-transform shadow-xl">
            <Timer className="w-12 h-12 mb-4 text-indigo-200" />
            <h3 className="text-3xl font-black mb-2">45-Min Test</h3>
            <p className="text-indigo-100 text-base font-medium">Review and End-of-Term comprehensive tests.</p>
          </button>
          <button onClick={() => onSelectCategory('cambridge')} className="text-left p-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] border-b-[8px] border-amber-700 text-white hover:-translate-y-2 transition-transform shadow-xl">
            <Medal className="w-12 h-12 mb-4 text-amber-100" />
            <h3 className="text-2xl font-black mb-2">Cambridge A2</h3>
            <p className="text-amber-50 text-sm font-medium">Flyers/KET level reading and vocabulary.</p>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ArenaView = ({ user, updateUser, selectedGrade }) => {
  const [arenaState, setArenaState] = useState('lobby'); 
  const [pin, setPin] = useState('');
  const [players, setPlayers] = useState([]);
  const [timer, setTimer] = useState(10);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [config, setConfig] = useState({ questions: 10, timeLimit: 5, scope: 'Unit 1' }); 
  const [arenaQuestions, setArenaQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [answerState, setAnswerState] = useState(null);

  useEffect(() => {
    if (arenaState === 'hosting') {
      const interval = setInterval(() => {
        const bots = ["Alex_99", "Sarah_Pro", "JohnDoe", "Emma_Star", "Mike_Gamer"];
        setPlayers(prev => {
          if (prev.length >= 5) return prev;
          return [...prev, { name: bots[prev.length], avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${bots[prev.length]}` }];
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [arenaState]);

  useEffect(() => {
    if (arenaState === 'battle' && timer > 0 && !answerState) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (arenaState === 'battle' && timer === 0 && !answerState) {
      handleAnswer(null); 
    }
  }, [arenaState, timer, answerState]);

  const handleGenerateRoom = () => {
    setPin(Math.floor(10000 + Math.random() * 90000).toString());
    setPlayers([{ name: user?.name || "Host", avatar: user?.avatar, isHost: true }]);
    setArenaState('hosting');
  };

  const handleStartBattle = async () => {
    setIsGenerating(true);
    let questions = await fetchArenaQuestionsFromBank(config.scope, parseInt(config.questions), selectedGrade?.id || 'g5');
    if (!questions || questions.length === 0) {
        questions = [{ question: "Lỗi hệ thống. Không thể truy xuất CSDL.", options: ["1", "2", "3", "4"], answer: "2" }];
    } else {
        questions.forEach((q) => {
            const mainText = q.audioText || q.question;
            preloadTTS(mainText);
            if (q.options) q.options.forEach(opt => preloadTTS(opt));
        });
    }
    setArenaQuestions(questions);
    setCurrentQ(0); setPlayerScore(0); setAnswerState(null);
    setIsGenerating(false); setArenaState('battle'); setTimer(10); 
  };

  const handleAnswer = (opt) => {
    if (answerState) return;
    const isCorrect = opt && opt === arenaQuestions[currentQ]?.answer;
    setAnswerState({ selected: opt, isCorrect });
    if (opt) playPremiumAudio(opt);
    if (isCorrect) setPlayerScore(prev => prev + 10);
    setTimeout(() => {
        if (currentQ < arenaQuestions.length - 1) {
            setCurrentQ(prev => prev + 1); setTimer(10); setAnswerState(null);
        } else {
            setArenaState('result'); setRewardClaimed(false); setAnswerState(null);
        }
    }, 500);
  };

  if (arenaState === 'setup') {
    return (
      <div className="p-4 max-w-2xl mx-auto animate-fade-in w-full h-full flex flex-col items-center justify-center relative z-10 pb-24 lg:pb-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
            <Settings className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-black text-white">Room Settings</h2>
          </div>
          <div className="flex flex-col gap-6 mb-8">
            <div>
              <label className="text-slate-400 font-bold mb-3 block flex items-center gap-2"><Filter className="w-4 h-4"/> Knowledge Scope</label>
              <select value={config.scope} onChange={(e) => setConfig({...config, scope: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 font-black text-white outline-none focus:border-blue-500">
                  <option value="Unit 1">Unit 1 Only</option>
                  <option value="Unit 2">Unit 2 Only</option>
                  <option value="Unit 3">Unit 3 Only</option>
                  <option value="Units 1 to 5">Units 1 - 5 (Mid-Term Review)</option>
              </select>
              <p className="text-xs text-slate-500 mt-2 italic">*Hệ thống sẽ bốc câu hỏi ngẫu nhiên từ kho bài học (Lesson), bài tập (Practice) và câu hỏi nâng cao (Extra) của giáo viên.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-bold mb-2 block">Number of Questions</label>
                  <select value={config.questions} onChange={(e) => setConfig({...config, questions: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-3 font-black text-white outline-none focus:border-blue-500">
                      {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Qs</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold mb-2 block">Time Limit (Mins)</label>
                  <select value={config.timeLimit} onChange={(e) => setConfig({...config, timeLimit: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-3 font-black text-white outline-none focus:border-blue-500">
                      {[1, 3, 5, 10].map(n => <option key={n} value={n}>{n} Min</option>)}
                  </select>
                </div>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setArenaState('lobby')} className="px-6 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
             <button onClick={handleGenerateRoom} className="flex-1 py-4 bg-emerald-600 text-white font-black text-lg rounded-xl border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2">
               <Rocket className="w-5 h-5"/> GENERATE ROOM
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (arenaState === 'hosting') {
    return (
      <div className="p-4 max-w-4xl mx-auto animate-fade-in w-full h-full flex flex-col relative z-10 pb-24 lg:pb-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl">
          <p className="text-slate-400 font-bold mb-2">Join at <span className="text-white">explorer.edu/play</span></p>
          <h2 className="text-6xl font-black text-white tracking-widest bg-slate-950 inline-block px-8 py-4 rounded-3xl border-4 border-blue-500 mb-8">{pin}</h2>
          <div className="flex justify-center gap-4 mb-8 text-xs font-bold text-slate-400 uppercase tracking-wider flex-wrap">
             <span className="bg-slate-800 px-3 py-1 rounded-full">{config.scope}</span>
             <span className="bg-slate-800 px-3 py-1 rounded-full">{config.questions} Qs | {config.timeLimit} Mins</span>
             <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">Syllabus Bank</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {players.map((p, i) => (
              <div key={i} className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center animate-pop border border-white/5">
                <img src={p.avatar} alt={p.name} className="w-16 h-16 rounded-full bg-slate-700 mb-2 border-2 border-white/20"/>
                <span className="text-white font-bold">{p.name}</span>
                {p.isHost && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full mt-1">HOST</span>}
              </div>
            ))}
            {players.length < 5 && (
              <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 p-4 rounded-2xl flex items-center justify-center animate-pulse">
                <span className="text-slate-500 font-bold">Waiting...</span>
              </div>
            )}
          </div>
          <button onClick={handleStartBattle} disabled={players.length < 2 || isGenerating} className="w-full sm:w-auto px-12 py-4 bg-emerald-500 text-white font-black text-xl rounded-2xl border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 transition-all flex justify-center items-center gap-3 mx-auto">
            {isGenerating ? <><Loader2 className="w-6 h-6 animate-spin"/> CRAFTING BATTLEFIELD...</> : 'START BATTLE'}
          </button>
        </div>
      </div>
    );
  }

  if (arenaState === 'battle') {
    const q = arenaQuestions[currentQ];
    return (
      <div className="p-4 max-w-5xl mx-auto animate-fade-in w-full h-full flex flex-col relative z-10 pb-24 lg:pb-4">
        <div className="flex justify-between text-white font-bold mb-2">
            <span>Q: {currentQ + 1} / {arenaQuestions.length}</span>
            <span className="text-yellow-400">Score: {playerScore}</span>
        </div>
        <div className="w-full bg-slate-800 h-4 rounded-full mb-6 overflow-hidden border border-white/10">
          <div className="h-full bg-blue-500 transition-all ease-linear" style={{ width: `${(timer/10)*100}%` }}></div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 text-center shadow-2xl flex-1 flex flex-col animate-slide-up">
          <div className="flex justify-center mb-4"><Database className="w-10 h-10 text-purple-500 animate-pulse" /></div>
          <p className="text-purple-600 font-bold text-xs sm:text-sm uppercase tracking-widest mb-6">Database Challenge - {config.scope}</p>
          <h2 className="text-xl sm:text-3xl font-black text-slate-800 mb-8 sm:mb-12 whitespace-pre-wrap flex items-start justify-center gap-3">
             {(q?.type === 'listen-fill' || q?.audioText) && (
                <button onClick={() => playPremiumAudio(q.audioText || q.question)} className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-95 shrink-0 shadow-md">
                   <Volume2 className="w-6 h-6" />
                </button>
             )}
             <span className="pt-1">{q?.question || "Loading..."}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-auto">
            {q?.options?.map((opt, i) => {
              const defaultColors = ['bg-rose-500 border-rose-700 hover:bg-rose-400', 'bg-blue-500 border-blue-700 hover:bg-blue-400', 'bg-amber-500 border-amber-700 hover:bg-amber-400', 'bg-emerald-500 border-emerald-700 hover:bg-emerald-400'];
              let btnClass = defaultColors[i%4];
              if (answerState) {
                  if (opt === q.answer) btnClass = 'bg-emerald-500 border-emerald-700 animate-pulse'; 
                  else if (opt === answerState.selected) btnClass = 'bg-rose-500 border-rose-700 opacity-50'; 
                  else btnClass = 'bg-slate-300 border-slate-400 opacity-50'; 
              }
              return (
                <button key={i} onClick={() => handleAnswer(opt)} disabled={!!answerState} className={`p-4 sm:p-6 rounded-2xl text-white font-black text-sm sm:text-xl border-b-[6px] active:border-b-0 active:translate-y-2 transition-all ${btnClass}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (arenaState === 'result') {
    return (
      <div className="p-4 max-w-4xl mx-auto animate-fade-in w-full h-full flex items-center justify-center relative z-10 pb-24 lg:pb-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 sm:p-12 text-center shadow-2xl w-full">
          <Trophy className="w-20 h-20 sm:w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">Battle Finished!</h2>
          <p className="text-emerald-400 font-bold text-lg sm:text-xl mb-8">Score: {playerScore} / {config.questions * 10} (+{Math.floor(playerScore/2)} Stars Earned)</p>
          <div className="flex justify-center gap-2 sm:gap-4 mb-8 items-end">
            <div className="flex flex-col items-center">
              <span className="text-white font-bold mb-2 text-xs sm:text-base">Sarah_Pro</span>
              <div className="w-12 h-16 sm:w-16 h-24 bg-slate-700 rounded-t-lg border-t-4 border-slate-400 flex justify-center items-start pt-2 font-black text-slate-400">2</div>
            </div>
            <div className="flex flex-col items-center z-10 relative">
              <span className="text-white font-bold mb-2 text-sm sm:text-xl truncate max-w-[80px] sm:max-w-none">{user?.name}</span>
              <div className="w-16 h-24 sm:w-20 h-32 bg-yellow-500 rounded-t-lg border-t-4 border-yellow-300 flex justify-center items-start pt-2 font-black text-yellow-900 text-xl sm:text-2xl shadow-[0_0_30px_rgba(234,179,8,0.5)]">1</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white font-bold mb-2 text-xs sm:text-base">Alex_99</span>
              <div className="w-12 h-12 sm:w-16 h-20 bg-orange-700 rounded-t-lg border-t-4 border-orange-500 flex justify-center items-start pt-2 font-black text-orange-400">3</div>
            </div>
          </div>
          <button onClick={() => {
             if (!rewardClaimed && updateUser && user) {
                updateUser({...user, inventory: {...user.inventory, stars: (user.inventory.stars || 0) + Math.floor(playerScore/2)}});
                setRewardClaimed(true);
             }
             setArenaState('lobby');
          }} className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white font-black rounded-xl border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">
            CLAIM REWARD & RETURN
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in w-full h-full flex flex-col items-center justify-center relative z-10 pb-24 lg:pb-8">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] w-full max-w-lg shadow-2xl text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-orange-400 to-rose-500 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
          <Swords className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">Syllabus Arena Lobby</h2>
        <p className="text-slate-400 font-medium text-sm sm:text-lg mb-8">Join a live multiplayer match or host an epic battle from our Knowledge Bank!</p>
        <input type="text" placeholder="Game PIN" className="w-full bg-slate-950 text-white font-black text-center text-xl sm:text-2xl p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 border-2 border-slate-700 outline-none focus:border-blue-500 transition-colors" />
        <button onClick={() => setArenaState('hosting')} className="w-full bg-blue-600 text-white font-black py-3 sm:py-4 text-lg sm:text-xl rounded-xl sm:rounded-2xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 mb-4">
          JOIN MATCH
        </button>
        <button onClick={() => setArenaState('setup')} className="w-full bg-slate-800 text-white font-black py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 border-slate-700 hover:bg-slate-700">
          HOST A MATCH
        </button>
      </div>
    </div>
  );
};

const AdminPanel = ({ currentUser, showToast }) => {
  const [activeTab, setActiveTab] = useState('cms');
  const [dataType, setDataType] = useState('units'); 
  const [grade, setGrade] = useState('5');
  const [unit, setUnit] = useState('1'); 
  const [jsonInput, setJsonInput] = useState("");
  
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushMsg, setPushMsg] = useState({ type: '', text: '' });
  
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [forceRebuild, setForceRebuild] = useState(false);
  const [audioProgress, setAudioProgress] = useState({ current: 0, total: 0, text: '' });
  
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
        if (!db) throw new Error("Firebase DB not initialized");
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = [];
        querySnapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
        setUsersList(users);
    } catch (e) { showToast("Error fetching users."); }
    setIsLoadingUsers(false);
  }

  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab]);

  const handleUpdateUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try { await updateDoc(doc(db, "users", userId), { role: newRole }); fetchUsers(); showToast("Updated successfully"); } catch(e) { showToast("Error updating"); }
  };

  const handleToggleBlockUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try { await updateDoc(doc(db, "users", userId), { status: newStatus }); fetchUsers(); showToast("Status updated"); } catch(e) { showToast("Error updating"); }
  };

  const handleFetchData = async () => {
    setIsFetchingData(true); setPushMsg({ type: '', text: '' });
    try {
      if (!db) throw new Error("Firebase is not connected.");
      let collectionName = dataType; let docId = "";
      if (dataType === 'syllabus') { collectionName = 'metadata'; docId = `syllabus_g${grade}`; } 
      else {
          let prefix = "";
          if (dataType === 'units') prefix = 'unit';
          if (dataType === 'practice') prefix = 'prac';
          if (dataType === 'extra') prefix = 'extra';
          if (dataType === 'tests') prefix = 'test';
          if (dataType === 'cambridge') prefix = 'cambridge';
          docId = `grade${grade}_${prefix}${unit}`;
      }
      const docSnap = await getDoc(doc(db, collectionName, docId));
      if (docSnap.exists()) {
          setJsonInput(JSON.stringify(docSnap.data(), null, 2));
          setPushMsg({ type: 'success', text: `✅ Đã tải thành công dữ liệu từ [${collectionName}/${docId}]` });
      } else {
          setJsonInput("");
          setPushMsg({ type: 'error', text: `❌ Không tìm thấy dữ liệu tại [${collectionName}/${docId}]` });
      }
    } catch (error) { setPushMsg({ type: 'error', text: `❌ Lỗi: ${error.message}` }); } 
    finally { setIsFetchingData(false); }
  };

  const handlePushData = async () => {
    setIsPushing(true); setPushMsg({ type: '', text: '' });
    try {
      if (!jsonInput.trim()) throw new Error("JSON data is empty!");
      const parsedData = JSON.parse(jsonInput);
      if (!db) throw new Error("Firebase is not connected.");
      let collectionName = dataType; let docId = "";
      if (dataType === 'syllabus') { collectionName = 'metadata'; docId = `syllabus_g${grade}`; } 
      else {
          let prefix = "";
          if (dataType === 'units') prefix = 'unit';
          if (dataType === 'practice') prefix = 'prac';
          if (dataType === 'extra') prefix = 'extra';
          if (dataType === 'tests') prefix = 'test';
          if (dataType === 'cambridge') prefix = 'cambridge';
          docId = `grade${grade}_${prefix}${unit}`;
      }
      await setDoc(doc(db, collectionName, docId), parsedData);
      setPushMsg({ type: 'success', text: `✅ Successfully pushed to [${collectionName}/${docId}]` });
    } catch (error) {
      if (error instanceof SyntaxError) setPushMsg({ type: 'error', text: `❌ Invalid JSON format.` });
      else setPushMsg({ type: 'error', text: `❌ Error: ${error.message}` });
    } finally { setIsPushing(false); }
  };

  const extractTextsFromJSON = (obj, textsSet = new Set()) => {
      if (!obj) return textsSet;
      if (Array.isArray(obj)) {
          obj.forEach(item => extractTextsFromJSON(item, textsSet));
      } else if (typeof obj === 'object') {
          // BỎ QUA CÂU "SPEAK"
          if (obj.type === 'speak') return textsSet;

          for (const key in obj) {
              if (['audioText', 'question', 'answer'].includes(key) && typeof obj[key] === 'string') {
                  if (obj[key].trim()) textsSet.add(obj[key].trim());
              } else if (['options', 'words'].includes(key) && Array.isArray(obj[key])) {
                  obj[key].forEach(val => { if (typeof val === 'string' && val.trim()) textsSet.add(val.trim()); });
              } else if (typeof obj[key] === 'object') {
                  extractTextsFromJSON(obj[key], textsSet);
              }
          }
      }
      return textsSet;
  };

  const handleGenerateAudioForJSON = async () => {
      if (!jsonInput.trim()) { showToast("Vui lòng dán JSON Data vào khung trước!"); return; }
      let apiKey = ""; 
      try { if (import.meta.env.VITE_GEMINI_API_KEY) apiKey = import.meta.env.VITE_GEMINI_API_KEY; } catch (e) {}
      if (!apiKey) { showToast("Thiếu VITE_GEMINI_API_KEY trong cấu hình Vercel!"); return; }

      setIsGeneratingAudio(true); setPushMsg({ type: '', text: '' });
      try {
          const parsedData = JSON.parse(jsonInput);
          const textsSet = extractTextsFromJSON(parsedData);
          const textsArray = Array.from(textsSet);
          
          if (textsArray.length === 0) {
              setPushMsg({ type: 'error', text: "Không tìm thấy nội dung cần đọc trong JSON." });
              setIsGeneratingAudio(false); return;
          }

          setAudioProgress({ current: 0, total: textsArray.length, text: 'Đang chuẩn bị quét Firebase...' });
          let successCount = 0; let skipCount = 0;

          for (let i = 0; i < textsArray.length; i++) {
              const currentText = textsArray[i].trim();
              setAudioProgress({ current: i + 1, total: textsArray.length, text: `Đang xử lý: ${currentText.substring(0, 30)}...` });
              const voiceName = VOICES[i % VOICES.length];
              const safeId = generateSafeId(currentText);

              if (!forceRebuild) {
                  const docSnap = await getDoc(doc(db, "audio_cache", safeId));
                  if (docSnap.exists()) { skipCount++; continue; }
              }

              let promptText = currentText;
              if (voiceName === "Puck" || voiceName === "Kore") promptText = `Say cheerfully: ${currentText}`;

              const payload = {
                  contents: [{ parts: [{ text: promptText }] }],
                  generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } } },
                  model: "gemini-2.5-flash-preview-tts"
              };

              try {
                  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                  });
                  
                  if (!response.ok) { 
                      if (response.status === 429) {
                          setPushMsg({ type: 'error', text: `❌ Quá tải 10 lượt/phút (Lỗi 429)! Đã lưu thành công ${successCount} audio. Vui lòng đợi 1 phút rồi bấm BUILD AUDIO lại.` });
                          setIsGeneratingAudio(false);
                          return;
                      } else {
                          const errData = await response.json();
                          const msg = errData.error?.message || `Lỗi HTTP ${response.status}`;
                          console.error(`Bỏ qua câu "${currentText}" do lỗi: ${msg}`);
                          continue; 
                      }
                  }

                  const data = await response.json();
                  const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
                  
                  if (inlineData) {
                      await setDoc(doc(db, "audio_cache", safeId), {
                          text: currentText, voice: voiceName, audioBase64: inlineData.data, updatedAt: new Date().toISOString()
                      });
                      successCount++;
                      
                      // KỶ LUẬT THÉP: Nghỉ 6.5s để đảm bảo < 10 lượt/phút
                      setAudioProgress({ current: i + 1, total: textsArray.length, text: `Thành công! Nghỉ 6.5s để né giới hạn API...` });
                      await new Promise(r => setTimeout(r, 6500)); 
                  }
              } catch (err) {
                  console.error(`Lỗi mạng khi đọc câu: "${currentText}". Bỏ qua. Lỗi: ${err.message}`);
              }
          }
          if (successCount > 0 || skipCount > 0) setPushMsg({ type: 'success', text: `✅ Hoàn tất: Tạo mới ${successCount}, Bỏ qua ${skipCount} (có sẵn trên Cloud).` });
      } catch (error) { setPushMsg({ type: 'error', text: `❌ Lỗi Hệ Thống: ${error.message}` }); } 
      finally { setIsGeneratingAudio(false); setAudioProgress({ current: 0, total: 0, text: '' }); }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in w-full h-full overflow-y-auto hide-scrollbar flex flex-col gap-6 relative z-10 pb-24 lg:pb-8">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-slate-200 shrink-0">
        <div className="p-6 bg-slate-900 text-white border-b-4 border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3"><ShieldAlert className="w-8 h-8 text-rose-500"/><h2 className="text-xl sm:text-2xl font-black">Admin Dashboard</h2></div>
        </div>
        <div className="flex flex-col sm:flex-row bg-slate-50 border-b border-slate-200">
           <button onClick={() => setActiveTab('cms')} className={`flex-1 py-3 sm:py-4 font-black text-sm sm:text-lg transition-colors ${activeTab === 'cms' ? 'text-blue-600 bg-white border-b-4 border-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>☁️ PUSH DATA</button>
           <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 sm:py-4 font-black text-sm sm:text-lg transition-colors ${activeTab === 'users' ? 'text-blue-600 bg-white border-b-4 border-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>👥 USERS</button>
        </div>
      </div>
      
      {activeTab === 'cms' && (
        <div className="bg-white rounded-[2rem] shadow-xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-col gap-4 bg-blue-50 p-4 sm:p-5 rounded-xl border border-blue-200">
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="w-full">
                    <label className="block text-sm font-bold text-blue-900 mb-2">Data Type</label>
                    <select value={dataType} onChange={e=>{setDataType(e.target.value); setJsonInput('');}} className="w-full bg-white border-2 border-blue-300 rounded-xl p-3 font-black text-slate-700 outline-none">
                      <option value="syllabus">6. Syllabus</option>
                      <option value="units">1. Standard Lesson</option>
                      <option value="practice">2. Practice Hub</option>
                      <option value="extra">3. Extra Exercises</option>
                      <option value="tests">4. 45-Min Test</option>
                      <option value="cambridge">5. Cambridge</option>
                    </select>
                 </div>
                 <div className="w-full">
                    <label className="block text-sm font-bold text-blue-900 mb-2">Grade</label>
                    <select value={grade} onChange={e=>setGrade(e.target.value)} className="w-full bg-white border-2 border-blue-300 rounded-xl p-3 font-black text-slate-700 outline-none">
                      {[1,2,3,4,5].map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                 </div>
                 <div className="w-full">
                    <label className="block text-sm font-bold text-blue-900 mb-2">Unit/Test ID</label>
                    <input type="text" value={unit} onChange={e=>setUnit(e.target.value)} disabled={dataType === 'syllabus'}
                      placeholder="e.g. 1, r1, f1" className="w-full bg-white border-2 border-blue-300 rounded-xl p-3 font-black text-slate-700 outline-none disabled:bg-slate-200" />
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-blue-200">
                 <button onClick={handleFetchData} disabled={isFetchingData || isPushing || isGeneratingAudio} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-black py-3.5 rounded-xl border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 shadow-lg text-sm sm:text-base">
                    {isFetchingData ? 'ĐANG TẢI...' : '📥 1. LẤY DATA SERVER'}
                 </button>
                 <button onClick={handlePushData} disabled={isFetchingData || isPushing || isGeneratingAudio} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 shadow-lg text-sm sm:text-base">
                    {isPushing ? 'PUSHING...' : '🚀 2. LƯU (PUSH) DATA'}
                 </button>
                 
                 <div className="w-full flex flex-col gap-2">
                     <button onClick={handleGenerateAudioForJSON} disabled={isFetchingData || isPushing || isGeneratingAudio} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3.5 rounded-xl border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 shadow-lg text-sm sm:text-base">
                        {isGeneratingAudio ? 'ĐANG TẠO...' : '🎧 3. BUILD AUDIO'}
                     </button>
                     <div className="flex items-center justify-center gap-2">
                        <input type="checkbox" id="forceRebuild" checked={forceRebuild} onChange={e=>setForceRebuild(e.target.checked)} className="w-4 h-4 cursor-pointer"/>
                        <label htmlFor="forceRebuild" className="text-xs font-bold text-purple-900 cursor-pointer">Ghi đè Audio cũ (Rebuild toàn bộ)</label>
                     </div>
                 </div>
             </div>

          </div>
          
          {pushMsg.text && (
            <div className={`p-4 rounded-xl font-bold border-2 text-sm sm:text-base ${pushMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
              {pushMsg.text}
            </div>
          )}

          {isGeneratingAudio && audioProgress.total > 0 && (
             <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                 <div className="flex justify-between text-purple-800 font-bold text-sm mb-2">
                     <span>{audioProgress.text}</span>
                     <span>{audioProgress.current} / {audioProgress.total}</span>
                 </div>
                 <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                     <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${(audioProgress.current / audioProgress.total) * 100}%` }}></div>
                 </div>
                 <p className="text-xs text-purple-600 font-medium mt-2 italic">*Hệ thống tự động nghỉ 6.5s sau mỗi câu để không bị Google chặn.</p>
             </div>
          )}

          <div className="flex-1 flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center px-1">
               <label className="font-black text-slate-700 flex items-center gap-2"><BookOpen className="w-5 h-5"/> JSON Data Payload</label>
            </div>
            <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)}
               className="w-full h-[300px] sm:h-[400px] bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm p-4 sm:p-5 rounded-2xl outline-none border-4 border-slate-800 shadow-inner hide-scrollbar"
               spellCheck="false" placeholder='Paste your formatted JSON code here...' />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[2rem] shadow-xl border-4 border-slate-200 p-4 sm:p-6 animate-fade-in flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-black text-slate-800">Platform Users</h3>
             <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors">
               <RotateCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`}/> Refresh
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-600 font-bold text-sm uppercase tracking-wider">
                  <th className="p-4 rounded-tl-xl">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                       <img src={u.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm"/>
                       <span className="font-bold text-slate-800">{u.name}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium text-sm">{u.email || 'N/A'}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${u.status === 'blocked' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.status || 'active'}</span></td>
                    <td className="p-4 flex gap-2">
                       {currentUser?.uid !== u.id && (
                         <>
                           <button onClick={() => handleUpdateUserRole(u.id, u.role)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-purple-500 hover:text-white transition-colors"><UserCog className="w-5 h-5"/></button>
                           <button onClick={() => handleToggleBlockUser(u.id, u.status)} className={`p-2 rounded-xl transition-colors ${u.status === 'blocked' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white' : 'bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white'}`}>{u.status === 'blocked' ? <Unlock className="w-5 h-5"/> : <Ban className="w-5 h-5"/>}</button>
                         </>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const OnboardingView = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      if (auth) await signInWithPopup(auth, provider);
      else setErrorMsg("Firebase Auth is missing.");
    } catch (error) { setErrorMsg(`Error: ${error.message}`); }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-purple-900/20"></div>
      <div className="z-10 bg-slate-950/60 backdrop-blur-2xl p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-md w-[90%]">
        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-3xl sm:rounded-[2rem] flex items-center justify-center mb-6 sm:mb-8"><Rocket className="w-10 h-10 sm:w-14 sm:h-14 text-white" /></div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">Global Explorer</h1>
        <p className="text-slate-400 font-medium text-sm sm:text-lg mb-6 sm:mb-8">Embark on a journey to master English.</p>
        {errorMsg && <div className="w-full p-3 sm:p-4 mb-4 sm:mb-6 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-400 font-bold text-xs sm:text-sm text-left">{errorMsg}</div>}
        <button onClick={handleGoogleLogin} className="w-full bg-white text-slate-900 font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 shadow-xl text-base sm:text-lg transition-transform active:scale-95">
          <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6" /> Login with Google
        </button>
      </div>
    </div>
  );
};

const MainLayout = ({ user, handleLogout, updateUser, showToast }) => {
  const [currentView, setCurrentView] = useState('grades'); 
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [syllabusConfig, setSyllabusConfig] = useState({ units: [], tests: [] });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [practiceCategory, setPracticeCategory] = useState(null); 
  const [currentSessionData, setCurrentSessionData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isUnderConstruction, setIsUnderConstruction] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.setAttribute('translate', 'no');
    if (!document.querySelector('meta[name="google"]')) {
       const meta = document.createElement('meta'); meta.name = 'google'; meta.content = 'notranslate';
       document.head.appendChild(meta);
    }
    document.body.classList.add('notranslate');
    const metaViewport = document.createElement('meta');
    metaViewport.name = "viewport"; metaViewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.appendChild(metaViewport);
    setDailyQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      const fetchSyllabus = async () => {
        setIsLoadingData(true);
        try {
          if (!db) throw new Error("Firebase DB not initialized");
          const snap = await getDoc(doc(db, "metadata", `syllabus_${selectedGrade.id}`));
          if (snap.exists()) setSyllabusConfig(snap.data());
          else setSyllabusConfig({ units: [], tests: [] });
        } catch (e) { setSyllabusConfig({ units: [], tests: [] }); } 
        finally { setIsLoadingData(false); }
      };
      fetchSyllabus();
    }
  }, [selectedGrade]);

  if (user?.status === 'blocked') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white animate-fade-in px-4">
         <div className="bg-slate-800 p-8 rounded-3xl text-center border-4 border-rose-500 shadow-2xl max-w-sm w-full">
            <Ban className="w-20 h-20 text-rose-500 mx-auto mb-4 animate-bounce"/> 
            <h1 className="text-3xl font-black mb-2">Account Blocked</h1>
            <button onClick={handleLogout} className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors">Logout</button>
         </div>
      </div>
    );
  }

  const navItems = [
    { id: 'grades', label: "Courses", icon: Library, color: 'text-emerald-400' },
    { id: 'practice', label: "Practice", icon: Dumbbell, color: 'text-blue-400' },
    { id: 'arena', label: "Syllabus Arena", icon: Swords, color: 'text-orange-400' },
    { id: 'leaderboard', label: "Leaderboard", icon: Crown, color: 'text-yellow-400' }
  ];
  if (user?.role === 'admin' || user?.role === 'superadmin') navItems.push({ id: 'admin', label: "Admin Panel", icon: ShieldAlert, color: 'text-rose-400' });

  const handleFetchAndPlay = async (collectionName, docIdPrefix, unitItem, targetType = null) => {
    setIsLoadingData(true);
    try {
      if(!db) throw new Error("Firebase DB not initialized");
      const docId = `grade${selectedGrade.id.replace('g', '')}_${docIdPrefix}${unitItem.id.replace('u', '')}`;
      const snap = await getDoc(doc(db, collectionName, docId));
      
      if(snap.exists()) {
        let data = snap.data();
        if (targetType) {
            if (data[targetType]) { setCurrentSessionData(data[targetType]); setCurrentView('gameModalOnly'); } 
            else setIsUnderConstruction(true);
        } else {
            setCurrentSessionData(data);
            if (collectionName === 'units') { setSelectedUnit(unitItem); setCurrentView('map'); } 
            else setCurrentView('gameModalOnly');
        }
      } else setIsUnderConstruction(true);
    } catch(err) { setIsUnderConstruction(true); } 
    finally { setIsLoadingData(false); }
  }

  const renderContent = () => {
    if(isLoadingData) return <div className="w-full h-full flex flex-col items-center justify-center text-white relative z-10"><Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-500 mb-4"/><h3 className="font-black text-lg sm:text-xl">Loading Cloud Data...</h3></div>;
    switch(currentView) {
      case 'grades': return <GradesView onSelectGrade={(g) => { setSelectedGrade(g); setCurrentView('units'); }} />;
      case 'units': return <UnitsView grade={selectedGrade} syllabus={syllabusConfig} onBack={() => setCurrentView('grades')} onSelectUnit={(u) => handleFetchAndPlay('units', 'unit', u)} user={user} />;
      case 'map': return <MapView grade={selectedGrade} unit={selectedUnit} onBack={() => setCurrentView('units')} user={user} updateUser={updateUser} currentUnitData={currentSessionData} />;
      case 'admin': return <AdminPanel currentUser={user} showToast={showToast} />;
      case 'practice': 
          if (!selectedGrade) return <GradesView onSelectGrade={(g) => { setSelectedGrade(g); setCurrentView('practice'); }} />;
          return <PracticeHub grade={selectedGrade} user={user} updateUser={updateUser} onSelectCategory={(cat) => { setPracticeCategory(cat); setCurrentView('listSelector'); }} />;
      case 'arena': return <ArenaView user={user} updateUser={updateUser} selectedGrade={selectedGrade || {id: 'g5', name: 'Grade 5'}} />;
      case 'leaderboard': return <LeaderboardView showToast={showToast} />;
      case 'listSelector':
          let icon = BookOpen; let color = "bg-gradient-to-r from-blue-500 to-indigo-600 border-indigo-800";
          let itemsList = syllabusConfig.units;
          if (practiceCategory === 'listening') { icon = Headphones; color = "bg-gradient-to-r from-teal-500 to-emerald-600 border-teal-800"; }
          if (practiceCategory === 'speaking') { icon = Mic; color = "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-800"; }
          if (practiceCategory === 'reading') { icon = BookOpen; color = "bg-gradient-to-r from-rose-500 to-pink-600 border-rose-800"; }
          if (practiceCategory === 'extra') { icon = Star; color = "bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-800"; }
          if (practiceCategory === 'tests') { icon = Timer; color = "bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-900"; itemsList = syllabusConfig.tests; }
          if (practiceCategory === 'cambridge') { icon = Medal; color = "bg-gradient-to-r from-amber-400 to-orange-500 border-amber-700"; itemsList = syllabusConfig.units; }
          return <GenericListSelector title={practiceCategory.toUpperCase()} grade={selectedGrade} items={itemsList} icon={icon} colorClass={color} onBack={() => { setPracticeCategory(null); setCurrentView('practice'); }} onSelect={(u) => { if (['listening', 'speaking', 'reading'].includes(practiceCategory)) handleFetchAndPlay('practice', 'prac', u, practiceCategory); else if (practiceCategory === 'extra') handleFetchAndPlay('extra', 'extra', u); else if (practiceCategory === 'tests') handleFetchAndPlay('tests', 'test_', u); else if (practiceCategory === 'cambridge') handleFetchAndPlay('cambridge', 'cambridge', u); }} />;
      case 'gameModalOnly':
          return (
             <div className="w-full h-full bg-slate-900 relative">
               <GameModal isOpen={true} onClose={() => setCurrentView(practiceCategory ? 'listSelector' : 'practice')} sessionData={currentSessionData} user={user} updateUser={updateUser} titleLabel={`${selectedGrade.name} - ${practiceCategory}`} onWin={() => { if(updateUser && user) updateUser({...user, inventory: {...user.inventory, stars: (user.inventory.stars || 0) + 20}}); setCurrentView(practiceCategory ? 'listSelector' : 'practice'); }} />
             </div>
          );
      default: return <GradesView onSelectGrade={(g) => {setSelectedGrade(g); setCurrentView('units')}} />;
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row h-screen w-screen overflow-hidden bg-[#0f172a] font-sans relative">
      <style>{globalStyles}</style>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[100px] lg:blur-[120px] animate-pulse-ring pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[80px] lg:blur-[100px] animate-pulse-ring pointer-events-none z-0" style={{animationDelay: '1s'}}></div>
      
      <aside className={`flex flex-row lg:flex-col bg-slate-950/80 lg:bg-slate-950/60 backdrop-blur-2xl border-t lg:border-t-0 lg:border-r border-white/10 transition-all duration-300 z-50 absolute bottom-0 left-0 right-0 lg:relative lg:w-16 hover:lg:w-64 h-16 lg:h-full group hide-scrollbar shrink-0 ${['map', 'gameModalOnly'].includes(currentView) ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-3 hidden lg:flex items-center h-16 border-b border-white/5 shrink-0 overflow-hidden">
          <div className="min-w-[40px] h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"><Rocket className="w-6 h-6 text-white" /></div>
          <div className="ml-3 transition-opacity duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100"><h1 className="text-lg font-black text-white tracking-wide">EXPLORER</h1></div>
        </div>
        <nav className="flex-1 flex flex-row lg:flex-col gap-1 lg:gap-2 p-1.5 lg:p-3 overflow-x-visible lg:overflow-y-auto hide-scrollbar justify-around lg:justify-start items-center lg:items-stretch w-full">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setPracticeCategory(null); setCurrentView(item.id); }} className={`flex items-center justify-center lg:justify-start p-2 lg:p-3 rounded-xl font-black text-xs lg:text-sm transition-all border border-transparent overflow-hidden flex-col lg:flex-row gap-1 lg:gap-0 w-16 lg:w-auto ${currentView === item.id ? 'bg-white/10 text-white shadow-inner border-white/10' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
              <item.icon className={`w-5 h-5 lg:w-6 lg:h-6 shrink-0 ${item.color}`} />
              <span className={`lg:ml-4 transition-all duration-300 whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 ${currentView === item.id ? 'block text-[9px] lg:text-sm' : 'hidden lg:block'}`}>{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="lg:hidden flex flex-col items-center justify-center p-2 rounded-xl font-black text-[9px] text-slate-500 hover:bg-rose-500 hover:text-white transition-all gap-1 w-16"><LogOut className="w-5 h-5 shrink-0" /><span>Logout</span></button>
        </nav>
        <div className="hidden lg:flex p-4 border-t border-white/5 flex-col gap-4 shrink-0 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-[1.5rem] border border-white/10 transition-all duration-500 overflow-hidden opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-64 flex flex-col items-center text-center gap-3">
            <div className={`p-3 rounded-2xl bg-white/5 ${dailyQuote.color}`}><dailyQuote.icon className="w-8 h-8" /></div>
            <p className={`text-sm font-black leading-snug ${dailyQuote.color}`}>"{dailyQuote.text}"</p>
          </div>
          <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 flex flex-col items-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Created by</p>
            <p className="text-sm text-blue-400 font-black">Mr. Khoa</p>
            <div className="flex items-center gap-1.5 mt-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl backdrop-blur-sm">
                <Phone className="w-3 h-3 text-emerald-400" />
                <p className="text-[10px] text-emerald-400 font-bold tracking-wide">0901637827</p>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold mt-1">Zalo / Viber</p>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center p-3 rounded-xl font-black text-slate-500 bg-slate-900 hover:bg-rose-500 hover:text-white transition-all overflow-hidden border border-transparent hover:border-rose-600 mt-1">
            <LogOut className="min-w-[24px] h-5" /> 
            <span className="ml-3 transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">Log Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        <TopMetricsBar user={user} />
        <div className="flex-1 overflow-hidden relative">{renderContent()}</div>
      </div>
      <UnderConstructionModal isOpen={isUnderConstruction} onClose={() => setIsUnderConstruction(false)} />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [globalToast, setGlobalToast] = useState("");

  const showToast = (msg) => {
      setGlobalToast(msg);
      setTimeout(() => setGlobalToast(""), 4000);
  };

  useEffect(() => {
    if (!auth) { setIsAuthChecking(false); return; }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await syncUserWithDb(firebaseUser);
        setUser(userProfile);
      } else { setUser(null); }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => { if (auth) await signOut(auth); setUser(null); };

  const updateUserAndDb = async (newUserData) => {
    setUser(newUserData); 
    if (db && newUserData) {
      try { 
        const cleanData = JSON.parse(JSON.stringify(newUserData));
        const targetUid = cleanData.uid || auth?.currentUser?.uid; 
        if (!targetUid) return;
        await setDoc(doc(db, "users", targetUid), cleanData, { merge: true }); 
      } 
      catch(e) { console.error("Firestore save failed:", e); }
    }
  };

  if (isAuthChecking) return <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center px-4"><div className="flex flex-col items-center gap-4 text-center"><Compass className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 animate-spin" /><p className="text-white font-black animate-pulse text-sm sm:text-base">Checking credentials...</p></div></div>;
  
  return (
    <>
      {globalToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-400 px-6 py-3 rounded-xl shadow-2xl z-[200] font-bold border border-emerald-500 animate-slide-up whitespace-nowrap">
              {globalToast}
          </div>
      )}
      {!user ? <OnboardingView /> : <MainLayout user={user} handleLogout={handleLogout} updateUser={updateUserAndDb} showToast={showToast} />}
    </>
  );
}