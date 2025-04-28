import { Container, Typography, TextField, Button, Box, Fade, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import InputAdornment from '@mui/material/InputAdornment';

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setUser } = useAuth();
  const imageUrl = 'https://static.vecteezy.com/system/resources/previews/049/329/811/non_2x/tax-day-economy-free-png.png';

  const validateForm = () => {
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
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const user = await login(phone, password);
      setUser(user); // Update AuthContext
      navigate('/home');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

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
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {errors.form}
          </Typography>
        )}
        <TextField
          label="Phone (e.g., 0712345678)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.phone}
          helperText={errors.phone}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon />
              </InputAdornment>
            ),
          }}
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleLogin}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          size="large"
          onClick={() => navigate('/register')}
          sx={{ mt: 1 }}
        >
          Register
        </Button>
      </Container>
    </Box>
  );
}

export default Login;