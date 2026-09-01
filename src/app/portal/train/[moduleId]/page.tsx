"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function TrainingModule() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;
  const [scenario, setScenario] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [emailAction, setEmailAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  useEffect(() => {
    const fetchScenario = async () => {
      const scenarioDoc = await getDoc(doc(db, 'scenarios', moduleId));
      if (scenarioDoc.exists()) setScenario({ id: scenarioDoc.id, ...scenarioDoc.data() });
      setLoading(false);
    };
    fetchScenario();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) router.push("/login");
      else {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), uid: currentUser.uid });
          if (userDoc.data().lastModuleId !== moduleId) await updateDoc(doc(db, 'users', currentUser.uid), { lastModuleId: moduleId });
        }
      }
    });
    return () => unsubscribe();
  }, [moduleId, router]);

  const handleSubmit = (index: number | "safe" | "phishing") => {
    if (feedback || pointsAwarded) return;
    let isCorrect = false;
    if (scenario?.type === 'email') { setEmailAction(index as string); isCorrect = index === "phishing"; } 
    else { setSelectedAnswer(index as number); isCorrect = index === scenario?.correctAnswer; }
    if (isCorrect) { setFeedback("correct"); awardPoints(); } else { setFeedback("incorrect"); }
  };

  const awardPoints = async () => {
    if (!user || !scenario || pointsAwarded) return;
    if (user.completedModules && user.completedModules[scenario.id]) { setPointsAwarded(true); return; }
    const newPoints = (user.points || 0) + scenario.points;
    const newLevel = Math.floor(newPoints / 100) + 1;
    try {
      await updateDoc(doc(db, 'users', user.uid), { points: newPoints, level: newLevel, [`completedModules.${scenario.id}`]: true });
      await updateDoc(doc(db, 'leaderboard', user.uid), { points: newPoints });
      setUser({ ...user, points: newPoints, level: newLevel });
      setPointsAwarded(true);
    } catch (error) { console.error("Error updating points:", error); }
  };

  if (loading) return <div className="p-8 text-blue-600 font-bold">Loading assessment...</div>;
  if (!scenario) return <div className="p-8 text-center text-red-500 font-bold">Module not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/portal/train" className="text-blue-600 font-bold text-sm mb-6 inline-flex items-center gap-2 hover:gap-3 transition-all"><i className="fas fa-arrow-left"></i> Back to Learning Path</Link>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow">
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide">{scenario.title} — Assessment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Question 01 / 01</p>
        <div className="mt-8">
          {scenario.type === 'email' && (
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-4">Analyze the following email:</p>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                <div className="p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800"><p className="text-xs text-slate-500 font-bold uppercase">From</p><p className="text-slate-900 dark:text-white font-bold">{scenario.sender}</p></div>
                <div className="p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800"><p className="text-xs text-slate-500 font-bold uppercase">Subject</p><p className="text-slate-900 dark:text-white font-bold">{scenario.subject}</p></div>
                <div className="p-4"><p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{scenario.body}</p></div>
              </div>
              <p className="font-bold text-slate-900 dark:text-white mt-6 mb-4">What is your assessment?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => handleSubmit('safe')} disabled={feedback !== null} className={`py-3 rounded-lg font-bold border-2 transition ${emailAction === 'safe' ? (feedback === 'incorrect' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700') : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-slate-400'} disabled:cursor-not-allowed`}><i className="fas fa-check-circle mr-2"></i> Legitimate Email</button>
                <button onClick={() => handleSubmit('phishing')} disabled={feedback !== null} className={`py-3 rounded-lg font-bold border-2 transition ${emailAction === 'phishing' ? (feedback === 'correct' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700') : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-slate-400'} disabled:cursor-not-allowed`}><i className="fas fa-exclamation-triangle mr-2"></i> Phishing Attempt</button>
              </div>
            </div>
          )}
          {scenario.type !== 'email' && scenario.question && (
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-4 text-lg">{scenario.question}</p>
              <div className="space-y-3">
                {scenario.options?.map((opt: string, idx: number) => (
                  <button key={idx} onClick={() => handleSubmit(idx)} disabled={feedback !== null} className={`w-full text-left p-4 rounded-lg border-2 transition flex items-center gap-3 ${selectedAnswer === idx ? (feedback === 'correct' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700') : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-slate-400 text-slate-900 dark:text-white'} disabled:cursor-not-allowed`}>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${selectedAnswer === idx ? 'border-current' : 'border-slate-300 dark:border-slate-500'}`}>{selectedAnswer === idx && <i className="fas fa-circle text-[8px]"></i>}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {feedback && (
        <div className={`mt-6 p-6 rounded-xl border-2 ${feedback === 'correct' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3 mb-3"><i className={`fas ${feedback === 'correct' ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'} text-2xl`}></i><h3 className={`text-lg font-black ${feedback === 'correct' ? 'text-green-800' : 'text-red-800'}`}>{feedback === 'correct' ? 'CORRECT' : 'INCORRECT'}</h3></div>
          {feedback === 'correct' ? (<><p className="text-green-700 mb-4 text-sm">{scenario.redFlags?.[0] || "You correctly identified the security threat."}</p><p className="text-green-800 font-bold text-xl">+{scenario.points} POINTS</p></>) : (<div className="text-red-700 mb-4"><p className="font-bold mb-2 text-sm">Threat indicators missed:</p><ul className="list-disc list-inside space-y-1 text-sm">{scenario.redFlags?.map((flag: string, i: number) => <li key={i}>{flag}</li>)}{scenario.type !== 'email' && <li>The correct answer was: {scenario.options?.[scenario.correctAnswer]}</li>}</ul></div>)}
          <div className="flex gap-4 mt-6"><Link href="/portal/train" className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition text-sm">Back to Path</Link>{feedback === 'incorrect' && <button onClick={() => { setFeedback(null); setSelectedAnswer(null); setEmailAction(null); }} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition text-sm">Try Again</button>}</div>
        </div>
      )}
    </div>
  );
}