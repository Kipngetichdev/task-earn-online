import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { getTasks, getUserBalance, initiateWithdrawal } from '../services/firestore';

// Drawer navigation items (mirrors Navbar.js)
const drawerItems = [
  { label: 'Home', path: '/home', icon: <HomeIcon /> },
  { label: 'Rewards', path: '/rewards', icon: <CardGiftcardIcon /> },
  { label: 'Wallet', path: '/wallet', icon: <AccountBalanceWalletIcon /> },
  { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
  { label: 'Logout', path: 'logout', icon: <LogoutIcon /> }
];

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  // Fetch tasks and balance
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [tasksData, balanceData] = await Promise.all([
            getTasks(user.userId),
            getUserBalance(user.userId)
          ]);
          setTasks(tasksData);
          setBalance(balanceData);
        } catch (error) {
          setAlert({ open: true, message: 'Error fetching data: ' + error.message, severity: 'error' });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Handle drawer toggle
  const toggleDrawer = useCallback((open) => () => {
    setDrawerOpen(open);
  }, []);

  // Handle drawer navigation
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

  // Handle withdrawal
  const handleWithdraw = useCallback(async () => {
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
      setAlert({ open: true, message: 'Withdrawal failed: ' + error.message, severity: 'error' });
    }
  }, [user, balance]);

  // Handle task start (placeholder)
  const handleStartTask = useCallback((taskId) => () => {
    // Placeholder: Update task status or navigate to task page
    console.log(`Starting task: ${taskId}`);
  }, []);

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
          alignItems: 'center'
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
            Tasks Pay
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
                    fontSize: theme.typography.body1.fontSize
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ py: 2, pb: { xs: '72px', sm: '80px' } }}>
        {/* Alert for withdrawal feedback */}
        {alert.open && (
          <Alert
            severity={alert.severity}
            onClose={() => setAlert({ ...alert, open: false })}
            sx={{ mb: 2 }}
          >
            {alert.message}
          </Alert>
        )}

        {/* Balance Card */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <CardContent>
          <Typography variant="h3" gutterBottom>
              Hello {user.name || user.phone.split('@')[0]}! 👋
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

        {/* Tasks List */}
        <Typography variant="h3" gutterBottom>
          Available Tasks
        </Typography>
        {tasks.length === 0 ? (
          <Typography color="text.secondary">No tasks available.</Typography>
        ) : (
          tasks.map(task => (
            <Card
              key={task.id}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                backgroundColor: theme.palette.background.paper
              }}
            >
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography variant="body1" fontWeight="500">
                  {task.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {task.description}
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
                  Reward: KES {task.reward}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartTask(task.id)}
                  sx={{ borderRadius: 8 }}
                >
                  Start Task
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </Container>
    </Box>
  );
}

export default Home;