import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  Box,
  Paper,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  AccountBalanceWallet,
  MonetizationOn,
  ArrowDownward,
  History,
  BarChart as BarChartIcon,
  Info,
  Warning,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import WithdrawalModal from '../components/WithdrawalModal';
import { getUserBalance, getWithdrawalHistory, initiateWithdrawal } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

// Constants
const WITHDRAWAL_LIMIT = 1500;

// Utility to format date as "MMM YYYY" (e.g., "Jan 2025")
const formatMonth = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
};

// Aggregate withdrawal data by month for charting
const aggregateWithdrawalsByMonth = (withdrawals) => {
  const dataMap = {};

  withdrawals.forEach((withdrawal) => {
    const month = formatMonth(withdrawal.timestamp);
    if (!dataMap[month]) {
      dataMap[month] = { withdrawals: 0 };
    }
    dataMap[month].withdrawals += withdrawal.amount;
  });

  const months = Object.keys(dataMap).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA - dateB;
  });
  const withdrawalData = months.map((month) => dataMap[month].withdrawals);

  return { months, withdrawalData };
};

// Map alert severity to icons
const alertIcons = {
  info: <Info />,
  warning: <Warning />,
  error: <Error />,
  success: <CheckCircle />,
};

function Wallet({ onActivateRequest }) {
  const { user } = useAuth();
  const theme = useTheme();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(true);

  // Fetch balance and withdrawal history
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (!user?.userId) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const [balanceData, historyData] = await Promise.all([
          getUserBalance(user.userId),
          getWithdrawalHistory(user.userId),
        ]);
        if (mounted) {
          setBalance(balanceData ?? 0);
          setHistory(historyData ?? []);
        }
      } catch (error) {
        console.error('Wallet data fetch error:', error.message, error.stack);
        if (mounted) {
          setAlert({
            open: true,
            message: `Error loading wallet data: ${error.message}`,
            severity: 'error',
          });
        }
      }
      if (mounted) setLoading(false);
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Handle Withdraw button click
  const handleWithdrawClick = () => {
    if (!user?.isActive) {
      console.log('Withdraw clicked by inactive user:', user?.userId);
      setAlert({
        open: true,
        message: 'Please activate your account to withdraw funds.',
        severity: 'warning',
      });
      if (onActivateRequest) {
        setTimeout(() => {
          console.log('Triggering onActivateRequest for activation modal');
          onActivateRequest();
        }, 1000);
      } else {
        console.error('onActivateRequest callback not provided');
        setAlert({
          open: true,
          message: 'Activation required, but unable to proceed. Please try again from the Home page.',
          severity: 'error',
        });
      }
    } else if (balance < WITHDRAWAL_LIMIT) {
      console.log('Withdraw attempted with insufficient balance:', balance, 'Limit:', WITHDRAWAL_LIMIT);
      setAlert({
        open: true,
        message: `Your balance (KES ${balance}) is below the minimum withdrawal limit of KES ${WITHDRAWAL_LIMIT}. Please complete more tasks.`,
        severity: 'warning',
      });
    } else {
      console.log('Opening WithdrawalModal for active user:', user?.userId);
      setOpenModal(true);
    }
  };

  // Handle withdrawal submission from WithdrawalModal
  const handleWithdraw = async ({ phone, amount }) => {
    if (!user?.isActive) {
      console.error('Withdrawal attempted by inactive user:', user?.userId);
      setAlert({
        open: true,
        message: 'Please activate your account to withdraw funds.',
        severity: 'warning',
      });
      if (onActivateRequest) {
        setTimeout(() => {
          console.log('Triggering onActivateRequest from handleWithdraw');
          onActivateRequest();
        }, 1000);
      }
      setOpenModal(false);
      return;
    }

    if (amount < WITHDRAWAL_LIMIT) {
      console.error('Withdrawal amount below limit:', amount, 'Limit:', WITHDRAWAL_LIMIT);
      setAlert({
        open: true,
        message: `Withdrawal amount must be at least KES ${WITHDRAWAL_LIMIT}.`,
        severity: 'error',
      });
      setOpenModal(false);
      return;
    }

    if (amount <= 0 || amount > balance) {
      console.error('Invalid withdrawal amount:', amount, 'Balance:', balance);
      setAlert({
        open: true,
        message: 'Invalid withdrawal amount. Amount must be positive and not exceed your balance.',
        severity: 'error',
      });
      setOpenModal(false);
      return;
    }

    try {
      console.log('Initiating withdrawal:', { userId: user.userId, phone, amount });
      const reference = await initiateWithdrawal(user.userId, phone, amount);
      if (!reference) {
        throw new Error('Invalid withdrawal response');
      }
      console.log('Withdrawal reference:', reference);
      const [newBalance, newHistory] = await Promise.all([
        getUserBalance(user.userId),
        getWithdrawalHistory(user.userId),
      ]);
      setBalance(newBalance ?? 0);
      setHistory(newHistory ?? []);
      setAlert({
        open: true,
        message: 'Withdrawal initiated successfully. Check your phone.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Withdrawal error:', error.message, error.stack);
      setAlert({
        open: true,
        message: `Withdrawal failed: ${error.message}`,
        severity: 'error',
      });
    }
    setOpenModal(false);
  };

  // Prepare chart data
  const { months, withdrawalData } = aggregateWithdrawalsByMonth(history);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 2, pb: 8, textAlign: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <AccountBalanceWallet color="primary" />
          <Typography variant="h3" gutterBottom>
            Please log in to view your wallet.
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2, pb: 8, backgroundColor: theme.palette.background.default }}>
      {alert.open && (
        <Alert
          icon={alertIcons[alert.severity]}
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
        <AccountBalanceWallet color="primary" fontSize="large" />
        <Typography variant="h3" align="center">
          Wallet
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Card sx={{ mb: 2, borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <MonetizationOn color="primary" />
                <Typography variant="h4">Balance</Typography>
              </Stack>
              <Typography variant="h3" color="primary.main" align="center" sx={{ mb: 2 }}>
                KES {balance}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleWithdrawClick}
                disabled={balance <= 0 || loading}
                sx={{ borderRadius: 2, textTransform: 'none' }}
                startIcon={<ArrowDownward />}
              >
                Withdraw
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <History color="primary" />
                <Typography variant="h4">Withdrawal History</Typography>
              </Stack>
              {history.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  No withdrawal history available.
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="Withdrawal history table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500 }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.phone}</TableCell>
                          <TableCell>KES {entry.amount}</TableCell>
                          <TableCell>{formatMonth(entry.timestamp)}</TableCell>
                          <TableCell>{entry.status || 'Pending'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2, borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <BarChartIcon color="primary" />
                <Typography variant="h4">Withdrawal Trends</Typography>
              </Stack>
              {months.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  No withdrawal data available for charting.
                </Typography>
              ) : (
                <BarChart
                  xAxis={[{ scaleType: 'band', data: months, label: 'Month' }]}
                  yAxis={[{ label: 'Amount (KES)' }]}
                  series={[
                    {
                      data: withdrawalData,
                      label: 'Withdrawals',
                      color: theme.palette.secondary.main,
                    },
                  ]}
                  height={300}
                  margin={{ top: 20, bottom: 60, left: 60, right: 20 }}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'top', horizontal: 'middle' },
                      padding: 0,
                    },
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      <WithdrawalModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onWithdraw={handleWithdraw}
        minAmount={WITHDRAWAL_LIMIT} // Pass minimum withdrawal limit to modal
      />
    </Container>
  );
}

export default Wallet;