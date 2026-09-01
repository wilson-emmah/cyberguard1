"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [pendingCerts, setPendingCerts] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const arr = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setUsers(arr);
      setPendingCerts(arr.filter(u => u.certificateRequested === true).length);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <Link href="/admin/certificates" className="relative p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50">
          <i className="fas fa-bell text-slate-600 text-lg"></i>
          {pendingCerts > 0 && (<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{pendingCerts}</span>)}
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500 font-bold uppercase">Total Users</p><p className="text-4xl font-black text-slate-900 mt-2">{users.length}</p></div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500 font-bold uppercase">Pending Certs</p><p className="text-4xl font-black text-red-600 mt-2">{pendingCerts}</p></div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500 font-bold uppercase">Total Points Awarded</p><p className="text-4xl font-black text-blue-600 mt-2">{users.reduce((sum, u) => sum + (u.points || 0), 0)}</p></div>
      </div>
    </div>
  );
}