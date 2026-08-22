"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { scenarios, Scenario } from "@/lib/training-data";

export default function TrainingModule() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [emailAction, setEmailAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  useEffect(() => {
    const sc = scenarios.find(s => s.id === moduleId);
    setScenario(sc || null);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push("/login"); } 
      else {
        const userRef = ref(db, 'users/' + currentUser.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) { 
          setUser({ ...snapshot.val(), uid: currentUser.uid }); 
          if (snapshot.val().lastModuleId !== moduleId) { await update(userRef, { lastModuleId: moduleId }); }
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [moduleId, router]);

  const handleSubmit = (index: number | "safe" | "phishing") => {
    if (feedback || pointsAwarded) return;
    
    let isCorrect = false;
    if (scenario?.type === 'email') {
      setEmailAction(index as string);
      isCorrect = index === "phishing";
    } else {
      setSelectedAnswer(index as number);
      isCorrect = index === scenario?.correctAnswer;
    }

    if (isCorrect) { setFeedback("correct"); awardPoints(); } 
    else { setFeedback("incorrect"); }
  };

  const awardPoints = async () => {
    if (!user || !scenario || pointsAwarded) return;
    if (user.completedModules && user.completedModules[scenario.id]) { setPointsAwarded(true); return; }

    const newPoints = (user.points || 0) + scenario.points;
    const newLevel = Math.floor(newPoints / 100) + 1;
    const username = user.email.split('@')[0];

    const updates: any = {};
    updates[`users/${user.uid}/points`] = newPoints;
    updates[`users/${user.uid}/level`] = newLevel;
    updates[`users/${user.uid}/completedModules/${scenario.id}`] = true;
    updates[`leaderboard/${user.uid}/points`] = newPoints;
    updates[`leaderboard/${user.uid}/username`] = username;

    try { await update(ref(db), updates); setUser({ ...user, points: newPoints, level: newLevel }); setPointsAwarded(true); } 
    catch (error) { console.error("Error updating points:", error); }
  };

  if (loading) return <div className="p-8 text-blue-600 font-bold">Loading assessment...</div>;
  if (!scenario) return <div className="p-8 text-center text-red-500 font-bold">Module not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/portal/train" className="text-blue-600 font-bold text-sm mb-6 inline-flex items-center gap-2 hover:gap-3 transition-all">
        <i className="fas fa-arrow-left"></i> Back to Learning Path
      </Link>
      
      <div className="bg-white p-8 rounded-xl border border-slate-200 card-shadow">
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">{scenario.title} — Assessment</h1>
        <p className="text-sm text-slate-500 mt-1">Question 01 / 01</p>
        
        <div className="mt-8">
          {scenario.type === 'email' && (
            <div>
              <p className="font-bold text-slate-900 mb-4">Analyze the following email:</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <div className="p-4 border-b bg-white"><p className="text-xs text-slate-500 font-bold uppercase">From</p><p className="text-slate-900 font-bold">{scenario.sender}</p></div>
                <div className="p-4 border-b bg-white"><p className="text-xs text-slate-500 font-bold uppercase">Subject</p><p className="text-slate-900 font-bold">{scenario.subject}</p></div>
                <div className="p-4"><p className="text-slate-700 text-sm leading-relaxed">{scenario.body}</p></div>
              </div>
              <p className="font-bold text-slate-900 mt-6 mb-4">What is your assessment?</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSubmit('safe')} disabled={feedback !== null} className={`py-3 rounded-lg font-bold border-2 transition ${emailAction === 'safe' ? (feedback === 'incorrect' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700') : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'} disabled:cursor-not-allowed`}><i className="fas fa-check-circle mr-2"></i> Legitimate Email</button>
                <button onClick={() => handleSubmit('phishing')} disabled={feedback !== null} className={`py-3 rounded-lg font-bold border-2 transition ${emailAction === 'phishing' ? (feedback === 'correct' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700') : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'} disabled:cursor-not-allowed`}><i className="fas fa-exclamation-triangle mr-2"></i> Phishing Attempt</button>
              </div>
            </div>
          )}
          {scenario.type !== 'email' && scenario.question && (
            <div>
              <p className="font-bold text-slate-900 mb-4 text-lg">{scenario.question}</p>
              <div className="space-y-3">
                {scenario.options?.map((opt, idx) => (
                  <button key={idx} onClick={() => handleSubmit(idx)} disabled={feedback !== null} className={`w-full text-left p-4 rounded-lg border-2 transition flex items-center gap-3 ${selectedAnswer === idx ? (feedback === 'correct' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700') : 'bg-white border-slate-200 hover:border-slate-400 text-slate-900'} disabled:cursor-not-allowed`}>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${selectedAnswer === idx ? 'border-current' : 'border-slate-300'}`}>
                      {selectedAnswer === idx && <i className="fas fa-circle text-[8px]"></i>}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instant Feedback Area */}
      {feedback && (
        <div className={`mt-6 p-6 rounded-xl border-2 ${feedback === 'correct' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <i className={`fas ${feedback === 'correct' ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'} text-2xl`}></i>
            <h3 className={`text-lg font-black ${feedback === 'correct' ? 'text-green-800' : 'text-red-800'}`}>{feedback === 'correct' ? 'CORRECT' : 'INCORRECT'}</h3>
          </div>
          
          {feedback === 'correct' ? (
            <>
              <p className="text-green-700 mb-4 text-sm">{scenario.redFlags?.[0] || "You correctly identified the security threat."}</p>
              <p className="text-green-800 font-bold text-xl">+{scenario.points} POINTS</p>
            </>
          ) : (
            <div className="text-red-700 mb-4">
              <p className="font-bold mb-2 text-sm">Threat indicators missed:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {scenario.redFlags?.map((flag, i) => <li key={i}>{flag}</li>)}
                {scenario.type !== 'email' && <li>The correct answer was: {scenario.options?.[scenario.correctAnswer || 0]}</li>}
              </ul>
            </div>
          )}
          
          <div className="flex gap-4 mt-6">
            <Link href="/portal/train" className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition text-sm">Back to Path</Link>
            {feedback === 'incorrect' && <button onClick={() => { setFeedback(null); setSelectedAnswer(null); setEmailAction(null); }} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition text-sm">Try Again</button>}
          </div>
        </div>
      )}
    </div>
  );
}