import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

// Navigation configuration
const navItems = [
  { label: 'Home', value: '/home', icon: <HomeIcon />, ariaLabel: 'Navigate to home page' }, // Changed from '/' to '/home'
  { label: 'Rewards', value: '/rewards', icon: <CardGiftcardIcon />, ariaLabel: 'Navigate to rewards page' },
  { label: 'Wallet', value: '/wallet', icon: <AccountBalanceWalletIcon />, ariaLabel: 'Navigate to wallet page' },
  { label: 'Profile', value: '/profile', icon: <AccountCircleIcon />, ariaLabel: 'Navigate to profile page' },
];

// Pages where navbar should be hidden
const hiddenPages = ['/login', '/register'];

// Utility to get active navigation value
const getActiveValue = (pathname, navItems) => {
  return navItems.find(item => item.value === pathname)?.value || '/home'; // Default to '/home'
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Derive active navigation value
  const activeValue = useMemo(
    () => getActiveValue(location.pathname, navItems),
    [location.pathname]
  );

  // Handle navigation change
  const handleNavigation = useCallback(
    (event, newValue) => {
      // Prevent navigation if already on the route
      if (newValue === location.pathname) return;

      if (newValue === 'logout') {
        logout();
        navigate('/login');
      } else if (navItems.some(item => item.value === newValue)) {
        navigate(newValue);
      }
    },
    [navigate, logout, location.pathname]
  );

  // Hide navbar if user is not logged in or on hidden pages
  if (!user || hiddenPages.includes(location.pathname)) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}
      elevation={3}
      role="navigation"
      aria-label="Main navigation"
    >
      <BottomNavigation
        value={activeValue}
        onChange={handleNavigation}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-label': {
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            color: theme.palette.text.secondary
          },
          '& .Mui-selected': {
            '& .MuiBottomNavigationAction-label': {
              color: theme.palette.primary.main
            },
            '& .MuiSvgIcon-root': {
              color: theme.palette.primary.main
            }
          }
        }}
      >
        {navItems.map(({ label, value, icon, ariaLabel }) => (
          <BottomNavigationAction
            key={value}
            label={label}
            value={value}
            icon={icon}
            aria-label={ariaLabel}
            sx={{
              minWidth: '60px',
              padding: '6px 8px',
              '& .MuiSvgIcon-root': {
                color: theme.palette.text.secondary
              }
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default Navbar;