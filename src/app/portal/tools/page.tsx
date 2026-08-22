"use client";
import { useState } from "react";

export default function SecurityToolsPage() {
  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState<{score: number, risk: string, color: string, indicators: {type: string, text: string}[], recommendation: string} | null>(null);
  
  const [password, setPassword] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const analyzeUrl = () => {
    let score = 100;
    let indicators = [];
    let url = urlInput.trim();
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;

    try {
      const parsed = new URL(url);
      const domain = parsed.hostname;

      if (parsed.protocol !== "https:") {
        score -= 40;
        indicators.push({type: "red", text: "Insecure HTTP connection (No SSL)"});
      } else {
        indicators.push({type: "green", text: "Secure HTTPS connection detected"});
      }

      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
        score -= 30;
        indicators.push({type: "red", text: "Uses a raw IP address instead of a domain name"});
      }

      if (url.includes("@")) {
        score -= 20;
        indicators.push({type: "red", text: "Contains an '@' symbol, often used to hide destinations"});
      }

      const fakeDomains = ["paypa1", "g00gle", "arnaz0n", "faceb00k"];
      if (fakeDomains.some(d => domain.includes(d))) {
        score -= 50;
        indicators.push({type: "red", text: "Possible brand impersonation (Typosquatting)"});
      }

      if (parsed.pathname.includes("login") || parsed.pathname.includes("account")) {
        indicators.push({type: "amber", text: "Login or account page detected"});
      }

      let risk = "LOW RISK - LIKELY SAFE";
      let color = "text-green-600";
      let recommendation = "This website appears safe to interact with.";
      
      if (score < 80 && score >= 50) {
        risk = "REVIEW REQUIRED"; color = "text-amber-600"; 
        recommendation = "Proceed with caution. Do not enter sensitive information without verifying the source.";
      } else if (score < 50) {
        risk = "HIGH RISK - MALICIOUS"; color = "text-red-600"; 
        recommendation = "Do not provide passwords, payment details, or personal information on this website.";
      }

      setUrlResult({ score: Math.max(0, score), risk, color, indicators, recommendation });
    } catch {
      setUrlResult({ score: 0, risk: "INVALID URL", color: "text-red-600", indicators: [{type: "red", text: "The URL format is invalid."}], recommendation: "Please check the URL and try again." });
    }
  };

  const analyzePassword = (pw: string) => {
    setPassword(pw);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pw = "";
    for (let i = 0; i < 16; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    setGeneratedPassword(pw);
    setPassword(pw);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Security Tools</h1>
      
      {/* URL Scanner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Security URL Analyzer</h2>
        <p className="text-sm text-slate-500 mb-4">Analyze a website before interacting with it.</p>
        <div className="flex gap-2">
          <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example-login.com/account" className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm" />
          <button onClick={analyzeUrl} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm">SCAN</button>
        </div>
        
        {urlResult && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Security Risk</p>
              <p className="text-4xl font-black text-slate-900">{urlResult.score}<span className="text-lg text-slate-400">/100</span></p>
              <p className={`text-sm font-bold mt-2 ${urlResult.color}`}>{urlResult.risk}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Threat Indicators</p>
              <ul className="space-y-2 text-sm text-slate-700 mb-4">
                {urlResult.indicators.map((ind, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ind.type === 'red' ? 'bg-red-500' : ind.type === 'amber' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                    {ind.text}
                  </li>
                ))}
              </ul>
              <div className="bg-slate-100 border-l-4 border-slate-400 p-3 text-sm text-slate-700">
                <p className="font-bold mb-1">Recommendation:</p>
                {urlResult.recommendation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Lab */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Password Security Lab</h2>
        <p className="text-sm text-slate-500 mb-4">Evaluate your password strength locally.</p>
        
        <input type="text" value={password} onChange={(e) => analyzePassword(e.target.value)} placeholder="Type a password to test..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4 font-mono text-sm" />
        
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
          <div className={`h-2 rounded-full transition-all ${password.length > 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'bg-green-500 w-full' : password.length > 8 ? 'bg-amber-500 w-2/4' : 'bg-red-500 w-1/4'}`}></div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-6">
          <p className={password.length >= 8 ? "text-green-600" : ""}><i className="fas fa-check mr-1"></i> Good password length</p>
          <p className={/[A-Z]/.test(password) ? "text-green-600" : ""}><i className="fas fa-check mr-1"></i> Uppercase characters</p>
          <p className={/[a-z]/.test(password) ? "text-green-600" : ""}><i className="fas fa-check mr-1"></i> Lowercase characters</p>
          <p className={/[0-9]/.test(password) ? "text-green-600" : ""}><i className="fas fa-check mr-1"></i> Numbers</p>
          <p className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}><i className="fas fa-check mr-1"></i> Special characters</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={generatePassword} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 text-sm flex items-center gap-2"><i className="fas fa-key"></i> Generate Strong Password</button>
          {generatedPassword && (
            <div className="flex-1 px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-sm text-slate-800 flex items-center justify-between">
              <span>{generatedPassword}</span>
              <button onClick={() => { navigator.clipboard.writeText(generatedPassword); alert("Copied!"); }} className="text-blue-600 hover:text-blue-800"><i className="fas fa-copy"></i></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}