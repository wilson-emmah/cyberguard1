"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [pendingCerts, setPendingCerts] = useState(0);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const arr = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setUsers(arr);
      setPendingCerts(arr.filter(u => u.certificateRequested === true).length);
    });

    const unsubScen = onSnapshot(collection(db, 'scenarios'), (snapshot) => {
      setScenarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    return () => { unsubUsers(); unsubScen(); };
  }, []);

  // Calculate completion analytics for the chart
  const chartData = scenarios.map(s => {
    const completedCount = users.filter(u => u.completedModules && u.completedModules[s.id]).length;
    const incompleteCount = users.length - completedCount;
    return { name: s.title.length > 15 ? s.title.substring(0, 15) + "..." : s.title, Completed: completedCount, Incomplete: incompleteCount };
  });

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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500 font-bold uppercase">Active Scenarios</p><p className="text-4xl font-black text-blue-600 mt-2">{scenarios.filter(s => s.status !== 'Inactive').length}</p></div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Training Analytics (Pass/Fail Rates)</h2>
        {chartData.length > 0 ? (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} />
                <Bar dataKey="Completed" stackId="a" fill="#10b981" name="Completed" />
                <Bar dataKey="Incomplete" stackId="a" fill="#ef4444" name="Incomplete" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-slate-500 text-sm text-center py-8">No scenarios created yet.</p>}
      </div>
    </div>
  );
}
