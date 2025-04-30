// services/firestore.js
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export const getTasks = async (userId) => {
  console.log('Fetching tasks for userId:', userId);
  try {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Tasks fetched:', tasks);
    return tasks;
  } catch (error) {
    console.error('getTasks error:', error);
    throw error;
  }
};

export const updateTaskStatus = async (userId, taskId, status) => {
  await updateDoc(doc(db, 'tasks', taskId), { status });
};

export const getUserBalance = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data().balance || 0 : 0;
};

export const getWithdrawalHistory = async (userId) => {
  const querySnapshot = await getDocs(collection(db, 'users', userId, 'withdrawals'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const initiateWithdrawal = async (userId, phone, amount) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists() || !userDoc.data().isActive) {
    throw new Error('Account is not active');
  }
  const newBalance = (await getUserBalance(userId)) - amount;
  await updateDoc(userRef, { balance: newBalance });
  await setDoc(doc(db, 'users', userId, 'withdrawals', `${Date.now()}`), {
    phone,
    amount,
    timestamp: new Date(),
    status: 'pending',
  });
};

export const getUserProfile = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists()
    ? {
        name: userDoc.data().name || '',
        phone: userDoc.data().phone || '',
        email: userDoc.data().email || '',
        isActive: userDoc.data().isActive || false,
        hasClaimedWelcomeBonus: userDoc.data().hasClaimedWelcomeBonus || false,
      }
    : { name: '', phone: '', email: '', isActive: false, hasClaimedWelcomeBonus: false };
};

export const updateUserProfile = async (userId, profile) => {
  await setDoc(doc(db, 'users', userId), profile, { merge: true });
};

export const activateUserAccount = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isActive: true });
    console.log('Account activated for userId:', userId);
  } catch (error) {
    console.error('activateUserAccount error:', error);
    throw error;
  }
};

export const claimWelcomeBonus = async (userId, amount) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  const currentBalance = await getUserBalance(userId);
  const newBalance = currentBalance + amount;
  await updateDoc(userRef, {
    balance: newBalance,
    hasClaimedWelcomeBonus: true,
  });
  await setDoc(doc(db, 'users', userId, 'bonuses', `${Date.now()}`), {
    amount,
    source: 'Digital Pay Jobs KE',
    dateReceived: new Date(),
    timestamp: new Date(),
  });
};

export const createUserProfile = async (userId, userData) => {
  await setDoc(doc(db, 'users', userId), {
    name: userData.name || '',
    phone: userData.phone || '',
    email: userData.email || '',
    balance: 0,
    isActive: false, // Default to inactive
    hasClaimedWelcomeBonus: false,
    createdAt: new Date(),
  });
};

// New function for fetching bonuses
export const getBonuses = async (userId) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'bonuses'));
    const bonuses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Bonuses fetched:', bonuses);
    return bonuses;
  } catch (error) {
    console.error('getBonuses error:', error);
    throw error;
  }
};