"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import "../globals.css"; // Import global css from parent
import "@fortawesome/fontawesome-free/css/all.min.css";
import { doc, getDoc } from "firebase/firestore";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
        router.push("/admin/login");
      } else {
        // Fetch Admin role from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const data = userDoc.data();
        if (!data || data.role !== 'ADMIN') {
          router.push("/login"); // Kick non-admins back to the user login
          return;
        }
        setUser({ ...data, uid: currentUser.uid });
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Verifying Admin Credentials...</div>;
  if (!user) return null;

  // Hide sidebar on the login page
  if (pathname === '/admin/login') {
    return (
      <html lang="en">
        <body className="bg-slate-900">{children}</body>
      </html>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "fa-chart-line" },
    { href: "/admin/users", label: "User Management", icon: "fa-users" },
    { href: "/admin/scenarios", label: "Scenarios", icon: "fa-list-check" },
    { href: "/admin/certificates", label: "Certificates", icon: "fa-certificate" },
    { href: "/admin/settings", label: "Settings", icon: "fa-gear" }
  ];

  return (
    <html lang="en">
      <body className="bg-slate-100">
        <div className="min-h-screen flex">
          {/* Dark Sidebar for Admin */}
          <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-50">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <i className="fas fa-user-shield text-red-500 text-xl"></i>
              <span className="font-bold text-lg">Admin Portal</span>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition mb-1 ${pathname === item.href ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <i className={`fas ${item.icon} w-5`}></i> {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button onClick={() => signOut(auth).then(() => router.push("/admin/login"))} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-900/20 rounded-lg text-sm font-bold">
                <i className="fas fa-right-from-bracket w-5"></i> Sign Out
              </button>
            </div>
          </aside>

          {/* Main Admin Content */}
          <main className="flex-1 ml-64 p-8 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}