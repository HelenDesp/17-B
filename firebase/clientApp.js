import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Parse the Firebase config from the environment variable.
const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG 
    ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG) 
    : {};

// Initialize Firebase only if it hasn't been initialized yet.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };