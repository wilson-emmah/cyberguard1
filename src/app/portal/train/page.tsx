"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection } from "firebase/firestore";

export default function LearningPathPage() {
  const [user, setUser] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    let unsubUser = () => {};
    let unsubScen = () => {};
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/login");
      else {
        unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => setUser({ ...docSnap.data(), uid: currentUser.uid }));
        unsubScen = onSnapshot(collection(db, 'scenarios'), (snapshot) => setScenarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
      }
    });
    return () => { unsubscribe(); unsubUser(); unsubScen(); };
  }, [router]);

  if (!user) return <div className="p-8 text-blue-600 font-bold">Loading...</div>;

  const levels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Cybersecurity Training Path</h1>
      {levels.map((level) => {
        const levelScenarios = scenarios.filter(s => s.level === level);
        if (levelScenarios.length === 0) return null;
        return (
          <div key={level} className="mb-12">
            <h2 className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-6 border-b pb-2 border-slate-200 dark:border-slate-700">{level} Level</h2>
            <div className="relative">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
              {levelScenarios.map((scenario) => {
                const isCompleted = user.completedModules && user.completedModules[scenario.id];
                return (
                  <div key={scenario.id} className="relative flex items-center mb-8">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-blue-500 border-blue-500 text-white'}`}>
                      {isCompleted ? <i className="fas fa-check"></i> : <i className="fas fa-play"></i>}
                    </div>
                    <div className="ml-6 flex-1 p-5 rounded-xl border bg-white dark:bg-slate-800 card-shadow hover:border-blue-400 transition">
                      <div className="flex justify-between items-center">
                        <div><h3 className="font-bold text-slate-900 dark:text-white text-lg">{scenario.title}</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{scenario.description}</p></div>
                        <div className="text-right"><span className={`text-xs font-bold px-2 py-1 rounded ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{isCompleted ? "COMPLETED" : "START"}</span><p className="text-xs font-bold text-red-500 mt-2">+{scenario.points} Points</p></div>
                      </div>
                      <Link href={`/portal/train/${scenario.id}`} className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">
                        {isCompleted ? "Review Module" : "Start Assessment"} <i className="fas fa-arrow-right ml-1"></i>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}