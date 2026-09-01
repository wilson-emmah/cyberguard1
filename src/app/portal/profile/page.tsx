"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [certRequested, setCertRequested] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) router.push("/login");
      else {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({ ...data, uid: currentUser.uid });
          setFirstName(data.firstName || ""); setLastName(data.lastName || ""); setJobTitle(data.jobTitle || "");
          setProfilePicUrl(data.profilePicUrl || ""); setCertRequested(data.certificateRequested || false);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    setUploadingPic(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        await updateDoc(doc(db, 'users', user.uid), { profilePicUrl: base64String });
        setProfilePicUrl(base64String);
      } catch (error) { alert("Failed to upload image."); } finally { setUploadingPic(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBiodata = async () => {
    if (!user) return; setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { firstName, lastName, jobTitle });
      alert("Biodata saved successfully!");
    } catch (error) { alert("Error saving details."); } finally { setSaving(false); }
  };

  const handleRequestCertificate = async () => {
    if (!user) return; setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { firstName, lastName, jobTitle, certificateRequested: true });
      setCertRequested(true); alert("Certificate request submitted!");
    } catch (error) { alert("Error requesting certificate."); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-blue-500 font-bold">Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Certificate</h1>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-slate-100 border-4 border-slate-200 overflow-hidden flex items-center justify-center mb-4">
              {profilePicUrl ? <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" /> : <i className="fas fa-user text-5xl text-slate-300"></i>}
            </div>
            <label className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm cursor-pointer">
              {uploadingPic ? "Uploading..." : "Upload Picture"}
              <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
            </label>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" /></div>
              <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" /></div>
            </div>
            <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Job Title / Role</label><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" /></div>
            <button onClick={handleSaveBiodata} disabled={saving} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900">{saving ? "Saving..." : "Save Biodata"}</button>
            
            <div className={`mt-6 p-4 rounded-lg border ${certRequested ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
              {certRequested ? (
                <div className="flex items-center gap-3 text-yellow-800"><i className="fas fa-clock text-xl"></i><div><p className="font-bold">Certificate Requested</p><p className="text-sm">Pending admin approval.</p></div></div>
              ) : (
                <div>
                  <p className="text-sm text-blue-800 mb-3">Ensure your biodata is correct. Submit to request certificate.</p>
                  <button onClick={handleRequestCertificate} disabled={saving} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Request Certificate</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}