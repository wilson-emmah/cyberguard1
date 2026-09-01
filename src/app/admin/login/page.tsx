"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError("");
    
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const snapshot = await get(ref(db, 'users/' + userCred.user.uid));
      const data = snapshot.val();
      
      if (data && data.role === 'ADMIN') {
        router.push("/admin");
      } else {
        await auth.signOut(); 
        setError("Access Denied. You do not have Administrator privileges.");
      }
    } catch (err: any) {
      setError("Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border-t-4 border-red-600">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-red-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-md">
            <i className="fas fa-user-shield text-white"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Admin Access</h2>
          <p className="text-sm text-slate-500 mt-1">Authorized personnel only</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Admin Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500" required />
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50">
            {loading ? "Authorizing..." : "Sign In to Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}