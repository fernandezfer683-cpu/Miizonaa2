import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDspOmFUt_sX97CoEZ7UdrA7Iqk8J3-oho",
  authDomain: "mizonaa2.firebaseapp.com",
  projectId: "mizonaa2",
  storageBucket: "mizonaa2.firebasestorage.app",
  messagingSenderId: "620304362048",
  appId: "1:620304362048:web:497d5c0c25ccf075854da5",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
