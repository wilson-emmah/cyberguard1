import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white">
      <section className="relative bg-blue-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-block px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold mb-6"><i className="fas fa-lock mr-2"></i>Secure Your Digital Life</div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">Master Cybersecurity Through <span className="text-blue-600">Interactive</span> Training</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">Stop reading boring manuals. Start practicing real-world defense. Learn to identify phishing, secure your passwords, and stop social engineering attacks in a safe, simulated environment.</p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-sm flex items-center gap-2"><i className="fas fa-user-plus"></i> Start Training Now</Link>
            <Link href="/login" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"><i className="fas fa-sign-in-alt"></i> Sign In</Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-slate-200 rounded-xl hover:shadow-lg transition bg-white">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-2xl"><i className="fas fa-fish"></i></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Phishing Simulations</h3>
            <p className="text-slate-600">Interact with realistic fake emails and websites to learn how hackers steal credentials.</p>
          </div>
          <div className="p-8 border border-slate-200 rounded-xl hover:shadow-lg transition bg-white">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4 text-2xl"><i className="fas fa-key"></i></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Password Security</h3>
            <p className="text-slate-600">Learn the difference between weak and strong passwords and how to manage them effectively.</p>
          </div>
          <div className="p-8 border border-slate-200 rounded-xl hover:shadow-lg transition bg-white">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-2xl"><i className="fas fa-brain"></i></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Social Engineering</h3>
            <p className="text-slate-600">Understand the psychological tricks hackers use and how to spot manipulation attempts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}