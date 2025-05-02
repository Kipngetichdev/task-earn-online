import { db } from './firebase';
import { doc, setDoc, query, collection, where, getDocs, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

const generateUserId = () => {
  return doc(collection(db, 'users')).id;
};

export async function register({ name, email, phone, password, referralCode }) {
  try {
    console.log('Registering user with:', { name, email, phone, referralCode });

    // Normalize phone number
    const normalizedPhone = phone.startsWith('0') ? `+254${phone.slice(1)}` : phone;
    console.log('Normalized phone:', normalizedPhone);

    // Check for existing phone or email
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
    console.log('Password hashed');

    // Create user data
    const userId = generateUserId();
    const userData = {
      userId,
      name: name ? name.trim() : '',
      email: email ? email.trim() : '',
      phone: normalizedPhone,
      password: hashedPassword,
      balance: 0,
      isActive: false,
      createdAt: serverTimestamp(),
      hasClaimedWelcomeBonus: false,
    };
    console.log('Writing user data to /users/', userId, ':', userData);

    // Write user profile
    await setDoc(doc(db, 'users', userId), userData).catch((error) => {
      console.error('Failed to write user data:', error.message, error.stack);
      throw new Error(`Failed to write user data: ${error.message}`);
    });

    // Handle referral code
    if (referralCode) {
      console.log('Processing referral code:', referralCode);
      const usersQuery = query(collection(db, 'users'), where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(usersQuery);
      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        const referrerId = referrerDoc.id;
        console.log('Found referrer with ID:', referrerId);

        // Record referral
        const referralDoc = doc(db, 'referrals', `${referrerId}_${userId}`);
        const referralData = {
          referrerId,
          referredUserId: userId,
          timestamp: serverTimestamp(),
        };
        console.log('Writing referral data to /referrals/', referralDoc.id, ':', referralData);
        await setDoc(referralDoc, referralData).catch((error) => {
          console.error('Failed to write referral data:', error.message, error.stack);
          throw new Error(`Failed to write referral data: ${error.message}`);
        });

        // Update referrer's balance
        const referrerUserDoc = doc(db, 'users', referrerId);
        console.log('Updating balance for referrer:', referrerId);
        await updateDoc(referrerUserDoc, {
          balance: increment(100),
        }).catch((error) => {
          console.error('Failed to update referrer balance:', error.message, error.stack);
          throw new Error(`Failed to update referrer balance: ${error.message}`);
        });
      } else {
        console.warn('Invalid referral code:', referralCode);
      }
    }

    console.log('Registration successful for user:', userId);
    return { userId, ...userData, password: undefined };
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
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
    console.error('Login error:', error.message, error.stack);
    throw new Error(`Login failed: ${error.message}`);
  }
};

export const logout = async () => {
  localStorage.removeItem('user');
};