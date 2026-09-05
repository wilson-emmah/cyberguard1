import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDt3672dLLK2gjpv6U6_AvsHBxgzebyAUc",
  authDomain: "cyberguard-c5bb4.firebaseapp.com",
  projectId: "cyberguard-c5bb4",
  storageBucket: "cyberguard-c5bb4.appspot.com",
  messagingSenderId: "283685949055",
  appId: "1:283685949055:web:720fd551f8777cf6bdb94a",
  measurementId: "G-YDL35D2KX7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);