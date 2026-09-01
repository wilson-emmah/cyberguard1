"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { scenarios, getLevelName } from "@/lib/training-data";

export default function PortalDashboard() {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubUser = () => {};
    let unsubLb = () => {};
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { router.push("/login"); } 
      else {
        unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          setUser({ ...docSnap.data(), uid: currentUser.uid });
          setLoading(false);
        });
        const lbQuery = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(5));
        unsubLb = onSnapshot(lbQuery, (snapshot) => setLeaderboard(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
      }
    });
    return () => { unsubscribe(); unsubUser(); unsubLb(); };
  }, [router]);

  if (loading) return <div className="p-8 text-blue-600 font-bold">Loading secure portal...</div>;
  if (!user) return null;

  const completedCount = user.completedModules ? Object.keys(user.completedModules).length : 0;
  const progressPercent = Math.round((completedCount / scenarios.length) * 100);
  const levelName = getLevelName(user.level || 1);
  const continueTarget = scenarios.find(s => s.id === user.lastModuleId && !(user.completedModules && user.completedModules[s.id])) || scenarios.find(s => !user.completedModules || !user.completedModules[s.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">Welcome back, {user.email.split('@')[0]}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Continue your cybersecurity training.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level</p>
          <div className="flex items-end gap-2 mt-2"><p className="text-4xl font-black text-slate-900 dark:text-white">{String(user.level || 1).padStart(2, '0')}</p><p className="text-sm font-bold text-blue-600 mb-1">{levelName}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Points</p>
          <div className="flex items-end gap-2 mt-2"><p className="text-4xl font-black text-slate-900 dark:text-white">{user.points || 0}</p><p className="text-sm font-bold text-green-600 mb-1">Earned</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security Score</p>
          <div className="flex items-end gap-2 mt-2"><p className="text-4xl font-black text-slate-900 dark:text-white">{progressPercent}%</p><p className="text-sm font-bold text-blue-600 mb-1">Awareness</p></div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Training Progress</h2>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progressPercent}%` }}></div></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-right">{completedCount} of {scenarios.length} Scenarios Completed</p>
        {continueTarget && (
          <Link href={`/portal/train/${continueTarget.id}`} className="mt-6 block bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg p-4 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-slate-600 transition">
            <div><p className="text-xs font-bold text-blue-600 uppercase">Continue Learning</p><p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{continueTarget.title}</p><p className="text-xs text-slate-500 dark:text-slate-400">Your next recommended module</p></div>
            <div className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg flex items-center gap-2">Continue <i className="fas fa-arrow-right"></i></div>
          </Link>
        )}
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><i className="fas fa-trophy text-red-500"></i> Top Defenders</h2>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className={`flex items-center space-x-3 p-2 rounded-md ${entry.id === user.uid ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}>
              <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${index === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{index + 1}</span>
              <span className="text-sm font-medium text-slate-900 flex-1 truncate">{entry.id === user.uid ? "You" : entry.username}</span>
              <span className="text-sm font-semibold text-red-600">{entry.points || 0} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}