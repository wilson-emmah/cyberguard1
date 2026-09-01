"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Updated to Firestore imports

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for Password eye
  const [showConfirm, setShowConfirm] = useState(false); // State for Confirm eye
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // Send Email Verification
      await sendEmailVerification(userCredential.user);
      
      // Save to Firestore
      await setDoc(doc(db, 'users', userId), { 
        email, 
        points: 0, 
        level: 1, 
        role: 'USER' 
      });
      
      // Route directly to login page to ensure clean session and prevent permission errors
      alert("Registration successful! Please sign in.");
      router.push("/login");
    } catch (err: any) { 
      setError(err.message.replace("Firebase: ", "")); 
    } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-red-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-md"><i className="fas fa-user-plus text-white"></i></div>
          <h2 className="text-2xl font-black text-slate-900">Create Account</h2>
          <p className="text-sm text-slate-500 mt-1">Start your security training</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" required />
          </div>
          
          {/* Password Field with Eye Icon */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Confirm Password Field with Eye Icon */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirm ? "text" : "password"} 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i className={`fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50">
            {loading ? "Creating account..." : "Register & Start"}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-4 text-center">A verification link will be sent to your email.</p>
      </div>
    </div>
  );
}