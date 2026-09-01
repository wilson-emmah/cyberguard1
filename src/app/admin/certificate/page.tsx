"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function AdminCerts() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      // Cast to any to prevent TypeScript strict errors
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setPendingUsers(data.filter(u => u.certificateRequested === true));
    });
    return () => unsub();
  }, []);

  const handleApprove = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { certificateRequested: false, certApproved: true });
    alert("Certificate Approved! (Mock Email Sent)");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Certificate Approvals</h1>
      <div className="space-y-4">
        {pendingUsers.length === 0 && <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">No pending requests.</div>}
        {pendingUsers.map(u => (
          <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                {u.profilePicUrl ? <img src={u.profilePicUrl} alt="" className="w-full h-full object-cover" /> : <i className="fas fa-user"></i>}
              </div>
              <div>
                <p className="font-bold text-slate-800">{u.firstName || u.email}</p>
                <p className="text-xs text-slate-500">Completed required training modules.</p>
              </div>
            </div>
            <button onClick={() => handleApprove(u.id)} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700">
              Approve & Send
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}