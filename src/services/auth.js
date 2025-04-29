import { db } from './firebase';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

const generateUserId = () => {
  return doc(collection(db, 'users')).id;
};

export const register = async ({ name, email, phone, password }) => {
  try {
    const normalizedPhone = phone.startsWith('0') ? `+254${phone.slice(1)}` : phone;
    const phoneQuery = query(collection(db, 'users'), where('phone', '==', normalizedPhone));
    const emailQuery = query(collection(db, 'users'), where('email', '==', email));
    const [phoneSnapshot, emailSnapshot] = await Promise.all([getDocs(phoneQuery), getDocs(emailQuery)]);

    if (!phoneSnapshot.empty) {
      throw new Error('Phone number already registered');
    }
    if (!emailSnapshot.empty) {
      throw new Error('Email already registered');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = generateUserId();
    const userData = {
      name,
      email,
      phone: normalizedPhone,
      password: hashedPassword,
      balance: 0,
      createdAt: new Date(),
      hasClaimedWelcomeBonus: false // Added
    };
    await setDoc(doc(db, 'users', userId), userData);

    return { userId, ...userData, password: undefined };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

export const login = async (phone, password) => {
  try {
    const normalizedPhone = phone.startsWith('0') ? `+254${phone.slice(1)}` : phone;
    const q = query(collection(db, 'users'), where('phone', '==', normalizedPhone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No user found with this phone number');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      throw new Error('Incorrect password');
    }

    return { userId, ...userData, password: undefined };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

export const logout = async () => {
  localStorage.removeItem('user');
};