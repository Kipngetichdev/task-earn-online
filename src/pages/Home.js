// src/pages/Home.js
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
  updateUserProfile, // Added import
} from '../services/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import congractImg from '../assets/congratulations.gif';
import Tasks from '../components/Tasks';
import Rewards from './Rewards';
import Wallet from './Wallet'; // Assuming Wallet.js exists
import Profile from './Profile'; // Assuming Profile.js exists

// Drawer navigation items
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
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const claimButtonRef = useRef(null);
  const activateButtonRef = useRef(null);
  const phoneInputRef = useRef(null);

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
          setPhoneNumber(userDoc.data().phone || user.phone);
          if (!userDoc.data().hasClaimedWelcomeBonus) {
            setTimeout(() => {
              setModalOpen(true);
              setTimeout(() => claimButtonRef.current?.focus(), 100);
            }, 2000);
          }
        } catch (error) {
          setAlert({ open: true, message: 'Error fetching data: ' + error.message, severity: 'error' });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

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
      setAlert({ open: true, message: 'Please activate your account to withdraw funds.', severity: 'warning' });
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
      await initiateWithdrawal(user.userId, user.phone, balance);
      const newBalance = await getUserBalance(user.userId);
      setBalance(newBalance);
      setAlert({ open: true, message: 'Withdrawal initiated successfully', severity: 'success' });
    } catch (error) {
      setAlert({ open: true, message: `Withdrawal failed: ${error.message}`, severity: 'error' });
    }
  }, [user, balance]);

  const handleClaimBonus = useCallback(async () => {
    try {
      await claimWelcomeBonus(user.userId, bonusData.amount);
      const newBalance = await getUserBalance(user.userId);
      setBalance(newBalance);
      setModalOpen(false);
      setAlert({ open: true, message: 'Welcome bonus claimed successfully!', severity: 'success' });
      // Update user state to reflect hasClaimedWelcomeBonus
      const updatedUser = { ...user, hasClaimedWelcomeBonus: true };
      login(updatedUser);
      // Suggest activation if account is inactive
      if (!user?.isActive) {
        setTimeout(() => {
          setActivationModalOpen(true);
          setTimeout(() => activateButtonRef.current?.focus(), 100);
        }, 1000);
      }
    } catch (error) {
      setAlert({ open: true, message: `Failed to claim bonus: ${error.message}`, severity: 'error' });
      setModalOpen(false);
    }
  }, [user, login]);

  const handleActivateAccount = useCallback(async () => {
    try {
      // Update phone number first, if edited
      if (phoneNumber && phoneNumber !== user.phone) {
        await updateUserProfile(user.userId, { phone: phoneNumber });
      }
      await activateUserAccount(user.userId);
      const updatedUser = { ...user, isActive: true, phone: phoneNumber };
      login(updatedUser);
      setActivationModalOpen(false);
      setIsEditingPhone(false);
      setAlert({ open: true, message: 'Account activated successfully!', severity: 'success' });
    } catch (error) {
      setAlert({ open: true, message: `Failed to activate account: ${error.message}`, severity: 'error' });
    }
  }, [user, phoneNumber, login]);

  const handleEditPhone = useCallback(() => {
    setIsEditingPhone(true);
    setTimeout(() => phoneInputRef.current?.focus(), 100);
  }, []);

  const handleSavePhone = useCallback(() => {
    if (!phoneNumber.match(/^\+254\d{9}$/)) {
      setAlert({ open: true, message: 'Please enter a valid phone number (e.g., +254712345678)', severity: 'error' });
      return;
    }
    setIsEditingPhone(false);
    setAlert({ open: true, message: 'Phone number updated successfully', severity: 'success' });
  }, [phoneNumber]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Top Bar */}
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

      {/* Navigation Drawer */}
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

      {/* Welcome Bonus Modal */}
      <Modal
        open={modalOpen}
        closeAfterTransition
        disableEscapeKeyDown
        disableBackdropClick
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

      {/* Account Activation Modal */}
      <Modal
        open={activationModalOpen}
        closeAfterTransition
        disableEscapeKeyDown
        disableBackdropClick
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
              One time fee of KES 120 only
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
                    placeholder="+254712345678"
                    inputRef={phoneInputRef}
                    aria-label="Edit phone number"
                    sx={{ maxWidth: 200 }}
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
                  <Typography variant="body2">{phoneNumber}</Typography>
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

      {/* Main Content */}
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
          element={<Wallet />}
        />
        <Route
          path="/profile"
          element={<Profile />}
        />
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