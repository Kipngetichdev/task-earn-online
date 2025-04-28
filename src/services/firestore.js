import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export const getTasks = async (userId) => {
  const querySnapshot = await getDocs(collection(db, 'tasks'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTaskStatus = async (userId, taskId, status) => {
  await updateDoc(doc(db, 'tasks', taskId), { status });
};

export const getUserBalance = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data().balance : 0;
};

export const getWithdrawalHistory = async (userId) => {
  const querySnapshot = await getDocs(collection(db, 'users', userId, 'withdrawals'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const initiateWithdrawal = async (userId, phone, amount) => {
  const userRef = doc(db, 'users', userId);
  const newBalance = (await getUserBalance(userId)) - amount;
  await updateDoc(userRef, { balance: newBalance });
  await setDoc(doc(db, 'users', userId, 'withdrawals', `${Date.now()}`), {
    phone,
    amount,
    timestamp: new Date(),
    status: 'pending'
  });
};

export const getUserProfile = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() : { name: '', phone: '', email: '' };
};

export const updateUserProfile = async (userId, profile) => {
  await setDoc(doc(db, 'users', userId), profile, { merge: true });
};