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
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.email.split('@')[0]}</h1>
        <p className="text-sm text-slate-500 mt-1">Continue your cybersecurity training.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Level</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-4xl font-black text-slate-900">{String(user.level || 1).padStart(2, '0')}</p>
            <p className="text-sm font-bold text-blue-600 mb-1">{levelName}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Points</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-4xl font-black text-slate-900">{user.points || 0}</p>
            <p className="text-sm font-bold text-green-600 mb-1">Earned</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Score</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-4xl font-black text-slate-900">{progressPercent}%</p>
            <p className="text-sm font-bold text-blue-600 mb-1">Awareness</p>
          </div>
        </div>
      </div>

      {/* Progress & Continue Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 card-shadow">
          <h2 className="text-base font-bold text-slate-900 mb-4">Training Progress</h2>
          <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 text-right">{completedCount} of {scenarios.length} Scenarios Completed</p>
          
          {continueTarget && (
            <Link href={`/portal/train/${continueTarget.id}`} className="mt-6 block bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:bg-blue-100 transition">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase">Continue Learning</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{continueTarget.title}</p>
              </div>
              <i className="fas fa-arrow-right text-blue-600"></i>
            </Link>
          )}
        </div>

        {/* Tasks & Activity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
          <h2 className="text-base font-bold text-slate-900 mb-4">Security Tasks</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-slate-600"><i className="fas fa-check-circle text-green-500"></i> Complete phishing assessment</li>
            <li className="flex items-center gap-2 text-slate-600"><i className="fas fa-check-circle text-green-500"></i> Check suspicious URL</li>
            <li className="flex items-center gap-2 text-slate-400"><i className="far fa-circle"></i> Complete malware assessment</li>
            <li className="flex items-center gap-2 text-slate-400"><i className="far fa-circle"></i> Complete final assessment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}