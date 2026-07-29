import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNimj076ZzH1UgaJiL8mxQqRZBIOfZwTM",
  authDomain: "mi-zona-4e6ef.firebaseapp.com",
  projectId: "mi-zona-4e6ef",
  storageBucket: "mi-zona-4e6ef.firebasestorage.app",
  messagingSenderId: "875768628292",
  appId: "1:875768628292:web:4de259a72d90cdad506811",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
