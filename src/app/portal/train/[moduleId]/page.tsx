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
      if (!currentUser) { 
        router.push("/login"); 
      } else {
        const userRef = ref(db, 'users/' + currentUser.uid);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) { 
          setUser({ ...snapshot.val(), uid: currentUser.uid }); 
          if (snapshot.val().lastModuleId !== moduleId) { 
            await update(userRef, { lastModuleId: moduleId }); 
          }
        } else {
          setUser({ email: currentUser.email, points: 0, level: 1, uid: currentUser.uid, completedModules: {} });
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [moduleId, router]);

  const handleMultipleChoice = (index: number) => {
    if (feedback || pointsAwarded) return;
    setSelectedAnswer(index);
    if (scenario && index === scenario.correctAnswer) { setFeedback("correct"); awardPoints(); } 
    else { setFeedback("incorrect"); }
  };

  const handleEmailAction = (action: "safe" | "phishing") => {
    if (feedback || pointsAwarded) return;
    setEmailAction(action);
    if (action === "phishing") { setFeedback("correct"); awardPoints(); } 
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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-blue-500 font-bold">Loading training module...</div>;
  if (!scenario) return <div className="p-8 text-center text-red-500 font-bold">Module not found.</div>;

  return (
    <div className="min-h-[80vh] bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/portal" className="text-blue-600 font-bold text-sm mb-4 inline-flex items-center gap-2 hover:gap-3 transition-all"><i className="fas fa-arrow-left"></i> Back to Dashboard</Link>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-slate-900">{scenario.title}</h1>
            <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">+{scenario.points} Points</span>
          </div>
          <p className="text-slate-500 mt-2">{scenario.description}</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          {scenario.type === 'email' && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Inbox Preview</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-slate-50"><p className="text-xs text-slate-500 font-bold uppercase">From</p><p className="text-slate-900 font-bold">{scenario.sender}</p></div>
                <div className="p-4 border-b"><p className="text-xs text-slate-500 font-bold uppercase">Subject</p><p className="text-slate-900 font-bold">{scenario.subject}</p></div>
                <div className="p-4"><p className="text-slate-700 text-sm leading-relaxed">{scenario.body}</p></div>
              </div>
              <div className="mt-6 flex gap-4">
                <button onClick={() => handleEmailAction('safe')} disabled={feedback !== null} className={`flex-1 py-3 rounded-lg font-bold border transition ${emailAction === 'safe' ? (feedback === 'incorrect' ? 'bg-red-100 border-red-300 text-red-700' : 'bg-green-100 border-green-300 text-green-700') : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'} disabled:cursor-not-allowed`}><i className="fas fa-check-circle mr-2"></i> Looks Safe</button>
                <button onClick={() => handleEmailAction('phishing')} disabled={feedback !== null} className={`flex-1 py-3 rounded-lg font-bold border transition ${emailAction === 'phishing' ? (feedback === 'correct' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700') : 'bg-white border-red-300 text-red-700 hover:bg-red-50'} disabled:cursor-not-allowed`}><i className="fas fa-exclamation-triangle mr-2"></i> Report Phishing</button>
              </div>
            </div>
          )}
          {scenario.type !== 'email' && scenario.question && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">{scenario.question}</h3>
              <div className="space-y-3">
                {scenario.options?.map((opt, idx) => (
                  <button key={idx} onClick={() => handleMultipleChoice(idx)} disabled={feedback !== null} className={`w-full text-left p-4 rounded-lg border transition ${selectedAnswer === idx ? (feedback === 'correct' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700') : 'bg-white border-slate-200 hover:border-slate-400 text-slate-900'} disabled:cursor-not-allowed`}>{opt}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {feedback && (
          <div className={`mt-6 p-6 rounded-xl border ${feedback === 'correct' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <i className={`fas ${feedback === 'correct' ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'} text-2xl`}></i>
              <h3 className={`text-xl font-black ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>{feedback === 'correct' ? 'Correct!' : 'Incorrect!'}</h3>
            </div>
            {feedback === 'correct' ? (
              <p className="text-green-600 mb-4">You correctly identified the threat. {pointsAwarded ? `${scenario.points} points have been added to your account.` : 'You had already completed this module.'}</p>
            ) : (
              <div className="text-red-600 mb-4">
                <p className="font-bold mb-2">This was a threat! Here are the red flags you missed:</p>
                <ul className="list-disc list-inside space-y-1">
                  {scenario.redFlags?.map((flag, i) => <li key={i}>{flag}</li>)}
                  {scenario.type !== 'email' && <li>The correct answer was: {scenario.options?.[scenario.correctAnswer || 0]}</li>}
                </ul>
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <Link href="/portal" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Back to Dashboard</Link>
              {feedback === 'incorrect' && <button onClick={() => { setFeedback(null); setSelectedAnswer(null); setEmailAction(null); }} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition">Try Again</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}