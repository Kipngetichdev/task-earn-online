import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

export const login = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const register = async ({ name, email, phone, password }) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', user.uid), { name, email, phone, balance: 0 });
};

export const logout = async () => {
  await signOut(auth);
};