"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";

export default function AdminScenarios() {
  // ... [KEEP YOUR EXISTING STATE AND FORM LOGIC HERE] ...
  // Make sure you have editId, and all the form states.

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this scenario?")) {
      await deleteDoc(doc(db, 'scenarios', id));
      alert("Scenario deleted.");
    }
  };

  const toggleStatus = async (s: any) => {
    const newStatus = s.status === 'Inactive' ? 'Active' : 'Inactive';
    await updateDoc(doc(db, 'scenarios', s.id), { status: newStatus });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Scenario Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          {/* ... [KEEP YOUR EXISTING FORM JSX HERE] ... */}
        </div>

        {/* RIGHT COLUMN: LIST & LIFECYCLE MANAGEMENT */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4">Active Scenarios ({scenarios.length})</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={downloadTemplate} className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-300 flex items-center justify-center gap-1">
              <i className="fas fa-download"></i> Template
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-3 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 flex items-center justify-center gap-1">
              <i className="fas fa-file-import"></i> Import CSV
            </button>
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleImportCSV} className="hidden" />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {scenarios.map(s => (
              <div key={s.id} className={`p-3 border rounded-lg ${s.status === 'Inactive' ? 'bg-slate-50 border-slate-200 opacity-60' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.level === 'Beginner' ? 'bg-green-100 text-green-700' : s.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.level}</span>
                    <p className="font-bold text-slate-800 mt-1 text-sm">{s.title}</p>
                    <p className="text-xs text-slate-500">+{s.points} pts | {s.status || 'Active'}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
                    <button onClick={() => toggleStatus(s)} className="text-amber-600 text-xs font-bold hover:underline">{s.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 text-xs font-bold hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
