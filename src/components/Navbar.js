import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(newValue);
    }
  };

  // Hide navigation on login/register pages
  if (!user || ['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="Rewards" value="/rewards" icon={<CardGiftcardIcon />} />
        <BottomNavigationAction label="Wallet" value="/wallet" icon={<AccountBalanceWalletIcon />} />
        <BottomNavigationAction label="Profile" value="/profile" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

export default Navbar;