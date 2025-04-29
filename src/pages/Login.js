// src/pages/Login.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Fade,
  CircularProgress,
  Alert,
} from '@mui/material';
import { login } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import InputAdornment from '@mui/material/InputAdornment';
import { debounce } from 'lodash'; // Requires: npm install lodash
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const navigate = useNavigate();
  const { user, login: setUser } = useAuth();
  const imageUrl = 'https://static.vecteezy.com/system/resources/previews/049/329/811/non_2x/tax-day-economy-free-png.png';
  const phoneCheckRef = useRef(null);

  // Navigate to /home when user is set
  useEffect(() => {
    if (user) {
      console.log('User detected, navigating to /home:', user);
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  // Debounced phone number validation against Firestore
  const checkPhoneNumber = useCallback(
    debounce(async (phoneNumber) => {
      if (!phoneNumber || !/^0[17]\d{8}$/.test(phoneNumber)) {
        setUserMessage('');
        return;
      }
      try {
        const normalizedPhone = phoneNumber.startsWith('0')
          ? `+254${phoneNumber.slice(1)}`
          : phoneNumber;
        const q = query(collection(db, 'users'), where('phone', '==', normalizedPhone));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserMessage(`Welcome back, ${userData.name}!`);
        } else {
          setUserMessage('Invalid user');
        }
      } catch (error) {
        console.error('Error checking phone:', error);
        setUserMessage('Error checking phone number');
      }
    }, 500),
    []
  );

  // Trigger phone check on input change
  useEffect(() => {
    checkPhoneNumber(phone);
    return () => checkPhoneNumber.cancel(); // Cleanup debounce
  }, [phone, checkPhoneNumber]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0[17]\d{8}$/.test(phone)) {
      newErrors.phone = 'Enter a valid Kenyan phone number (e.g., 0712345678 or 0123456789)';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [phone, password]);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      setLoading(true);
      setErrors({});
      try {
        const userData = await login(phone, password);
        console.log('Login successful, user:', userData);
        setUser(userData); // Update AuthContext and localStorage
        // Fallback navigation in case useEffect doesn't trigger
        setTimeout(() => {
          if (!user) {
            console.log('Fallback navigation to /home');
            navigate('/home', { replace: true });
          }
        }, 1000);
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ form: error.message || 'Invalid phone number or password' });
      } finally {
        setLoading(false);
      }
    },
    [phone, password, setUser, navigate, user]
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 2, pb: 8 }}>
      <Box
        sx={{
          width: '100%',
          height: { xs: '200px', sm: '250px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          position: 'relative',
          background: 'linear-gradient(180deg, #F4F7ED 0%, rgba(134, 238, 96, 0.3) 100%)',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Fade in timeout={1200}>
          <img
            src={imageUrl}
            alt="Tax Day Economy"
            style={{
              maxWidth: '80%',
              maxHeight: '90%',
              objectFit: 'contain',
              zIndex: 2,
              animation: 'scaleIn 1s ease-in-out',
            }}
            onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
          />
        </Fade>
      </Box>
      <Container maxWidth="sm" sx={{ px: 1 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Login
        </Typography>
        {errors.form && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.form}
          </Alert>
        )}
        <Box component="form" onSubmit={handleLogin} noValidate>
          <TextField
            label="Phone (e.g., 0712345678)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="normal"
            error={!!errors.phone}
            helperText={errors.phone || userMessage}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
            inputRef={phoneCheckRef}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          size="large"
          onClick={() => navigate('/register')}
          sx={{ mt: 1 }}
          disabled={loading}
        >
          Register
        </Button>
      </Container>
    </Box>
  );
}

export default Login;