"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await signInWithEmailAndPassword(auth, email, password); router.push("/portal"); } 
    catch (err: any) { setError("Invalid email or password. Please try again."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-md"><i className="fas fa-right-to-bracket text-white"></i></div>
          <h2 className="text-2xl font-black text-slate-900">Sign In</h2>
          <p className="text-sm text-slate-500 mt-1">Access your training portal</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="you@example.com" required /></div>
          <div className="mb-6"><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="••••••••" required /></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
      </div>
    </div>
  );
}