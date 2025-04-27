import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
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
const db = getFirestore(app);

export const getTasks = async (userId) => {
  // Mock tasks (replace with Firestore query)
  return [
    { id: '1', title: 'Survey: Favorite App', description: 'Share your favorite app.', reward: 3, duration: 1, status: 'available' },
    { id: '2', title: 'Watch Ad: New Product', description: 'Watch a 30-sec ad.', reward: 4, duration: 1.5, status: 'available' },
    { id: '3', title: 'Rate Us', description: 'Rate our app on Play Store.', reward: 6, duration: 1, status: 'available' },
  ];
};

export const updateTaskStatus = async (userId, taskId, status) => {
  // Placeholder: Update task status in Firestore
};

export const getUserBalance = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data().balance : 0;
};

export const getWithdrawalHistory = async (userId) => {
  // Placeholder: Fetch withdrawal history
  return [];
};

export const initiateWithdrawal = async (userId, phone, amount) => {
  // Placeholder: Call M-Pesa API via mpesa.js
};

export const getUserProfile = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() : { name: '', phone: '', email: '' };
};

export const updateUserProfile = async (userId, profile) => {
  await setDoc(doc(db, 'users', userId), profile, { merge: true });
};