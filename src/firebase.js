// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAprTbNd31tjK-bDExuLX8GkdO4eJ7MMVY",
  authDomain: "tcgdoku.firebaseapp.com",
  projectId: "tcgdoku",
  storageBucket: "tcgdoku.firebasestorage.app",
  messagingSenderId: "741563532644",
  appId: "1:741563532644:web:6441bc2a67b8849a20a671",
  measurementId: "G-EZ3ZQEQV16"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);