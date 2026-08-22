"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push("/login"); } 
      else {
        const snapshot = await get(ref(db, 'users/' + currentUser.uid));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUser({ ...data, uid: currentUser.uid });
          setFirstName(data.firstName || ""); setLastName(data.lastName || "");
          setJobTitle(data.jobTitle || ""); setProfilePicUrl(data.profilePicUrl || "");
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => { 
    await signOut(auth); 
    router.push("/"); 
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    setUploadingPic(true);
    try {
      setProfilePicUrl(URL.createObjectURL(file));
      const imgRef = storageRef(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(imgRef, file);
      const downloadUrl = await getDownloadURL(imgRef);
      await update(ref(db, 'users/' + user.uid), { profilePicUrl: downloadUrl });
      setProfilePicUrl(downloadUrl);
    } catch (error) { console.error("Upload error:", error); alert("Failed to upload image."); } 
    finally { setUploadingPic(false); }
  };

  const handleSaveDetails = async () => {
    if (!user) return; setSaving(true);
    try {
      await update(ref(db, 'users/' + user.uid), { firstName, lastName, jobTitle });
      alert("Profile details saved successfully!"); generateCertificate();
    } catch (error) { console.error("Save error:", error); alert("Failed to save details."); } 
    finally { setSaving(false); }
  };

  const generateCertificate = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 20; ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 2; ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    ctx.fillStyle = "#1e3a8a"; ctx.font = "bold 60px Arial"; ctx.textAlign = "center";
    ctx.fillText("Certificate of Completion", canvas.width / 2, 150);
    ctx.fillStyle = "#64748b"; ctx.font = "30px Arial"; ctx.fillText("This certifies that", canvas.width / 2, 250);
    if (profilePicUrl) {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save(); ctx.beginPath(); ctx.arc(canvas.width / 2, 350, 60, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.drawImage(img, canvas.width / 2 - 60, 290, 120, 120); ctx.restore();
      };
      img.src = profilePicUrl;
    }
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 50px Georgia"; ctx.fillText(`${firstName} ${lastName}`, canvas.width / 2, 500);
    ctx.fillStyle = "#dc2626"; ctx.font = "italic 30px Arial"; ctx.fillText(jobTitle, canvas.width / 2, 550);
    ctx.fillStyle = "#1e3a8a"; ctx.font = "bold 30px Arial"; ctx.fillText("CyberGuard Security Awareness Training", canvas.width / 2, 650);
    ctx.fillStyle = "#64748b"; ctx.font = "24px Arial"; ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, 700);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-blue-500 font-bold">Loading secure portal...</div>;
  if (!user) return null;

  return (
    <div className="min-h-[80vh] bg-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/portal" className="text-blue-600 font-bold text-sm mb-4 inline-flex items-center gap-2 hover:gap-3 transition-all"><i className="fas fa-arrow-left"></i> Back to Dashboard</Link>
        
        {/* FIX: Added the Sign Out Button here */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Profile Settings & Certificate</h1>
            <p className="text-sm text-slate-500 mt-1">Update your details and generate your certificate</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm mt-4 sm:mt-0">
            <i className="fas fa-right-from-bracket"></i> Sign Out
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-slate-100 border-4 border-slate-200 overflow-hidden flex items-center justify-center mb-4">
                {profilePicUrl ? <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" /> : <i className="fas fa-user text-5xl text-slate-300"></i>}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPic} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">{uploadingPic ? "Uploading..." : "Upload Picture"}</button>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Job Title / Role</label><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" /></div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800"><i className="fas fa-info-circle mr-2"></i> These details will be permanently embedded into your training certificate.</div>
              <button onClick={handleSaveDetails} disabled={saving} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50">{saving ? "Saving..." : "Save Details & Generate Certificate"}</button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Certificate Preview</h2>
          <div className="flex justify-center"><canvas ref={canvasRef} width={1000} height={800} className="w-full max-w-3xl shadow-lg border border-slate-200 rounded-sm"></canvas></div>
        </div>
      </div>
    </div>
  );
}