"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import AIChat from "@/components/AIChat";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { router.push("/login"); } 
      else {
        onValue(ref(db, 'users/' + currentUser.uid), (snapshot) => {
          const data = snapshot.val() || { email: currentUser.email };
          setUser({ ...data, uid: currentUser.uid });
          setLoading(false);
        });
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => { await signOut(auth); router.push("/"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading Security Portal...</div>;
  if (!user) return null;

  const navSections = [
    {
      title: "Dashboard",
      items: [
        { href: "/portal", label: "Overview", icon: "fa-chart-line" },
      ]
    },
    {
      title: "Training",
      items: [
        { href: "/portal/train", label: "Learning Path", icon: "fa-route" },
      ]
    },
    {
      title: "Security Tools",
      items: [
        { href: "/portal/tools", label: "URL Scanner", icon: "fa-link" },
        { href: "/portal/tools", label: "Password Lab", icon: "fa-key" },
      ]
    },
    {
      title: "Account",
      items: [
        { href: "/portal/profile", label: "Profile & Certificate", icon: "fa-user-pen" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-slate-200 flex items-center gap-2">
          <i className="fas fa-shield-halved text-blue-600 text-xl"></i>
          <span className="font-bold text-lg text-slate-800">CyberGuard</span>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {navSections.map((section, i) => (
            <div key={i} className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">{section.title}</p>
              {section.items.map((item) => (
                <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition mb-1 ${pathname === item.href ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <i className={`fas ${item.icon} w-5 ${pathname === item.href ? 'text-white' : 'text-slate-400'}`}></i> {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition">
            <i className="fas fa-right-from-bracket w-5"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-lg font-bold text-slate-800">Security Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600">
              <i className="fas fa-bell"></i>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-300">
                {user.profilePicUrl ? <img src={user.profilePicUrl} alt="Pic" className="w-full h-full object-cover" /> : <i className="fas fa-user"></i>}
              </div>
              <span className="text-sm font-medium text-slate-700">{user.email}</span>
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
      
      <AIChat />
    </div>
  );
}