"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminSettings() {
  const [sessionTimeout, setSessionTimeout] = useState(5);
  const [pointsPerLevel, setPointsPerLevel] = useState(100);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'platform_config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSessionTimeout(docSnap.data().sessionTimeout || 5);
        setPointsPerLevel(docSnap.data().pointsPerLevel || 100);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'platform_config'), {
        sessionTimeout: Number(sessionTimeout),
        pointsPerLevel: Number(pointsPerLevel)
      });
      alert("Platform settings saved successfully!");
    } catch (error) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-blue-600 font-bold">Loading settings...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Settings</h1>
      <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-lg">
        <h2 className="text-lg font-bold mb-4">System Configuration</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">User Session Timeout (Minutes)</label>
            <input 
              type="number" 
              value={sessionTimeout} 
              onChange={(e) => setSessionTimeout(Number(e.target.value))} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              min="1"
            />
            <p className="text-xs text-slate-500 mt-1">Automatically logs users out after this period of inactivity.</p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Points Required Per Level</label>
            <input 
              type="number" 
              value={pointsPerLevel} 
              onChange={(e) => setPointsPerLevel(Number(e.target.value))} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              min="10"
            />
            <p className="text-xs text-slate-500 mt-1">Defines the gamification threshold for leveling up.</p>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </form>
      </div>
    </div>
  );
}
