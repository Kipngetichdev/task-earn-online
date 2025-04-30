// src/pages/Rewards.js
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { getBonuses, getWithdrawalHistory } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

// Utility to format date as "MMM YYYY" (e.g., "Jan 2025")
const formatMonth = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
};

// Aggregate data by month for charting
const aggregateDataByMonth = (bonuses, withdrawals) => {
  const dataMap = {};

  // Process bonuses
  bonuses.forEach((bonus) => {
    const month = formatMonth(bonus.dateReceived);
    if (!dataMap[month]) {
      dataMap[month] = { bonuses: 0, withdrawals: 0 };
    }
    dataMap[month].bonuses += bonus.amount;
  });

  // Process withdrawals
  withdrawals.forEach((withdrawal) => {
    const month = formatMonth(withdrawal.timestamp);
    if (!dataMap[month]) {
      dataMap[month] = { bonuses: 0, withdrawals: 0 };
    }
    dataMap[month].withdrawals += withdrawal.amount;
  });

  // Convert to chart format
  const months = Object.keys(dataMap).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA - dateB;
  });
  const bonusData = months.map((month) => dataMap[month].bonuses);
  const withdrawalData = months.map((month) => dataMap[month].withdrawals);

  return { months, bonusData, withdrawalData };
};

function Rewards({ onActivateRequest }) {
  const { user } = useAuth();
  const theme = useTheme();
  const [bonuses, setBonuses] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [tabValue, setTabValue] = useState(0); // 0: Bonuses, 1: Transactions

  // Fetch bonuses and withdrawals
  useEffect(() => {
    if (!user) {
      setAlert({
        open: true,
        message: 'Please log in to view rewards.',
        severity: 'warning',
      });
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [bonusData, withdrawalData] = await Promise.all([
          getBonuses(user.userId),
          getWithdrawalHistory(user.userId),
        ]);
        setBonuses(bonusData);
        setWithdrawals(withdrawalData);
      } catch (error) {
        setAlert({
          open: true,
          message: `Error loading data: ${error.message}`,
          severity: 'error',
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Prepare chart data
  const { months, bonusData, withdrawalData } = aggregateDataByMonth(bonuses, withdrawals);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 2, pb: 8, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Please log in to view rewards.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2, pb: 8, backgroundColor: theme.palette.background.default }}>
      {alert.open && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Typography variant="h3" align="center" gutterBottom>
        Rewards
      </Typography>
      {!user?.isActive && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your account is inactive. Please activate your account to access all features.
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{ mb: 3 }}
        aria-label="Rewards tabs"
      >
        <Tab label="Bonuses" />
        <Tab label="Transactions" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Bonuses Tab */}
          {tabValue === 0 && (
            <Card sx={{ mb: 2, borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Claimed Bonuses
                </Typography>
                {bonuses.length === 0 ? (
                  <Typography color="text.secondary">No bonuses claimed.</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table aria-label="Bonuses table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Source</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bonuses.map((bonus) => (
                          <TableRow key={bonus.id}>
                            <TableCell>{formatDate(bonus.dateReceived)}</TableCell>
                            <TableCell>{bonus.source}</TableCell>
                            <TableCell>KES {bonus.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transactions Tab */}
          {tabValue === 1 && (
            <Card sx={{ mb: 2, borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Transactions
                </Typography>
                {withdrawals.length === 0 ? (
                  <Typography color="text.secondary">No transactions made.</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table aria-label="Transactions table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Phone</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {withdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id}>
                            <TableCell>{formatDate(withdrawal.timestamp)}</TableCell>
                            <TableCell>{withdrawal.phone}</TableCell>
                            <TableCell>KES {withdrawal.amount}</TableCell>
                            <TableCell>{withdrawal.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bar Chart */}
          <Card sx={{ mt: 2, borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Financial Overview
              </Typography>
              {months.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  No data available for charting.
                </Typography>
              ) : (
                <BarChart
                  xAxis={[{ scaleType: 'band', data: months, label: 'Month' }]}
                  yAxis={[{ label: 'Amount (KES)' }]}
                  series={[
                    {
                      data: bonusData,
                      label: 'Bonuses',
                      color: theme.palette.primary.main,
                    },
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
    </Container>
  );
}

export default Rewards;