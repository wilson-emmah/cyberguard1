"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { scenarios, getLevelName } from "@/lib/training-data";

export default function PortalDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { router.push("/login"); } 
      else {
        onValue(ref(db, 'users/' + currentUser.uid), (snapshot) => {
          const data = snapshot.val() || { email: currentUser.email, points: 0, level: 1, completedModules: {} };
          setUser({ ...data, uid: currentUser.uid });
          setLoading(false);
        });
      }
    });
    return () => unsubscribe();
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow transition-colors duration-200">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-4xl font-black text-slate-900 dark:text-white">{String(user.level || 1).padStart(2, '0')}</p>
            <p className="text-sm font-bold text-blue-600 mb-1">{levelName}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow transition-colors duration-200">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Points</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-4xl font-black text-slate-900 dark:text-white">{user.points || 0}</p>
            <p className="text-sm font-bold text-green-600 mb-1">Earned</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow transition-colors duration-200">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security Score</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-4xl font-black text-slate-900 dark:text-white">{progressPercent}%</p>
            <p className="text-sm font-bold text-blue-600 mb-1">Awareness</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow transition-colors duration-200">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Training Progress</h2>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
          <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-right">{completedCount} of {scenarios.length} Scenarios Completed</p>
        
        {continueTarget && (
          <Link href={`/portal/train/${continueTarget.id}`} className="mt-6 block bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg p-4 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-slate-600 transition">
            <div className="flex items-center gap-4">
              <i className="fas fa-lock text-blue-600 text-xl"></i>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{continueTarget.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your next recommended module</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg flex items-center gap-2">
              Continue <i className="fas fa-arrow-right"></i>
            </div>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow transition-colors duration-200">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Security Tasks</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-slate-500 dark:text-slate-400 line-through">
              <i className="fas fa-check-circle text-green-500"></i> Complete phishing assessment
            </li>
            <li className="flex items-center gap-2 text-slate-500 dark:text-slate-400 line-through">
              <i className="fas fa-check-circle text-green-500"></i> Check suspicious URL
            </li>
            <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <i className="far fa-circle text-slate-300 dark:text-slate-500"></i> Complete malware assessment
            </li>
            <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <i className="far fa-circle text-slate-300 dark:text-slate-500"></i> Complete final assessment
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow transition-colors duration-200">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Phishing assessment completed
            </li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Badge earned
            </li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Password security module completed
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}