"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setIsDark(currentTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow transition-colors duration-200">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Appearance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Customize how CyberGuard looks on your device.</p>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <div>
            <p className="font-bold text-slate-800 dark:text-white">Dark Mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes.</p>
          </div>
          <button onClick={toggleTheme} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}