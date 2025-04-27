import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useState, useEffect } from 'react';
import WithdrawalModal from '../components/WithdrawalModal';
import { getUserBalance, getWithdrawalHistory, initiateWithdrawal } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (user) {
      getUserBalance(user.uid).then(setBalance);
      getWithdrawalHistory(user.uid).then(setHistory);
    }
  }, [user]);

  const handleWithdraw = async ({ phone, amount }) => {
    await initiateWithdrawal(user.uid, phone, amount);
    setBalance(balance - amount);
    setHistory([...history, { phone, amount, date: new Date().toISOString() }]);
  };

  if (!user) return <Typography align="center">Please log in to view your wallet.</Typography>;

  return (
    <Container maxWidth="sm" sx={{ py: 2, pb: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Wallet
      </Typography>
      <Typography variant="h3" color="primary.main" align="center">
        Balance: KES {balance}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        sx={{ mt: 2 }}
        onClick={() => setOpenModal(true)}
      >
        Withdraw
      </Button>
      <Typography variant="h3" sx={{ mt: 3, mb: 1 }}>
        History
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Phone</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{entry.phone}</TableCell>
              <TableCell>{entry.amount}</TableCell>
              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <WithdrawalModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onWithdraw={handleWithdraw}
      />
    </Container>
  );
}

export default Wallet;