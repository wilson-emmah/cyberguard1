"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function AdminScenarios() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [level, setLevel] = useState("Beginner");
  const [type, setType] = useState("multiple-choice");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(50);
  
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [redFlags, setRedFlags] = useState("");
  
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'scenarios'), (snapshot) => {
      setScenarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newScenario: any = { level, type, title, description, points: Number(points) };

      if (type === 'email') {
        newScenario.sender = sender;
        newScenario.subject = subject;
        newScenario.body = body;
        newScenario.redFlags = redFlags.split(',').map((f: string) => f.trim());
      } else {
        newScenario.question = question;
        newScenario.options = options;
        newScenario.correctAnswer = Number(correctAnswer);
      }

      // Add to Firestore 'scenarios' collection
      await addDoc(collection(db, 'scenarios'), newScenario);
      alert("Scenario uploaded successfully!");
      setTitle(""); setDescription(""); setSender(""); setSubject(""); setBody(""); setRedFlags(""); setQuestion("");
      
    } catch (error) {
      alert("Failed to upload scenario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Scenario Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4">Create New Scenario</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Difficulty Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Scenario Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="email">Phishing Email</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Points</label>
                <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="e.g. Advanced Phishing Simulation" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="Brief description" required />
            </div>

            {type === 'email' ? (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Sender Email</label><input type="text" value={sender} onChange={(e) => setSender(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="IT-Support <it@fake.com>" required /></div>
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg" required /></div>
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Body</label><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg" required /></div>
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Red Flags (Comma separated)</label><input type="text" value={redFlags} onChange={(e) => setRedFlags(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="Fake domain, Urgency, Mismatch URL" required /></div>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Question</label><input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg" required /></div>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={correctAnswer === i} onChange={() => setCorrectAnswer(i)} className="w-4 h-4" />
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg" placeholder={`Option ${i + 1}`} required />
                  </div>
                ))}
                <p className="text-xs text-slate-500">Select the radio button for the correct answer.</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
              {loading ? "Uploading..." : "Upload Scenario to Database"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4">Active Scenarios ({scenarios.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {scenarios.map(s => (
              <div key={s.id} className="p-3 border border-slate-200 rounded-lg">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.level === 'Beginner' ? 'bg-green-100 text-green-700' : s.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.level}</span>
                <p className="font-bold text-slate-800 mt-1 text-sm">{s.title}</p>
                <p className="text-xs text-slate-500">+{s.points} pts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}