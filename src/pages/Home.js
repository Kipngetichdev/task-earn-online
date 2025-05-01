import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fade,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';
import {
  getUserBalance,
  initiateWithdrawal,
  claimWelcomeBonus,
  activateUserAccount,
  updateUserProfile,
  getUserProfile,
} from '../services/firestore';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import congractImg from '../assets/congratulations.gif';
import Tasks from '../components/Tasks';
import Rewards from './Rewards';
import Wallet from './Wallet';
import Profile from './Profile';

const drawerItems = [
  { label: 'Home', path: '/home', icon: <HomeIcon /> },
  { label: 'Rewards', path: '/rewards', icon: <CardGiftcardIcon /> },
  { label: 'Wallet', path: '/wallet', icon: <AccountBalanceWalletIcon /> },
  { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
  { label: 'Logout', path: 'logout', icon: <LogoutIcon /> },
];

const bonusData = {
  amount: 499,
  source: 'Digital Pay Jobs KE',
  dateReceived: new Date().toISOString().split('T')[0],
};

// Format phone number for display (0712345678)
const formatPhoneNumberForDisplay = (phone) => {
  if (!phone) return '';
  if (phone.startsWith('254') && phone.length === 12) {
    return `0${phone.slice(3)}`;
  }
  if (phone.startsWith('+254') && phone.length === 13) {
    return `0${phone.slice(4)}`;
  }
  if (phone.startsWith('0') && phone.length === 10) {
    return phone;
  }
  return phone;
};

// Normalize phone number for Firestore/STK Push (254XXXXXXXXX)
const normalizePhoneNumber = (phone) => {
  if (!phone) throw new Error('Phone number is required');
  if (phone.startsWith('0') && phone.length === 10) {
    return `254${phone.slice(1)}`;
  }
  if (phone.startsWith('+254') && phone.length === 13) {
    return phone.slice(1);
  }
  if (phone.startsWith('254') && phone.length === 12) {
    return phone;
  }
  throw new Error('Invalid phone number format');
};

function Home() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumberForDisplay(user?.phone || ''));
  const [transaction, setTransaction] = useState(null); // { clientReference, payheroReference, type }
  const [failedAttempts, setFailedAttempts] = useState(0);
  const claimButtonRef = useRef(null);
  const activateButtonRef = useRef(null);
  const phoneInputRef = useRef(null);
  const MAX_FAILED_ATTEMPTS = 10;

  // Fetch balance and check welcome bonus
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [balanceData, userDoc] = await Promise.all([
            getUserBalance(user.userId),
            getDoc(doc(db, 'users', user.userId)),
          ]);
          setBalance(balanceData);
          const storedPhone = userDoc.data().phone || user.phone || '';
          setPhoneNumber(formatPhoneNumberForDisplay(storedPhone));
          if (!userDoc.data().hasClaimedWelcomeBonus) {
            setTimeout(() => {
              setModalOpen(true);
              setTimeout(() => claimButtonRef.current?.focus(), 100);
            }, 2000);
          }
        } catch (error) {
          console.error('Fetch data error:', error.message, error.stack);
          setAlert({ open: true, message: `Error fetching data: ${error.message}`, severity: 'error' });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Poll transaction status for withdrawals and activations
  useEffect(() => {
    if (!transaction?.payheroReference) {
      console.log('No transaction to poll, transaction:', transaction);
      return;
    }
    console.log('Starting polling for transaction:', transaction);
    const pollStatus = async () => {
      try {
        console.log('Polling transaction status for payheroReference:', transaction.payheroReference);
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/transaction-status?reference=${transaction.payheroReference}`
        );
        const data = await response.json();
        console.log('Transaction status response:', data);
        if (data.success) {
          const status = data.status;
          setAlert({
            open: true,
            message: `Transaction status: ${status}`,
            severity: status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'error' : 'info',
          });
          if (status === 'SUCCESS' || status === 'FAILED' || status === 'CANCELLED') {
            console.log('Updating transaction status in Firestore:', {
              clientReference: transaction.clientReference,
              status,
            });
            await updateDoc(doc(db, 'transactions', transaction.clientReference), { status });
            if (status === 'SUCCESS') {
              try {
                const newBalance = await getUserBalance(user.userId);
                setBalance(newBalance);
                if (transaction.type === 'activation') {
                  console.log('Updating user to isActive: true for userId:', user.userId);
                  const userDoc = await getDoc(doc(db, 'users', user.userId));
                  const currentData = userDoc.exists() ? userDoc.data() : {};
                  await updateDoc(doc(db, 'users', user.userId), {
                    isActive: true,
                    userId: user.userId,
                    balance: currentData.balance || 0,
                  });
                  console.log('User document updated with isActive: true');
                  const updatedProfile = await getUserProfile(user.userId);
                  const updatedUser = { ...user, ...updatedProfile, isActive: true };
                  console.log('Logging in updated user:', updatedUser);
                  login(updatedUser);
                  setAlert({
                    open: true,
                    message: 'Account activated successfully! You can now perform tasks.',
                    severity: 'success',
                  });
                  const updatedDoc = await getDoc(doc(db, 'users', user.userId));
                  console.log('User document after activation:', updatedDoc.data());
                }
              } catch (activationError) {
                console.error('Activation error:', activationError.message, activationError.stack);
                setAlert({
                  open: true,
                  message: `Failed to activate account: ${activationError.message}`,
                  severity: 'error',
                });
              }
            }
            setTransaction(null);
            setFailedAttempts(0);
          }
        } else {
          console.error('Transaction status check failed:', data.error);
          setFailedAttempts((prev) => prev + 1);
          setAlert({
            open: true,
            message: `Transaction status check failed: ${data.error || 'Unknown error'}`,
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Polling error:', error.message, error.stack);
        setFailedAttempts((prev) => prev + 1);
        setAlert({
          open: true,
          message: `Error checking transaction status: ${error.message}`,
          severity: 'error',
        });
      }
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        console.error('Max failed attempts reached, stopping polling for reference:', transaction.payheroReference);
        setAlert({
          open: true,
          message: 'Failed to verify transaction status after multiple attempts. Please try again later.',
          severity: 'error',
        });
        setTransaction(null);
        setFailedAttempts(0);
      }
    };
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [transaction, user, login, failedAttempts]);

  const toggleDrawer = useCallback((open) => () => {
    setDrawerOpen(open);
  }, []);

  const handleDrawerNavigation = useCallback(
    (path) => () => {
      setDrawerOpen(false);
      if (path === 'logout') {
        logout();
        navigate('/login');
      } else {
        navigate(path);
      }
    },
    [navigate, logout]
  );

  const handleWithdraw = useCallback(async () => {
    if (!user?.isActive) {
      setAlert({
        open: true,
        message: 'Please activate your account to withdraw funds.',
        severity: 'warning',
      });
      setTimeout(() => {
        setActivationModalOpen(true);
        setTimeout(() => activateButtonRef.current?.focus(), 100);
      }, 1000);
      return;
    }
    if (balance <= 0) {
      setAlert({ open: true, message: 'Insufficient balance for withdrawal', severity: 'warning' });
      return;
    }
    try {
      console.log('Initiating withdrawal for user:', user.userId, 'amount:', balance);
      const { reference, payheroReference } = await initiateWithdrawal(
        user.userId,
        normalizePhoneNumber(phoneNumber),
        balance
      );
      console.log('Withdrawal references:', { clientReference: reference, payheroReference });
      setTransaction({ clientReference: reference, payheroReference, type: 'withdrawal' });
      setAlert({ open: true, message: 'Withdrawal initiated. Check your phone.', severity: 'success' });
    } catch (error) {
      console.error('Withdrawal error:', error.message, error.stack);
      setAlert({ open: true, message: `Withdrawal failed: ${error.message}`, severity: 'error' });
    }
  }, [user, balance, phoneNumber]);

  const handleClaimBonus = useCallback(async () => {
    try {
      console.log('Claiming welcome bonus for user:', user.userId);
      await claimWelcomeBonus(user.userId, bonusData.amount);
      const newBalance = await getUserBalance(user.userId);
      setBalance(newBalance);
      setModalOpen(false);
      setAlert({ open: true, message: 'Welcome bonus claimed successfully!', severity: 'success' });
      const updatedUser = { ...user, hasClaimedWelcomeBonus: true };
      console.log('Logging in updated user with hasClaimedWelcomeBonus:', updatedUser);
      login(updatedUser);
      if (!user?.isActive) {
        setTimeout(() => {
          setActivationModalOpen(true);
          setTimeout(() => activateButtonRef.current?.focus(), 100);
        }, 1000);
      }
    } catch (error) {
      console.error('Claim bonus error:', error.message, error.stack);
      setAlert({ open: true, message: `Failed to claim bonus: ${error.message}`, severity: 'error' });
      setModalOpen(false);
    }
  }, [user, login]);

  const handleActivateAccount = useCallback(async () => {
    try {
      console.log('Starting handleActivateAccount, phoneNumber:', phoneNumber);
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      console.log('Normalized phone:', normalizedPhone);
      if (normalizedPhone !== user.phone) {
        console.log('Updating user phone in Firestore');
        const userDoc = await getDoc(doc(db, 'users', user.userId));
        const currentData = userDoc.exists() ? userDoc.data() : {};
        await updateUserProfile(user.userId, {
          phone: normalizedPhone,
          userId: user.userId,
          balance: currentData.balance || 0,
          isActive: currentData.isActive || false,
        });
        const updatedUser = { ...user, phone: normalizedPhone };
        console.log('Logging in updated user with new phone:', updatedUser);
        login(updatedUser);
        setPhoneNumber(formatPhoneNumberForDisplay(normalizedPhone));
      }
      console.log('Initiating account activation for user:', user.userId);
      const { reference, payheroReference } = await activateUserAccount(user.userId, normalizedPhone);
      console.log('Activation references:', { clientReference: reference, payheroReference });
      setTransaction({ clientReference: reference, payheroReference, type: 'activation' });
      console.log('Transaction set:', { clientReference: reference, payheroReference, type: 'activation' });
      setActivationModalOpen(false);
      setIsEditingPhone(false);
      setAlert({
        open: true,
        message: 'Activation payment initiated. Check your phone.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Activation error:', error.message, error.stack);
      setAlert({
        open: true,
        message: `Failed to initiate activation: ${error.message}`,
        severity: 'error',
      });
      setActivationModalOpen(false);
      setIsEditingPhone(false);
    }
  }, [user, phoneNumber, login]);

  const handleEditPhone = useCallback(() => {
    setIsEditingPhone(true);
    setTimeout(() => phoneInputRef.current?.focus(), 100);
  }, []);

  const handleSavePhone = useCallback(async () => {
    try {
      console.log('Saving phone number:', phoneNumber);
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const userDoc = await getDoc(doc(db, 'users', user.userId));
      const currentData = userDoc.exists() ? userDoc.data() : {};
      await updateUserProfile(user.userId, {
        phone: normalizedPhone,
        userId: user.userId,
        balance: currentData.balance || 0,
        isActive: currentData.isActive || false,
      });
      const updatedUser = { ...user, phone: normalizedPhone };
      console.log('Logging in updated user with new phone:', updatedUser);
      login(updatedUser);
      setPhoneNumber(formatPhoneNumberForDisplay(normalizedPhone));
      setIsEditingPhone(false);
      setAlert({ open: true, message: 'Phone number saved successfully', severity: 'success' });
    } catch (error) {
      console.error('Save phone error:', error.message, error.stack);
      setAlert({
        open: true,
        message: `Failed to save phone number: ${error.message}`,
        severity: 'error',
      });
    }
  }, [phoneNumber, user, login]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <IconButton
          aria-label="Open navigation menu"
          onClick={toggleDrawer(true)}
          sx={{ color: theme.palette.text.primary }}
        >
          <MenuIcon />
        </IconButton>
        <IconButton
          aria-label="Go to profile"
          onClick={() => navigate('/profile')}
          sx={{ color: theme.palette.text.primary }}
        >
          <PersonIcon />
        </IconButton>
      </Box>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            Task Pay to Mpesa
          </Typography>
          <Divider />
          <List>
            {drawerItems.map(({ label, path, icon }) => (
              <ListItem button key={path} onClick={handleDrawerNavigation(path)}>
                <ListItemIcon sx={{ color: theme.palette.text.secondary }}>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body1.fontSize,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Modal
        open={modalOpen}
        closeAfterTransition
        aria-labelledby="welcome-bonus-modal-title"
        aria-describedby="welcome-bonus-modal-description"
      >
        <Fade in={modalOpen} timeout={500}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: theme.palette.background.paper,
              borderRadius: 1,
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
            }}
          >
            <img
              src={congractImg}
              alt="Congratulatory animation"
              onError={(e) => (e.target.src = 'https://media.giphy.com/media/3o7aDcz7L5GrO2Gf6g/giphy.gif')}
              style={{
                width: '100%',
                maxHeight: '150px',
                objectFit: 'contain',
                marginBottom: '16px',
              }}
            />
            <Typography id="welcome-bonus-modal-title" variant="h2" gutterBottom>
              Congratulations {user?.name}!
            </Typography>
            <Typography id="welcome-bonus-modal-description" variant="body1" sx={{ mb: 3 }}>
              You have received KES 499 welcome bonus.
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table aria-label="Welcome bonus details">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Date Received</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Received From</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{bonusData.dateReceived}</TableCell>
                    <TableCell>{bonusData.source}</TableCell>
                    <TableCell>KES {bonusData.amount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClaimBonus}
              sx={{ borderRadius: 2, minWidth: 200 }}
              ref={claimButtonRef}
              aria-label="Claim welcome bonus"
            >
              Claim Now
            </Button>
          </Box>
        </Fade>
      </Modal>
      <Modal
        open={activationModalOpen}
        closeAfterTransition
        aria-labelledby="activation-modal-title"
        aria-describedby="activation-modal-description"
      >
        <Fade in={activationModalOpen} timeout={500}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: theme.palette.background.paper,
              borderRadius: 1,
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography id="activation-modal-title" variant="h2" gutterBottom>
              Activate Your Account
            </Typography>
            <Typography id="activation-modal-description" variant="body1" sx={{ mb: 2 }}>
              One-time fee of KES 120 only
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Payment Phone Number
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
              {isEditingPhone ? (
                <>
                  <TextField
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712345678"
                    inputRef={phoneInputRef}
                    aria-label="Edit phone number"
                    sx={{ maxWidth: 200 }}
                    inputProps={{ maxLength: 13 }}
                  />
                  <IconButton
                    onClick={handleSavePhone}
                    aria-label="Save phone number"
                    sx={{ color: theme.palette.success.main }}
                  >
                    <SaveIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <Typography variant="body2">{phoneNumber || 'Not set'}</Typography>
                  <IconButton
                    onClick={handleEditPhone}
                    aria-label="Edit phone number"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <EditIcon />
                  </IconButton>
                </>
              )}
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleActivateAccount}
              sx={{ borderRadius: 2, minWidth: 200 }}
              ref={activateButtonRef}
              aria-label="Activate account"
              disabled={isEditingPhone}
            >
              Activate Now
            </Button>
          </Box>
        </Fade>
      </Modal>
      <Routes>
        <Route
          path="/"
          element={
            <Container maxWidth="sm" sx={{ py: 4, pb: { xs: '72px', sm: '80px' } }}>
              {alert.open && (
                <Alert
                  severity={alert.severity}
                  onClose={() => setAlert({ ...alert, open: false })}
                  sx={{ mb: 2 }}
                >
                  {alert.message}
                </Alert>
              )}
              <Card
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <CardContent>
                  <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
                    Hello {user?.name}! 👋
                  </Typography>
                  <Typography variant="h3" gutterBottom>
                    Your Balance
                  </Typography>
                  <Typography variant="h1" color="primary.main" sx={{ mb: 2 }}>
                    KES {balance}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleWithdraw}
                      disabled={balance <= 0}
                      sx={{ borderRadius: 2 }}
                    >
                      Withdraw
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate('/wallet')}
                      sx={{ borderRadius: 2 }}
                    >
                      View Transactions
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              <Tasks
                onActivateRequest={() => {
                  setActivationModalOpen(true);
                  setTimeout(() => activateButtonRef.current?.focus(), 100);
                }}
              />
            </Container>
          }
        />
        <Route
          path="/rewards"
          element={
            <Rewards
              onActivateRequest={() => {
                setActivationModalOpen(true);
                setTimeout(() => activateButtonRef.current?.focus(), 100);
              }}
            />
          }
        />
        <Route
          path="/wallet"
          element={
            <Wallet
              onActivateRequest={() => {
                setActivationModalOpen(true);
                setTimeout(() => activateButtonRef.current?.focus(), 100);
              }}
            />
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="*"
          element={
            <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h3">Page Not Found</Typography>
            </Container>
          }
        />
      </Routes>
    </Box>
  );
}

export default Home;