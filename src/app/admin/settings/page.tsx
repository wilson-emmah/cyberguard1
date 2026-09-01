"use client";
export default function AdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4">System Configuration</h2>
          <button className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg text-sm mb-4 w-full">Reset All User Passwords</button>
          <button className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm w-full">Clear Leaderboard</button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4">Scenario Management</h2>
          <p className="text-sm text-slate-500 mb-4">Manually push new training scenarios to all users.</p>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm w-full">Upload New Scenario</button>
        </div>
      </div>
    </div>
  );
}