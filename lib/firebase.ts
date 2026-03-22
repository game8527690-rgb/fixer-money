import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB29B-YdX88ae_1H1o3ei3xayIJikbBE5s",
  authDomain: "fixer-money.firebaseapp.com",
  projectId: "fixer-money",
  storageBucket: "fixer-money.firebasestorage.app",
  messagingSenderId: "126153811222",
  appId: "1:126153811222:web:f4dd7c7260d0ac04055c37",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
