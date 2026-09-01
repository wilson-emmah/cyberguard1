"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import AIChat from "@/components/AIChat";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { router.push("/login"); } 
      else {
        const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          const data = docSnap.data() || { email: currentUser.email };
          if (data.role === 'ADMIN') router.push('/admin');
          setUser({ ...data, uid: currentUser.uid });
          setLoading(false);
        });

        // Listen for user-specific or global notifications
        const notifQuery = query(collection(db, 'notifications'), where('target', 'in', [currentUser.uid, 'all']));
        const unsubNotif = onSnapshot(notifQuery, (snapshot) => {
          // Count unread notifications
          setUnreadNotifs(snapshot.docs.filter(d => !d.data().read).length);
        });

        return () => { unsubUser(); unsubNotif(); };
      }
    });
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };
  const resetIdleTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleLogout, 5 * 60 * 1000);
  };
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    resetIdleTimer();
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); events.forEach(e => window.removeEventListener(e, resetIdleTimer)); };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading...</div>;
  if (!user) return null;

  const navItems = [
    { section: "Dashboard", items: [{ href: "/portal", label: "Overview", icon: "fa-chart-line" }] },
    { section: "Training", items: [{ href: "/portal/train", label: "Learning Path", icon: "fa-route" }] },
    { section: "Security Tools", items: [{ href: "/portal/tools", label: "Tools Lab", icon: "fa-toolbox" }] },
    { section: "Account", items: [{ href: "/portal/profile", label: "Profile & Certificate", icon: "fa-user-pen" }, { href: "/portal/settings", label: "Settings", icon: "fa-gear" }] }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2"><i className="fas fa-shield-halved text-blue-600 text-xl"></i><span className="font-bold text-lg text-slate-800 dark:text-white">CyberGuard</span></div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500"><i className="fas fa-times"></i></button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((sec, i) => (
            <div key={i} className="mb-6">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-4">{sec.section}</p>
              {sec.items.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition mb-1 ${pathname === item.href ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <i className={`fas ${item.icon} w-5 ${pathname === item.href ? 'text-white' : 'text-slate-400'}`}></i> {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition"><i className="fas fa-right-from-bracket w-5"></i> Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 w-full lg:ml-64">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4"><button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-600 dark:text-slate-300 text-xl"><i className="fas fa-bars"></i></button><h1 className="text-lg font-bold text-slate-800 dark:text-white">User Portal</h1></div>
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* NOTIFICATION BELL */}
            <div className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <i className="fas fa-bell text-slate-600 dark:text-slate-300 text-lg"></i>
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">{unreadNotifs}</span>
              )}
            </div>

            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-300">
                {user.profilePicUrl ? <img src={user.profilePicUrl} alt="Pic" className="w-full h-full object-cover" /> : <i className="fas fa-user"></i>}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize hidden sm:block">{user.email.split('@')[0]}</span>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </main>
      <AIChat />
    </div>
  );
}