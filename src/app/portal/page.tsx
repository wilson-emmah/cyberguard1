"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { scenarios, badges } from "@/lib/training-data";
import AIChat from "@/components/AIChat";

export default function PortalDashboard() {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubUser = () => {};
    let unsubLeaderboard = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { 
        router.push("/login"); 
      } else {
        const userRef = ref(db, 'users/' + currentUser.uid);
        unsubUser = onValue(userRef, (snapshot) => {
          const data = snapshot.val() || { email: currentUser.email, points: 0, level: 1, completedModules: {} };
          setUser({ ...data, uid: currentUser.uid }); 
          setLoading(false);
        });

        const leaderboardQuery = query(ref(db, 'leaderboard'), orderByChild('points'), limitToLast(5));
        unsubLeaderboard = onValue(leaderboardQuery, (snapshot) => {
          const lbData = snapshot.val() ? Object.keys(snapshot.val()).map(key => ({ id: key, ...snapshot.val()[key] })) : [];
          lbData.sort((a, b) => b.points - a.points); 
          setLeaderboard(lbData);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubUser();
      unsubLeaderboard();
    };
  }, [router]);

  const handleLogout = async () => { 
    await signOut(auth); 
    router.push("/"); 
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-blue-500 font-bold">Loading secure portal...</div>;
  if (!user) return null;

  const completedCount = user.completedModules ? Object.keys(user.completedModules).length : 0;
  const progressPercent = Math.round((completedCount / scenarios.length) * 100);
  const continueTarget = scenarios.find(s => s.id === user.lastModuleId && !(user.completedModules && user.completedModules[s.id])) || scenarios.find(s => !user.completedModules || !user.completedModules[s.id]);

  return (
    <div className="min-h-[80vh] bg-blue-50 p-6 relative pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Security Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Level {user.level} Defender | {user.points} Points</p>
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/portal/profile" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"><i className="fas fa-user-pen"></i> Edit Profile</Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"><i className="fas fa-right-from-bracket"></i> Sign Out</button>
          </div>
        </div>

        {continueTarget && (
          <Link href={`/portal/train/${continueTarget.id}`} className="block mb-8 bg-white border-2 border-blue-500 rounded-xl p-6 shadow-sm hover:shadow-md transition group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl"><i className={`fas ${continueTarget.type === 'email' ? 'fa-fish' : continueTarget.type === 'password' ? 'fa-key' : continueTarget.type === 'url' ? 'fa-link' : 'fa-brain'}`}></i></div>
                <div>
                  <p className="text-xs text-red-500 font-bold uppercase mb-1">Resume Training</p>
                  <h3 className="text-xl font-black text-slate-900">{continueTarget.title}</h3>
                  <p className="text-sm text-slate-500">{continueTarget.description}</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg group-hover:bg-blue-700 transition flex items-center gap-2 text-sm"><i className="fas fa-play"></i> Resume</div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-slate-900">Training Progress</h2>
              <span className="text-sm font-medium text-blue-600">{completedCount} of {scenarios.length} Completed</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div></div>
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-medium text-slate-700 mb-4">Achievements</h3>
              <div className="flex space-x-6">
                {badges.map(badge => {
                  const earned = badge.id === "first_steps" ? completedCount >= 1 : badge.id === "defender" ? user.level >= 2 : false;
                  return (
                    <div key={badge.id} className={`flex flex-col items-center ${!earned ? 'opacity-40' : ''}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${earned ? 'bg-blue-100 border border-blue-300 text-blue-600' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}><i className={`fas ${badge.icon}`}></i></div>
                      <p className="text-xs font-medium text-slate-700">{badge.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Top Defenders</h2>
              <i className="fas fa-trophy text-red-500"></i>
            </div>
            <div className="space-y-3">
              {leaderboard.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No leaderboard data yet.</p>}
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className={`flex items-center space-x-3 p-2 rounded-md ${entry.id === user.uid ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}>
                  <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${index === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{index + 1}</span>
                  <span className="text-sm font-medium text-slate-900 flex-1 truncate">{entry.id === user.uid ? "You" : entry.username}</span>
                  <span className="text-sm font-semibold text-red-600">{entry.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Training Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => {
            const isCompleted = user.completedModules && user.completedModules[scenario.id];
            const isInProgress = user.lastModuleId === scenario.id && !isCompleted;
            return (
              <div key={scenario.id} className={`bg-white border rounded-lg p-6 card-shadow transition ${isCompleted ? 'border-green-300 bg-green-50' : isInProgress ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}><i className={`fas ${scenario.type === 'email' ? 'fa-fish' : scenario.type === 'password' ? 'fa-key' : scenario.type === 'url' ? 'fa-link' : scenario.type === 'malware' ? 'fa-virus' : 'fa-brain'}`}></i></div>
                  {isCompleted ? <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">COMPLETED</span> : isInProgress ? <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">IN PROGRESS</span> : <span className="text-xs font-medium text-slate-400">NOT STARTED</span>}
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{scenario.title}</h3>
                <p className="mt-1 text-sm text-slate-500 mb-4">{scenario.description}</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-red-600">+{scenario.points} Points</span>
                  <Link href={`/portal/train/${scenario.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">{isCompleted ? "Review" : isInProgress ? "Resume" : "Start"}</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AIChat />
    </div>
  );
}