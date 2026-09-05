"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";

export default function AdminScenarios() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [category, setCategory] = useState("Phishing");
  const [level, setLevel] = useState("Beginner");
  const [type, setType] = useState("multiple-choice");
  const [points, setPoints] = useState(50);
  const [timeLimit, setTimeLimit] = useState(60);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  
  const [explanation, setExplanation] = useState("");
  const [warningSigns, setWarningSigns] = useState("");
  const [threatTypes, setThreatTypes] = useState<string[]>(["Phishing"]);
  const [recommendedAction, setRecommendedAction] = useState("");
  const [status, setStatus] = useState("Active");

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

  const handleThreatTypeChange = (threat: string) => {
    if (threatTypes.includes(threat)) {
      setThreatTypes(threatTypes.filter(t => t !== threat));
    } else {
      setThreatTypes([...threatTypes, threat]);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle(""); setDescription(""); setQuestion(""); setOptions(["", "", "", ""]); 
    setExplanation(""); setWarningSigns(""); setRecommendedAction(""); setThreatTypes(["Phishing"]);
  };

  const handleEdit = (s: any) => {
    setEditId(s.id);
    setCategory(s.category || "Phishing");
    setLevel(s.level);
    setType(s.type);
    setPoints(s.points);
    setTimeLimit(s.timeLimit || 60);
    setTitle(s.title);
    setDescription(s.description);
    setQuestion(s.question || "");
    setOptions(s.options || ["", "", "", ""]);
    setCorrectAnswer(s.correctAnswer || 0);
    setExplanation(s.explanation || "");
    setWarningSigns(s.warningSigns ? s.warningSigns.join(", ") : "");
    setThreatTypes(s.threatTypes || ["Phishing"]);
    setRecommendedAction(s.recommendedAction || "");
    setStatus(s.status || "Active");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scenarioData: any = {
        category, level, type, points: Number(points), timeLimit: Number(timeLimit),
        title, description, explanation, 
        warningSigns: warningSigns.split(',').map((f: string) => f.trim()).filter(Boolean),
        threatTypes, recommendedAction, status
      };

      if (type === 'email') {
        scenarioData.question = question; 
      } else {
        scenarioData.question = question;
        scenarioData.options = options;
        scenarioData.correctAnswer = Number(correctAnswer);
      }

      if (editId) {
        await updateDoc(doc(db, 'scenarios', editId), scenarioData);
        alert("Scenario updated successfully!");
      } else {
        await addDoc(collection(db, 'scenarios'), scenarioData);
        alert("Scenario uploaded successfully!");
      }
      
      resetForm();
    } catch (error) {
      alert("Failed to save scenario.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this scenario?")) {
      await deleteDoc(doc(db, 'scenarios', id));
      alert("Scenario deleted.");
    }
  };

  const toggleStatus = async (s: any) => {
    const newStatus = s.status === 'Inactive' ? 'Active' : 'Inactive';
    await updateDoc(doc(db, 'scenarios', s.id), { status: newStatus });
  };

  // --- CSV Import / Export Logic ---
  const downloadTemplate = () => {
    const headers = ["category", "level", "type", "points", "timeLimit", "title", "description", "question", "opt1", "opt2", "opt3", "opt4", "correctAnswer", "explanation", "warningSigns", "threatTypes", "recommendedAction", "status"];
    const exampleRow = ["Phishing", "Beginner", "multiple-choice", "50", "60", "Fake Password Reset", "Identify the fake reset", "What is wrong with this email?", "Urgency", "Fake Domain", "Bad Grammar", "Nothing", "1", "It uses urgency to trick you", "Urgency|Fake Domain", "Phishing|Credential Theft", "Do not click", "Active"];
    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "CyberGuard_Scenario_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim() !== "");
        const batch = writeBatch(db);
        
        // Skip header row (index 0)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (cols.length < 18) continue;

          const scenarioData: any = {
            category: cols[0], level: cols[1], type: cols[2], points: Number(cols[3]), timeLimit: Number(cols[4]),
            title: cols[5], description: cols[6], question: cols[7],
            options: [cols[8], cols[9], cols[10], cols[11]], correctAnswer: Number(cols[12]),
            explanation: cols[13], warningSigns: cols[14].split("|"),
            threatTypes: cols[15].split("|"), recommendedAction: cols[16], status: cols[17]
          };
          
          const newDocRef = doc(collection(db, 'scenarios'));
          batch.set(newDocRef, scenarioData);
        }

        await batch.commit();
        alert(`${lines.length - 1} scenarios imported successfully!`);
      } catch (error) {
        console.error(error);
        alert("Failed to import CSV. Ensure formatting is correct.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Scenario Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{editId ? "Edit Scenario" : "Create New Scenario"}</h2>
            {editId && <button onClick={resetForm} className="text-xs text-red-600 font-bold hover:underline">Cancel Edit</button>}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option>Phishing</option><option>Malware</option><option>Password Security</option><option>Social Engineering</option><option>URL Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Difficulty</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Scenario Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="email">Phishing Email</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Points</label>
                <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Time Limit (Sec)</label>
                <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">{type === 'email' ? 'Email Body Content' : 'Question'}</label>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" required />
            </div>

            {type === 'multiple-choice' && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Options (Select correct answer)</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={correctAnswer === i} onChange={() => setCorrectAnswer(i)} className="w-4 h-4" />
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm" placeholder={`Option ${i + 1}`} required />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Explanation (Why it's correct)</label>
              <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Warning Signs (Comma separated)</label>
              <input type="text" value={warningSigns} onChange={(e) => setWarningSigns(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Urgency, Fake Domain, Mismatch URL" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Threat Types</label>
              <div className="flex flex-wrap gap-4">
                {["Phishing", "Malware", "Social Engineering", "Credential Theft", "Ransomware"].map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={threatTypes.includes(t)} onChange={() => handleThreatTypeChange(t)} className="w-4 h-4" />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Recommended Action</label>
              <input type="text" value={recommendedAction} onChange={(e) => setRecommendedAction(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Delete email and report to IT" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
              {loading ? "Saving..." : editId ? "Update Scenario" : "Upload Scenario to Database"}
            </button>
          </form>
        </div>

        {/* List & Import Column */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Active Scenarios</h2>
            <span className="text-sm text-slate-500">({scenarios.length})</span>
          </div>

          {/* CSV IMPORT/EXPORT BUTTONS */}
          <div className="flex gap-2 mb-4">
            <button onClick={downloadTemplate} className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-300 flex items-center justify-center gap-1">
              <i className="fas fa-download"></i> Template
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-3 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 flex items-center justify-center gap-1">
              <i className="fas fa-file-import"></i> Import CSV
            </button>
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleImportCSV} className="hidden" />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {scenarios.map(s => (
              <div key={s.id} className={`p-3 border rounded-lg ${s.status === 'Inactive' ? 'bg-slate-50 border-slate-200 opacity-60' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.level === 'Beginner' ? 'bg-green-100 text-green-700' : s.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.level}</span>
                    <p className="font-bold text-slate-800 mt-1 text-sm">{s.title}</p>
                    <p className="text-xs text-slate-500">+{s.points} pts | {s.status || 'Active'}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
                    <button onClick={() => toggleStatus(s)} className="text-amber-600 text-xs font-bold hover:underline">{s.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 text-xs font-bold hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
