import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export const getUserBalance = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data().balance || 0 : 0;
};

export const initiateWithdrawal = async (userId, phoneNumber, amount) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || !userDoc.data().isActive) {
      throw new Error('Account is not active');
    }
    const clientReference = `${userId}_${Date.now()}`;
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/stk-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        amount,
        reference: clientReference,
      }),
    });
    const data = await response.json();
    console.log('Withdrawal STK Push response:', data);
    if (!data.success) {
      throw new Error(data.error || 'Failed to initiate withdrawal');
    }
    const newBalance = (await getUserBalance(userId)) - amount;
    await updateDoc(userRef, { balance: newBalance });
    await setDoc(doc(db, 'transactions', clientReference), {
      userId,
      amount,
      phoneNumber,
      status: 'QUEUED',
      type: 'withdrawal',
      clientReference,
      payheroReference: data.payheroReference,
      timestamp: new Date(),
    });
    await setDoc(doc(db, 'users', userId, 'withdrawals', clientReference), {
      phone: phoneNumber,
      amount,
      timestamp: new Date(),
      status: 'pending',
    });
    return {
      reference: clientReference,
      payheroReference: data.payheroReference,
    };
  } catch (error) {
    console.error('Withdrawal error:', error.message, error.stack);
    throw new Error(`Withdrawal error: ${error.message}`);
  }
};

export const getWithdrawalHistory = async (userId) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'withdrawals'));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('getWithdrawalHistory error:', error);
    throw new Error('Failed to fetch withdrawal history');
  }
};

export const claimWelcomeBonus = async (userId, amount) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  if (userDoc.data().hasClaimedWelcomeBonus) {
    throw new Error('Bonus already claimed');
  }
  const newBalance = (await getUserBalance(userId)) + amount;
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

export const getBonuses = async (userId) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'bonuses'));
    const bonuses = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return bonuses;
  } catch (error) {
    console.error('getBonuses error:', error);
    throw new Error('Failed to fetch bonuses');
  }
};

export const activateUserAccount = async (userId, phoneNumber) => {
  try {
    const clientReference = `${userId}_${Date.now()}`;
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/stk-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        amount: 100,
        reference: clientReference,
      }),
    });
    const data = await response.json();
    console.log('Activation STK Push response:', data);
    if (!data.success) {
      throw new Error(data.error || 'Failed to initiate activation payment');
    }
    await setDoc(doc(db, 'transactions', clientReference), {
      userId,
      amount: 1,
      phoneNumber,
      status: 'QUEUED',
      type: 'activation',
      clientReference,
      payheroReference: data.payheroReference,
      timestamp: new Date(),
    });
    return {
      reference: clientReference,
      payheroReference: data.payheroReference,
    };
  } catch (error) {
    console.error('Activation error:', error.message, error.stack);
    throw new Error(`Activation error: ${error.message}`);
  }
};

export const updateUserProfile = async (userId, updates) => {
  await updateDoc(doc(db, 'users', userId), updates);
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
        referralCode: userDoc.data().referralCode || '',
      }
    : {
        name: '',
        phone: '',
        email: '',
        isActive: false,
        hasClaimedWelcomeBonus: false,
        referralCode: '',
      };
};

export const createUserProfile = async (userId, userData) => {
  await setDoc(doc(db, 'users', userId), {
    name: userData.name || '',
    phone: userData.phone || '',
    email: userData.email || '',
    balance: 0,
    isActive: false,
    hasClaimedWelcomeBonus: false,
    createdAt: new Date(),
  });
};

export const completeTask = async (userId, taskId, reward) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  if (!userDoc.data().isActive) {
    throw new Error('Account is not active');
  }
  const newBalance = (await getUserBalance(userId)) + reward;
  await updateDoc(userRef, { balance: newBalance });
  await setDoc(doc(db, 'users', userId, 'tasks', taskId), {
    taskId,
    reward,
    status: 'completed',
    timestamp: new Date(),
  });
};

export const generateReferralCode = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().referralCode) {
      return userSnap.data().referralCode;
    }

    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(userRef, { referralCode }, { merge: true });
    return referralCode;
  } catch (error) {
    console.error('Error generating referral code:', error);
    throw new Error('Failed to generate referral code');
  }
};

export const getReferralHistory = async (userId) => {
  try {
    const referralsRef = collection(db, 'referrals');
    const q = query(referralsRef, where('referrerId', '==', userId));
    const querySnapshot = await getDocs(q);

    const referrals = querySnapshot.docs.map((doc) => ({
      referredUserId: doc.data().referredUserId,
      timestamp: doc.data().timestamp,
      ...doc.data(),
    }));

    return referrals;
  } catch (error) {
    console.error('Error fetching referral history:', error);
    throw new Error('Failed to fetch referral history');
  }
};

export const getTaskState = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId, 'taskStates', 'states');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : {};
  } catch (error) {
    console.error('getTaskState error:', error.message, error.stack);
    throw new Error(`Failed to fetch task states: ${error.message}`);
  }
};

export const setTaskState = async (userId, taskId, state) => {
  try {
    const docRef = doc(db, 'users', userId, 'taskStates', 'states');
    const currentStates = await getTaskState(userId);
    if (state) {
      currentStates[taskId] = {
        inProgress: state.inProgress || false,
        startTime: state.startTime || 0,
        paused: state.paused || false,
        pauseTime: state.pauseTime || 0,
        timeRemaining: state.timeRemaining || 0,
      };
    } else {
      delete currentStates[taskId];
    }
    console.log('Writing task state:', { userId, taskId, data: currentStates });
    await setDoc(docRef, currentStates);
  } catch (error) {
    console.error('setTaskState error:', error.message, error.stack);
    throw new Error(`Failed to save task state: ${error.message}`);
  }
};