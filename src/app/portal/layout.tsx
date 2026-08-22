"use client";
import { useEffect, useState, useRef } from "react";
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
  const [theme, setTheme] = useState("light");
  
  // 5 Minute Session Timeout Logic
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes of inactivity

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { 
        router.push("/login"); 
      } else {
        onValue(ref(db, 'users/' + currentUser.uid), (snapshot) => {
          const data = snapshot.val() || { email: currentUser.email };
          setUser({ ...data, uid: currentUser.uid });
          setLoading(false);
        });
      }
    });
    
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark");

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => { 
    await signOut(auth); 
    router.push("/login"); 
  };

  const resetIdleTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    resetIdleTimer(); // Initialize timer on mount

    activityEvents.forEach(event => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, []); // Run once

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading Security Portal...</div>;
  if (!user) return null;

  const navSections = [
    { title: "Dashboard", items: [{ href: "/portal", label: "Overview", icon: "fa-chart-line" }] },
    { title: "Training", items: [
      { href: "/portal/train", label: "Courses", icon: "fa-book" },
      { href: "/portal/train", label: "My Progress", icon: "fa-route" },
      { href: "/portal/train", label: "Scenarios", icon: "fa-list-check" }
    ]},
    { title: "Security Tools", items: [
      { href: "/portal/tools", label: "URL Checker", icon: "fa-link" },
      { href: "/portal/tools", label: "Password Lab", icon: "fa-key" },
      { href: "/portal/tools", label: "Phishing Test", icon: "fa-fish" },
      { href: "/portal/tools", label: "Malware Lab", icon: "fa-virus" },
    ]},
    { title: "Achievements", items: [
      { href: "/portal", label: "Badges", icon: "fa-medal" },
      { href: "/portal", label: "Leaderboard", icon: "fa-trophy" },
    ]},
    { title: "Certification", items: [{ href: "/portal/profile", label: "Certificate", icon: "fa-certificate" }] },
    { title: "Account", items: [
      { href: "/portal/profile", label: "Profile", icon: "fa-user-pen" },
      { href: "/portal/settings", label: "Settings", icon: "fa-gear" }
    ]}
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-50 transition-colors duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <i className="fas fa-shield-halved text-blue-600 text-xl"></i>
          <span className="font-bold text-lg text-slate-800 dark:text-white">CyberGuard</span>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {navSections.map((section, i) => (
            <div key={i} className="mb-6">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-4">{section.title}</p>
              {section.items.map((item) => (
                <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition mb-1 ${pathname === item.href ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <i className={`fas ${item.icon} w-5 ${pathname === item.href ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}></i> {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition">
            <i className="fas fa-right-from-bracket w-5"></i> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-200">
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">Security Dashboard</h1>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white relative">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-sm border border-slate-300 dark:border-slate-600">
                {user.profilePicUrl ? <img src={user.profilePicUrl} alt="Pic" className="w-full h-full object-cover" /> : <i className="fas fa-user"></i>}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">{user.email.split('@')[0]}</span>
              <i className="fas fa-chevron-down text-xs text-slate-400"></i>
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