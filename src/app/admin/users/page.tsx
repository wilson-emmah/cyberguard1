"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateDoc(doc(db, 'users', userCred.user.uid), { email, role, points: 0, level: 1 });
      alert("User created successfully!");
      setShowModal(false); setEmail(""); setPassword(""); setRole("USER");
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleResetProgress = async (id: string) => {
    if (confirm("Reset this user's points and completed modules?")) {
      await updateDoc(doc(db, 'users', id), { points: 0, level: 1, completedModules: {} });
      alert("User progress reset.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Permanently delete this user's database record?")) {
      await deleteDoc(doc(db, 'users', id));
      alert("User deleted. (Note: Auth account may need manual deletion in Firebase Console).");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"><i className="fas fa-user-plus"></i> Create User</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Points</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{u.email}</td>
                <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{u.role || 'USER'}</span></td>
                <td className="p-4 font-bold text-slate-700">{u.points || 0}</td>
                <td className="p-4 flex gap-3">
                  <button onClick={async () => { await updateDoc(doc(db, 'users', u.id), { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' }); }} className="text-blue-600 font-bold text-xs hover:underline">Toggle Role</button>
                  <button onClick={() => handleResetProgress(u.id)} className="text-amber-600 font-bold text-xs hover:underline">Reset Progress</button>
                  <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 font-bold text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="Email" required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="Password" required />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg">{loading ? "Creating..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
