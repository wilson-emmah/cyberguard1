"use client";
import { useState } from "react";

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "ai", text: "Hello! I am your CyberGuard AI Coach. Ask me anything about phishing, passwords, or security!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput(""); setLoading(true);
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: input }) });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.text || "Sorry, I encountered an error." }]);
    } catch { setMessages((prev) => [...prev, { sender: "ai", text: "Network error." }]); } 
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-50">
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-xl`}></i>
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50">
          <div className="bg-slate-900 text-white p-4 rounded-t-xl flex items-center gap-2"><i className="fas fa-robot"></i><h3 className="font-bold">CyberGuard AI Coach</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>{msg.text}</div>
              </div>
            ))}
            {loading && <div className="text-center text-slate-500 text-sm"><i className="fas fa-spinner fa-spin mr-2"></i>Thinking...</div>}
          </div>
          <div className="p-3 border-t border-slate-200 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Ask a security question..." />
            <button onClick={sendMessage} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"><i className="fas fa-paper-plane"></i></button>
          </div>
        </div>
      )}
    </>
  );
}