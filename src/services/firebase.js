import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDtml4ZwPB53RD9dn2dFjWbaDyui3u6OBQ",
  authDomain: "tasks-pay-to-mpesa.firebaseapp.com",
  projectId: "tasks-pay-to-mpesa",
  storageBucket: "tasks-pay-to-mpesa.firebasestorage.app",
  messagingSenderId: "953559369661",
  appId: "1:953559369661:web:d48c2ebc7bf1ff872e34d4",
  measurementId: "G-47H9CHPT3D"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);