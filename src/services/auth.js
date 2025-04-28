import { db } from './firebase';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs'; // Changed from bcrypt to bcryptjs

// Generate a unique user ID (Firestore auto-ID)
const generateUserId = () => {
  return doc(collection(db, 'users')).id;
};

// Register a new user
export const register = async ({ name, email, phone, password }) => {
  try {
    // Normalize phone number (e.g., 0712345678 -> +254712345678)
    const normalizedPhone = phone.startsWith('0') ? `+254${phone.slice(1)}` : phone;

    // Check if phone or email already exists
    const phoneQuery = query(collection(db, 'users'), where('phone', '==', normalizedPhone));
    const emailQuery = query(collection(db, 'users'), where('email', '==', email));
    const [phoneSnapshot, emailSnapshot] = await Promise.all([getDocs(phoneQuery), getDocs(emailQuery)]);

    if (!phoneSnapshot.empty) {
      throw new Error('Phone number already registered');
    }
    if (!emailSnapshot.empty) {
      throw new Error('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in Firestore
    const userId = generateUserId();
    const userData = {
      name,
      email,
      phone: normalizedPhone,
      password: hashedPassword,
      balance: 0,
      createdAt: new Date()
    };
    await setDoc(doc(db, 'users', userId), userData);

    // Return user data (excluding password)
    return { userId, ...userData, password: undefined };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Login with phone and password
export const login = async (phone, password) => {
  try {
    // Normalize phone number
    const normalizedPhone = phone.startsWith('0') ? `+254${phone.slice(1)}` : phone;

    // Query user by phone
    const q = query(collection(db, 'users'), where('phone', '==', normalizedPhone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No user found with this phone number');
    }

    // Get user data
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      throw new Error('Incorrect password');
    }

    // Return user data (excluding password)
    return { userId, ...userData, password: undefined };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

// Logout (clear client-side state)
export const logout = async () => {
  localStorage.removeItem('user');
};