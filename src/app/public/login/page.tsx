"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for eye icon
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true); 
    setError(""); 
    setResetMsg("");
    
    try { 
      await signInWithEmailAndPassword(auth, email, password); 
      router.push("/portal"); 
    } catch (err: any) { 
      setError("Invalid email or password. Please try again."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { 
      setError("Please enter your email first to reset password."); 
      return; 
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMsg("Password reset link sent to your email!");
      setError("");
    } catch (err: any) {
      setError("Failed to send reset email. Check the email address.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-md">
            <i className="fas fa-right-to-bracket text-white"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Sign In</h2>
          <p className="text-sm text-slate-500 mt-1">Access your training portal</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold">{error}</div>}
        {resetMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm font-bold">{resetMsg}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
              placeholder="you@example.com" 
              required 
            />
          </div>
          
          {/* Password Field with Eye Icon */}
          <div className="mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" 
                placeholder="••••••••" 
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
          
          <div className="text-right mb-4">
            <button type="button" onClick={handleForgotPassword} className="text-xs text-blue-600 hover:underline font-bold">Forgot Password?</button>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}