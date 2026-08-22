"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { scenarios } from "@/lib/training-data";

export default function LearningPathPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { router.push("/login"); } 
      else {
        onValue(ref(db, 'users/' + currentUser.uid), (snapshot) => {
          const data = snapshot.val() || { email: currentUser.email, completedModules: {} };
          setUser({ ...data, uid: currentUser.uid });
        });
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) return <div className="p-8 text-blue-600 font-bold">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Cybersecurity Training Path</h1>
      
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200"></div>

        {scenarios.map((scenario, index) => {
          const isCompleted = user.completedModules && user.completedModules[scenario.id];
          const isInProgress = user.lastModuleId === scenario.id && !isCompleted;
          const isLocked = index > 0 && !isCompleted && !isInProgress; // Basic locking logic
          
          return (
            <div key={scenario.id} className="relative flex items-center mb-8">
              {/* Node */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 ${
                isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                isInProgress ? 'bg-blue-50 border-blue-500 text-blue-600' : 
                'bg-white border-slate-300 text-slate-400'
              }`}>
                {isCompleted ? <i className="fas fa-check"></i> : String(index + 1).padStart(2, '0')}
              </div>

              {/* Card */}
              <div className={`ml-6 flex-1 p-5 rounded-xl border bg-white card-shadow ${isLocked ? 'opacity-60' : 'hover:border-blue-400 transition'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{scenario.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{scenario.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      isCompleted ? 'bg-green-100 text-green-700' : 
                      isInProgress ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {isCompleted ? "COMPLETED" : isInProgress ? "IN PROGRESS" : "LOCKED"}
                    </span>
                    <p className="text-xs font-bold text-red-500 mt-2">+{scenario.points} Points</p>
                  </div>
                </div>
                {!isLocked && (
                  <Link href={`/portal/train/${scenario.id}`} className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">
                    {isCompleted ? "Review Module" : "Start Assessment"} <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}