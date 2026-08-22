import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDt3672dLLK2gjpv6U6_AvsHBxgzebyAUc",
  authDomain: "cyberguard-c5bb4.firebaseapp.com",
  databaseURL: "https://cyberguard-c5bb4-default-rtdb.firebaseio.com",
  projectId: "cyberguard-c5bb4",
  storageBucket: "cyberguard-c5bb4.firebasestorage.app",
  messagingSenderId: "283685949055",
  appId: "1:283685949055:web:720fd551f8777cf6bdb94a",
  measurementId: "G-YDL35D2KX7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);