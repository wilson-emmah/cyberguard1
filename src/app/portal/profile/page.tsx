"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
  const [certRequested, setCertRequested] = useState(false);
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
          setCertRequested(data.certificateRequested || false);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file || !user) return;
    
    setUploadingPic(true);
    try {
      const imgRef = storageRef(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(imgRef, file);
      const downloadUrl = await getDownloadURL(imgRef);
      
      await update(ref(db, 'users/' + user.uid), { profilePicUrl: downloadUrl });
      setProfilePicUrl(downloadUrl);
    } catch (error: any) {
      console.error("Upload error:", error);
      // Show an alert so you know exactly why it failed
      alert("Failed to upload image: " + error.message); 
    } finally {
      setUploadingPic(false);
    }
  };

  const handleRequestCertificate = async () => {
    if (!user) return; setSaving(true);
    try {
      await update(ref(db, 'users/' + user.uid), { firstName, lastName, jobTitle, certificateRequested: true });
      setCertRequested(true);
      alert("Certificate request submitted! An admin will review and email it to you soon.");
    } catch (error) { console.error("Save error:", error); } 
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-blue-500 font-bold">Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-slate-200 dark:border-slate-600 overflow-hidden flex items-center justify-center mb-4">
              {profilePicUrl ? <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" /> : <i className="fas fa-user text-5xl text-slate-300 dark:text-slate-400"></i>}
            </div>
            <label className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm cursor-pointer disabled:opacity-50">
              {uploadingPic ? "Uploading..." : "Upload Picture"}
              <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
            </label>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" /></div>
              <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" /></div>
            </div>
            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Job Title / Role</label><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white" /></div>
            <div className={`mt-6 p-4 rounded-lg border ${certRequested ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
              {certRequested ? (
                <div className="flex items-center gap-3 text-yellow-800">
                  <i className="fas fa-clock text-xl"></i>
                  <div>
                    <p className="font-bold">Certificate Requested</p>
                    <p className="text-sm">Your request is pending admin approval. The certificate will be sent to your email once approved.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-blue-800 mb-3"><i className="fas fa-info-circle mr-2"></i>Ensure your details are correct. Submitting will send a request to the admin to generate your certificate.</p>
                  <button onClick={handleRequestCertificate} disabled={saving} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                    {saving ? "Submitting..." : "Submit for Admin Approval"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}