"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Listen to the 'users' collection in Firestore
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // CSV Download Logic
  const exportToCSV = () => {
    if (users.length === 0) return;

    // Define the CSV headers
    const headers = ["Email", "Role", "Points", "Level", "Certificate Requested", "Certificate Approved"];
    
    // Map user data to match headers
    const rows = users.map(u => [
      u.email || "N/A",
      u.role || "USER",
      u.points || 0,
      u.level || 1,
      u.certificateRequested ? "Yes" : "No",
      u.certApproved ? "Yes" : "No"
    ]);

    // Combine headers and rows into a CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(field => `"${field}"`).join(",")) // Wrap fields in quotes to escape commas
    ].join("\n");

    // Create a Blob and trigger a download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "CyberGuard_Users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV} 
            className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg text-sm hover:bg-slate-900 flex items-center gap-2"
          >
            <i className="fas fa-file-csv"></i> Export to CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
            <i className="fas fa-user-plus"></i> Create User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">User Profile</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Points / Level</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Badges</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold">
                    {u.profilePicUrl ? <img src={u.profilePicUrl} alt="" className="w-full h-full object-cover" /> : <i className="fas fa-user"></i>}
                  </div>
                  <span className="font-medium text-slate-800">{u.email}</span>
                </td>
                <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{u.role || 'USER'}</span></td>
                <td className="p-4 font-bold text-slate-700">{u.points || 0} <span className="text-slate-400 font-normal text-xs block">Level {u.level || 1}</span></td>
                <td className="p-4"><i className="fas fa-shield-halved text-blue-500"></i></td>
                <td className="p-4"><button className="text-blue-600 font-bold text-sm hover:underline">Assign Scenario</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}